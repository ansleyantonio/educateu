import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";

import { AwardingBodyService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import z from "zod";
import { AwardingBodySchema, MonthEnum, RequiredDocumentEnum } from "./types";
import createAuditLog from "../../utils/auditlog";
import { AppError } from "../../utils/AppError";
import prisma from "../../prismaClient";
import { flattenObject, getFieldChanges } from "./log";

const getAwardingBodies = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(
    req.query,
    z.object({
      page: z.coerce.number().min(1).default(1),
      search: z.string().optional(),
      pageSize: z.coerce.number().min(1).default(10),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      intakePeriod: z
        .union([MonthEnum, z.array(MonthEnum)])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
      selectRequiredDocuments: z
        .union([RequiredDocumentEnum, z.array(RequiredDocumentEnum)])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    }),
  );

  const { awardingBodies, pagination } = await AwardingBodyService.getAwardingBodies(reqQuery);

  sendSuccessResponse(res, { awardingBodies }, undefined, undefined, pagination);
};

const createAwardingBody = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, AwardingBodySchema);

  const awardingBody = await AwardingBodyService.createAwardingBody({ ...reqBody });

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Created awarding body: ${awardingBody.name || ""}`,
      actionType: "awarding_body_management",
      previousValue: JSON.stringify(awardingBody),
    });
  }

  sendSuccessResponse(res, { awardingBody });
};

const updateAwardingBody = async (req: RequestWithUser, res: Response) => {
  const { awardingBodyId } = zodSafeParse(req.params, z.object({ awardingBodyId: z.string().uuid() }));

  const reqBody = zodSafeParse(req.body, AwardingBodySchema);
  const existing = await prisma.awardingBody.findUnique({
    where: { id: awardingBodyId },
  });
  if (!existing) throw new AppError("AwardingBody not found", "NOT_FOUND", 404);
  const awardingBody = await AwardingBodyService.updateAwardingBody(awardingBodyId, reqBody);
  if (req.user) {
    const flatExisting = flattenObject(existing as Record<string, unknown>);
    const flatUpdated = flattenObject(awardingBody as Record<string, unknown>); // flattened the same way

    const changes = getFieldChanges(flatExisting, flatUpdated);

    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated awarding body: ${awardingBody.name || ""}${changes}`,
      actionType: "awarding_body_management",
      previousValue: JSON.stringify(existing),
      newValue: JSON.stringify(awardingBody),
    });
  }
  sendSuccessResponse(res, { awardingBody });
};

const getAwardingBodiesById = async (req: RequestWithUser, res: Response) => {
  const { awardingBodyId } = zodSafeParse(req.params, z.object({ awardingBodyId: z.string().uuid() }));

  const awardingBody = await AwardingBodyService.getAwardingBodyById(awardingBodyId);
  sendSuccessResponse(res, { awardingBody });
};

export const AwardingBodyController = {
  getAwardingBodies,
  createAwardingBody,
  updateAwardingBody,
  getAwardingBodiesById,
};
