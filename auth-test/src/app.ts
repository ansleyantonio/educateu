// Main Express application setup and configuration
import express, { Response } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import "dotenv/config";
var cors = require("cors");

// Initialize Express application
const app = express();
// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies for incoming requests
app.use(express.json());

// Swagger documentation imports
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
// Utility imports
import { asyncWrapper } from "./utils/asyncWrapper";
// Middleware imports
import { authenticate } from "./middlewares/authenticate";
import { publicProxyToTarget, upload } from "./middlewares/publicProxy";
// import { authorize } from "./middlewares/authorize";
// import { authorize } from "./middlewares/authorize";

// Route imports
import authRoutes from "./auth/routes";
import userRoutes from "../src/user/routes";
import portalRoutes from "../src/portalCategory/routes";
import userModuleRoutes from "../src/userModule/routes";
import roleRouter from "./modules/role/routes";
import { portalsRoutes } from "./modules/portal/routes";

import { userRouter } from "./modules/user/routes";
import {
  userManagementRouter,
  userPermissionRouter,
} from "./modules/user-management/routes";
import {
  agentRouter,
  subAgentRouter,
} from "./modules/sub-agent-management/routes";
import communicationRouter from "./modules/communication/mail/routes";
import busineesDevelopmentRouter from "./modules/business-development-management/agentInfo/routes";
import facultyRouter from "./modules/faculty-management/routes";

// Type imports
import { RequestWithUser, studentRequest } from "./types";
import { AppError } from "./utils/AppError";

// External library imports
import axios, { AxiosRequestConfig } from "axios";
import multer from "multer";
import FormData from "form-data";
import { Readable } from "stream";
import puppeteer from "puppeteer";
import fs from "fs";
import os from "os";
import path from "path";
import z from "zod";

// Database and utility imports
import prisma from "./prismaClient";
import { findSourceMap } from "module";
import { sendSuccessResponse } from "./utils/responseUtils";
import { zodSafeParse } from "./utils/zodUtils";
import { authorize } from "./middlewares/authozization";
import {
  applicationManagementRouter,
  marketingLinkRoutes,
} from "./modules/marketing-link/routes";
import studentRouter from "./modules/student/routes";
import { studentAuthenticate } from "./middlewares/studentAuthenticate";
import publicBdmRoutes from "./modules/public-bdm/routes";

// Swagger configuration for API documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Educate-U Backend Core APIs",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://3.8.177.255:3333",
      },
    ],
  },
  apis: ["src/modules/agent/routes.ts"],
};

// Generate Swagger documentation and setup API docs endpoint
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Public routes (no authentication required)
app.use("/auth", authRoutes);
app.use("/auth", communicationRouter);
app.use("/public-bdm", publicBdmRoutes);
app.use("/auth-management", communicationRouter);
app.use("/user-permission", userPermissionRouter);
app.use("/student-auth", studentRouter);
app.use("/public-marketing-link", applicationManagementRouter);

app.use("/student-auth/*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use("/sub-agent", agentRouter);

app.use("/manual-payments", authRoutes);

// Public proxy endpoints (no authentication required) - Add your public proxy routes here
// Example: app.use("/public-api", upload.single("file"), publicProxyToTarget);
app.get("/uploads-public/:fileKey", publicProxyToTarget);
app.post("/uploads-public", upload.single("file"), publicProxyToTarget);
app.get("/api/v1/public/*", publicProxyToTarget);
// app.get("/api/v1/public/courses/:courseId", publicProxyToTarget);
app.use(
  "/student-portal/*",
  asyncWrapper(studentAuthenticate),
  (req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      upload.single("file")(req, res, next);
    } else {
      next();
    }
  },
  asyncWrapper(async (req: studentRequest, res: Response) => {
    // Ensure student is authenticated
    if (!req.user) {
      throw new AppError("Student not found", "UNAUTHORIZED", 401);
    }
    console.log("✅ Student ID from JWT:", req.user?.userId);

    // Get additional student info from database
    const student = await prisma.student.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        studentNo: true,
      },
    });

    if (!student) {
      throw new AppError("Student not found", "UNAUTHORIZED", 401);
    }

    // Extract request details for proxying
    const originalUrl = req.originalUrl;
    // Remove "/student-portal" prefix from the URL
    const url = originalUrl;
    const method = req.method;

    // Prepare headers with student context information
    const headers: Record<string, string> = {
      "user-id": req.user.userId,
    };

    // Configure axios request for proxying to target service
    let axiosRequestConfig: AxiosRequestConfig = {
      method,
      url: `${process.env.TARGET_URL}${url}`,
      headers,
    };

    // Check if request contains multipart/form-data with file upload
    const isMultipart = req.is("multipart/form-data") && !!req.file;

    // Handle multipart form data with file uploads
    if (
      (method === "POST" || method === "PUT" || method === "PATCH") &&
      isMultipart &&
      req.file
    ) {
      const form = new FormData();

      // Add all text fields from request body to form data
      for (const [key, value] of Object.entries(req.body)) {
        form.append(key, value);
      }

      // Add the uploaded file to form data
      form.append("file", Readable.from(req.file.buffer), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      axiosRequestConfig.data = form;
      axiosRequestConfig.headers = {
        ...headers,
        ...form.getHeaders(), // Required for proper multipart handling
      };
    } else if (method === "POST" || method === "PUT" || method === "PATCH") {
      // Handle regular JSON requests
      axiosRequestConfig.data = req.body;
      headers["Content-Type"] = "application/json";
    }

    // Execute the proxied request to target service
    const axiosResponse = await axios(axiosRequestConfig);

    // Check if response is CSV content
    const contentType = axiosResponse.headers["content-type"] || "";
    const isCSV = contentType.includes("text/csv");

    // Handle CSV responses
    if (isCSV && axiosResponse.data) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
      res.send(axiosResponse.data);
      return;
    }

    // Handle regular API responses with standardized format
    sendSuccessResponse(
      res,
      axiosResponse.data.data,
      axiosResponse.data.message,
      axiosResponse.data.statusCode,
      axiosResponse.data.pagination && axiosResponse.data.pagination,
      axiosResponse.data.meta && axiosResponse.data.meta,
    );
  }),
);
// Apply authentication middleware to all routes below
app.use(asyncWrapper(authenticate));

app.use("/marketing-link", marketingLinkRoutes);
app.use("/agent", busineesDevelopmentRouter);
app.use("/faculty", facultyRouter);
app.use("/communication", communicationRouter);

// Protected routes (authentication required)
// app.use(asyncWrapper(authorize));
app.use("/user-management", userManagementRouter);
app.use("/faculty-management", facultyRouter);
app.use("/sub-agent-management", subAgentRouter);
app.use("/business-development-management", busineesDevelopmentRouter);

// Endpoint to generate PDF from HTML agreement content
app.post(
  "/agreement",
  asyncWrapper(async (req: RequestWithUser, res: Response) => {
    // Validate request body structure
    const reqBody = zodSafeParse(
      req.body,
      z.object({
        agreement: z.string(),
      }),
    );

    const html = reqBody.agreement;

    // Create complete HTML document with styling for PDF generation
    const fullHtml = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
          }
          h1, h2, p {
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

    // Launch headless browser for PDF generation
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Load HTML content into browser page
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    // Generate PDF buffer from HTML content
    const pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
      }),
    );

    // Clean up browser resources
    await browser.close();

    // const homeDir = os.homedir();
    // const filePath = path.join(homeDir, "agreement.pdf");

    // Save PDF buffer to file (commented out - direct download instead)
    // console.log(filePath);
    // fs.writeFileSync(filePath, pdfBuffer);

    // Set response headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="document.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    // Send PDF buffer as response
    res.send(pdfBuffer);
    return;
  }),
);

// app.get("/test", (req, res) => {
//   res.json({ message: "success" });
// });

// Catch-all route handler for proxying requests to target service
app.use(
  "*",
  (req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      upload.single("file")(req, res, next);
    } else {
      next();
    }
  },
  asyncWrapper(async (req: RequestWithUser, res: Response) => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError("User not found", "UNAUTHORIZED", 401);
    }

    // Fetch user's portal category and role information
    const userPortalCategoryRole =
      await prisma.userPortalCategoryRole.findFirst({
        where: {
          userPortalCategoryId: req.user.userPortalCategoryId,
        },
        include: {
          role: true,
          userPortalCategory: true,
        },
      });

    // Extract request details for proxying
    const url = req.originalUrl;
    const method = req.method;

    // Prepare headers with user context information
    const headers: Record<string, string> = {
      "user-id": req.user.userId,
    };

    if (userPortalCategoryRole?.userPortalCategory.portalCategoryId) {
      headers["portal-category-id"] =
        userPortalCategoryRole.userPortalCategory.portalCategoryId;
    }

    if (userPortalCategoryRole?.roleId) {
      headers["role-id"] = userPortalCategoryRole.roleId;
    }

    // Configure axios request for proxying to target service
    let axiosRequestConfig: AxiosRequestConfig = {
      method,
      url: `${process.env.TARGET_URL}${url}`,
      headers,
    };

    // Check if request contains multipart/form-data with file upload
    const isMultipart = req.is("multipart/form-data") && !!req.file;

    // Handle multipart form data with file uploads
    if (
      (method === "POST" || method === "PUT" || method === "PATCH") &&
      isMultipart &&
      req.file
    ) {
      const form = new FormData();

      // Add all text fields from request body to form data
      for (const [key, value] of Object.entries(req.body)) {
        form.append(key, value);
      }

      // Add the uploaded file to form data
      form.append("file", Readable.from(req.file.buffer), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      axiosRequestConfig.data = form;
      axiosRequestConfig.headers = {
        ...headers,
        ...form.getHeaders(), // Required for proper multipart handling
      };
    } else if (method === "POST" || method === "PUT" || method === "PATCH") {
      // Handle regular JSON requests
      axiosRequestConfig.data = req.body;
      headers["Content-Type"] = "application/json";
    }

    // Execute the proxied request to target service
    const axiosResponse = await axios(axiosRequestConfig);

    // Check if response is CSV content
    const contentType = axiosResponse.headers["content-type"] || "";
    const isCSV = contentType.includes("text/csv");

    // Handle CSV responses
    if (isCSV && axiosResponse.data) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
      res.send(axiosResponse.data);
      return;
    }

    // Handle regular API responses with standardized format
    sendSuccessResponse(
      res,
      axiosResponse.data.data,
      axiosResponse.data.message,
      axiosResponse.data.statusCode,
      axiosResponse.data.pagination && axiosResponse.data.pagination,
      axiosResponse.data.meta && axiosResponse.data.meta,
    );
  }),
);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
