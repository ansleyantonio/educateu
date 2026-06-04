import express from "express";
import { asyncWrapper } from "../utils/asyncWrapper";
import { Controllers } from "../controllers";
import { upload } from "../middlewares/multer";

export const configureAuthenticatedFileUploadRoutes = (app: express.Application) => {
  // Authenticated file upload routes
  // These routes require valid authentication headers (user-id, portal-category-id, role-id)
  // GET /uploads/:fileKey - Retrieve a specific file by its key
  // POST /uploads - Upload a single file (authenticated)
  app.get("/uploads/:fileKey", asyncWrapper(Controllers.getSingleFile));
  app.post("/uploads", upload.single("file"), asyncWrapper(Controllers.uploadSingleFile));
};