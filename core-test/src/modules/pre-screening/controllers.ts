import { Response } from "express";
import z from "zod";
import prisma from "../../prismaClient";
import { RequestWithUser } from "../../types";
import { AppError } from "../../utils/AppError";
import { getUserIdFromApplication, sendPreviewNotification, sendRealTimeData } from "../../utils/notificationService";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { PreScreeningService } from "./services";
import { preScreeningGetApplicationsReqBodySchema } from "./types";

const getApplications = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, preScreeningGetApplicationsReqBodySchema);

  const { applications, pagination } = await PreScreeningService.getApplications(reqBody);

  sendSuccessResponse(res, { applications }, undefined, undefined, pagination);
};

const setPreScreeningOutcome = async (req: RequestWithUser, res: Response) => {
  const preScreeningOutcomeEnum = z.enum([
    "DID_NOT_PICK_UP",
    "PRE_SCREENING_PASSED",
    "PRE_SCREENING_FAILED",
    "INCOMPLETE_OR_PENDING",
    "PRE_SCREENING_FAILED_2ND_TIME",
  ]);
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const reqBody = zodSafeParse(
    req.body,
    z.object({
      outcome: preScreeningOutcomeEnum,
      template: z.string().optional(),
    }),
  );

  // console.log(applicationId, reqBody);

  // fetech preScreeningHistory
  const getPreScreeningHistory = await PreScreeningService.getPreScreeningHistory(applicationId);
  // check first time failed check
  // console.log(getPreScreeningHistory);
  const isFirstTimeFailed = getPreScreeningHistory.some((item) => item.outcome === "PRE_SCREENING_FAILED");

  if (isFirstTimeFailed && reqBody.outcome === "PRE_SCREENING_FAILED") {
    throw new AppError("The application has already first time failed", "BAD_REQUEST", 400);
  }

  if (reqBody.outcome == "PRE_SCREENING_FAILED_2ND_TIME" && !isFirstTimeFailed) {
    throw new AppError("First time failed is required before setting 2nd time failed", "BAD_REQUEST", 400);
  }

  // if allready 2nd time failed  then throw error
  const isSecondTimeFailed = getPreScreeningHistory.some(
    (item) => item.outcome?.toUpperCase() === "PRE_SCREENING_FAILED_2ND_TIME",
  );
  if (isSecondTimeFailed) {
    throw new AppError("pre-screening locked", "BAD_REQUEST", 400);
  }

  const preScreeningHistory = await PreScreeningService.setPreScreeningOutcome(applicationId, reqBody, req.user.id);

  if (preScreeningHistory.outcome?.toUpperCase() === "PRE_SCREENING_PASSED") {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        credibilityStatus: "PASSED",
      },
    });
    await prisma.interview.updateMany({
      where: { applicationId },
      data: { isLockInterview: false },
    });
  }

  if (preScreeningHistory.outcome?.toUpperCase() === "PRE_SCREENING_FAILED") {
    await prisma.interview.updateMany({
      where: {
        applicationId,
        status: { in: ["SCHEDULED", "PENDING"] },
      },
      data: {
        status: "CANCELLED",
        isLockInterview: true,
      },
    });
  }

  if (preScreeningHistory.outcome?.toUpperCase() === "PRE_SCREENING_FAILED_2ND_TIME") {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        credibilityStatus: "FAILED",
      },
    });
  }

  // sendPreviewNotification({ applicationId, outcome: reqBody.outcome });

  if (reqBody.outcome == "PRE_SCREENING_FAILED_2ND_TIME") {
    // if interview status is scheduled or PENDING then cancel it
    await prisma.interview.updateMany({
      where: {
        applicationId,
        status: {
          in: ["SCHEDULED", "PENDING"],
        },
      },
      data: {
        status: "CANCELLED",
      },
    });
    // application status change to INCOMPLETE_OR_PENDING
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED", // or your desired status
      },
    });
  }
  // const applicantUserIds = await Promise.all(applicationId.map((id: string) => getUserIdFromApplication(id)));
  sendPreviewNotification({ applicationId, outcome: reqBody.outcome });
  const applicantUserIds = await getUserIdFromApplication(applicationId);
  console.log("applicantUserIds", applicantUserIds);
  sendRealTimeData({
    userIds: [req.user?.userPortalCategory?.userId || "", ...applicantUserIds].filter(Boolean) as string[],
    title: "Pre-Screening Outcome Updated",
    message: ` The pre-screening outcome for application ${applicationId} has been updated to ${reqBody.outcome}.`,
  });
  sendSuccessResponse(res, { preScreeningHistory });
};

export const PreScreeningController = {
  getApplications,
  setPreScreeningOutcome,
};
