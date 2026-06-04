import z from "zod";
import { zodSafeParse } from "../../utils/zodUtils";
import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { Response } from "express";
import { WellbeingService } from "./services";
import { wellbeingGetApplicationsReqBodySchema } from "./types";
import createAuditLog from "../../utils/auditlog";
import prisma from "../../prismaClient";

const getApplications = async (req: RequestWithUser, res: Response) => {
  // if (!req.user) {
  //   throw new Error("Unauthorized: User not found");
  // }

  const reqBody = zodSafeParse(req.body, wellbeingGetApplicationsReqBodySchema);

  const { applications, pagination } = await WellbeingService.getApplications(reqBody);

  sendSuccessResponse(res, applications, undefined, undefined, pagination);
};

const getWellbeingDocuments = async (req: RequestWithUser, res: Response) => {
  // if (!req.user) {
  //   throw new Error("Unauthorized: User not found");
  // }

  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const wellbeingDocuments = await WellbeingService.getWellbeingDocuments(applicationId);

  sendSuccessResponse(res, wellbeingDocuments);
};

const updateWellbeingCheckStatus = async (req: RequestWithUser, res: Response) => {
  // if (!req.user) {
  //   throw new Error("Unauthorized: User not found");
  // }

  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const { status } = zodSafeParse(req.body, z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) }));
  const existingWellbeing = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { wellbeingCheckStatus: true },
  });
  const application = await WellbeingService.updateWellbeingCheckStatus(applicationId, status);

  await createAuditLog({
    userId: req.user?.userPortalCategory?.userId || "",
    action: `Updated wellbeing check status from ${existingWellbeing?.wellbeingCheckStatus} to ${req.body.status}`,
    actionType: "wellbeing_management",
    moduleName: "application_management",
    courseId: applicationId || "",
  });

  sendSuccessResponse(res, application);
};

export const WellbeingController = {
  getApplications,
  getWellbeingDocuments,
  updateWellbeingCheckStatus,
};
