import { Router } from "express";
import { CourseModuleController } from "../course-module/controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

export const facultyCourseLessonRouter = Router();
facultyCourseLessonRouter.post(
  "/:moduleId/update-lessons-index",
  asyncWrapper(CourseModuleController.updateLessonsIndex),
);
