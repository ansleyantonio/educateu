import express from "express";
import { configurePublicRoutes } from "./public-file-upload-routes.config";
import { configureAuthenticatedFileUploadRoutes } from "./authenticated-file-upload-routes.config";

export const configureFileUploadRoutes = (app: express.Application) => {
  configurePublicRoutes(app);
  configureAuthenticatedFileUploadRoutes(app);
};

