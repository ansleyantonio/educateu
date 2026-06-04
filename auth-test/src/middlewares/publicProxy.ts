import express, { Response } from "express";
import axios, { AxiosRequestConfig } from "axios";
import multer from "multer";
import FormData from "form-data";
import { Readable } from "stream";
import { RequestWithUser } from "../types";
import { sendSuccessResponse } from "../utils/responseUtils";
import { asyncWrapper } from "../utils/asyncWrapper";

// Configure multer for handling file uploads in memory
export const upload = multer({ storage: multer.memoryStorage() });

/**
 * Public proxy middleware that forwards requests to target service without authentication
 * This middleware can be used for endpoints that need to proxy requests to another service
 * without requiring user authentication
 */
export const publicProxyToTarget = asyncWrapper(
  async (req: RequestWithUser, res: Response) => {
    // Extract request details for proxying
    const url = req.originalUrl;
    const method = req.method;

    // Prepare headers - but without user context since no auth
    const headers: Record<string, string> = {};

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
  },
);
