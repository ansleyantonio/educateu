// Additional File Check Routes
//
// This module defines the routing configuration for additional file check operations.
// It extends the admission file check functionality to provide additional endpoints
// for managing application file validation and verification processes.
//
// Features:
// - Delegates file check operations to admission routes
// - Provides application retrieval endpoints
// - Integrates with admission controller functionality

import { Router } from "express";
import { fileChecksRouter } from "../admission/routes";
import { AdmissionController } from "../admission/controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AdditionalFileCheckController } from "./controllers";

// Express router for additional file check operations.
//
// This router extends the basic file check functionality by incorporating
// admission-specific file validation routes and additional application
// management endpoints.
export const additionalFileCheckRouter = Router();

// Delegate all base file check operations to the admission file checks router
additionalFileCheckRouter.use("/", fileChecksRouter);

// Additional endpoint for retrieving applications with file check context
additionalFileCheckRouter.post("/applications", asyncWrapper(AdditionalFileCheckController.getApplications));
