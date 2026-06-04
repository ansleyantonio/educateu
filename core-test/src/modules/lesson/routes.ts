import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { LessonController } from "./controllers";

export const lessonRouter = Router();

lessonRouter.post("/get", asyncWrapper(LessonController.getLessons));
lessonRouter.post("/getById", asyncWrapper(LessonController.getLessonById));
lessonRouter.post("/create", asyncWrapper(LessonController.createLesson));
lessonRouter.patch("/update", asyncWrapper(LessonController.updateLesson));
