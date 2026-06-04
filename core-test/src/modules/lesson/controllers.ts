import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { CreateLessonSchema, getLessonReqBodySchema, GetSingleLessonSchema, UpdateLessonSchema } from "./types";
import { LessonService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { create } from "axios";
import createAuditLog from "../../utils/auditlog";
import userDetails from "../../utils/userinfo";

const getLessons = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, getLessonReqBodySchema);

  const { lessons, pagination } = await LessonService.getLessons(reqBody);

  sendSuccessResponse(res, { lessons }, undefined, undefined, pagination);
};

const getLessonById = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, GetSingleLessonSchema);

  const { lesson } = await LessonService.getLessonById(reqBody);

  sendSuccessResponse(res, { lesson });
};

const createLesson = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, CreateLessonSchema);

  const lesson = await LessonService.createLesson(reqBody);

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Created lesson Title: ${reqBody.title || ""}`,
      actionType: "course_management",
      moduleId: lesson.lesson.id || "",
      courseId: lesson.lesson.id || "",
    });
  }

  sendSuccessResponse(res, lesson);
};

const updateLesson = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, UpdateLessonSchema);

  const lesson = await LessonService.updateLesson(reqBody);

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated lesson Title: ${lesson.lesson.title || ""}`,
      actionType: "course_management",
      moduleId: reqBody.id || "",
      courseId: reqBody.id || "",
    });
  }

  sendSuccessResponse(res, lesson);
};

export const LessonController = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
};
