/*
 * Admission Module Routes
 *
 * This module defines the complete routing configuration for the admission system.
 * It provides endpoints for application management, officer assignments, note handling,
 * file checking operations, interview bookings, and submission processing.
 *
 * Route Structure:
 * - / : Main application listing
 * - /profile/* : Application profile management
 * - /assigns/* : Admission officer assignment operations
 * - /notes/* : Application note management
 * - /checks/* : File checking and validation operations
 * - /bookings/* : Interview booking management
 * - /submissions/* : Application submission and outcome processing
 */

import { Router } from "express";
import { Response } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AdmissionController } from "./controllers";
import { applicationManagementRouter } from "../application-management/routes";
import { ApplicationController } from "../application-management/controllers";
import { RequestWithUser } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";
import z from "zod";
import prisma from "../../prismaClient";
import { sendSuccessResponse } from "../../utils/responseUtils";

// Main admission router handling all admission-related endpoints.
export const admissionRouter = Router();

// Root routes - Application listing with module-specific filtering
admissionRouter.post("/", asyncWrapper(AdmissionController.getApplications));

// Profile routes - Individual application management
admissionRouter.get("/profile/application/:applicationId", asyncWrapper(ApplicationController.getApplicationById));
admissionRouter.post("/profile/application/:applicationId", asyncWrapper(ApplicationController.updateApplication));
admissionRouter.get(
  "/profile/application/:applicationId/stage",
  asyncWrapper(async (req: RequestWithUser, res: Response) => {
    const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        stage: true,
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    sendSuccessResponse(res, {
      stage: application.stage,
    });
  }),
);

// Assignment routes - Admission officer management and application assignments
admissionRouter.get("/assigns/admission-officers", asyncWrapper(AdmissionController.getAdmissionOfficers));
admissionRouter.get("/assigns/application-assignments", asyncWrapper(AdmissionController.getApplicationAssignments));
admissionRouter.post(
  "/assigns/application-assignments",
  asyncWrapper(AdmissionController.assignApplicationToAdmissionOfficer),
);

// Notes routes - Application note creation and retrieval
admissionRouter.get("/notes/application", asyncWrapper(AdmissionController.getApplicationNotes));
admissionRouter.post("/notes/application", asyncWrapper(AdmissionController.createApplicationNote));

// File check routes - Document validation and status tracking
export const fileChecksRouter = Router();
admissionRouter.use("/checks", fileChecksRouter);
fileChecksRouter.get("/logs/:applicationId", asyncWrapper(AdmissionController.getFileChecks));
fileChecksRouter.get("/general-file-checks", asyncWrapper(AdmissionController.getGeneralFileChecks));
fileChecksRouter.post("/general-file-checks/:applicationId", asyncWrapper(AdmissionController.updateGeneralFileChecks));

// Booking routes - Interview scheduling and management
admissionRouter.get("/bookings/:applicationId", asyncWrapper(AdmissionController.getApplicationBookings));

// Submission routes - Application submission and final outcome processing
admissionRouter.post("/submissions/submit/:applicationId", asyncWrapper(AdmissionController.submitApplication));
admissionRouter.post("/submissions/outcome/:applicationId", asyncWrapper(AdmissionController.updateApplicationOutcome));

admissionRouter.post("/resend-outcome/:applicationId", asyncWrapper(AdmissionController.resendApplicationOutcomeEmail));
