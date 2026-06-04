import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { CourseController } from "./controllers";

export const courseRouter = Router();

courseRouter.post("/get", asyncWrapper(CourseController.getCourses));
courseRouter.post("/create", asyncWrapper(CourseController.createCourse));
courseRouter.patch("/update", asyncWrapper(CourseController.updateCourse));
courseRouter.post("/assign-module", asyncWrapper(CourseController.assignCourseModule));
courseRouter.post("/unassign-module", asyncWrapper(CourseController.unassignCourseModule));
courseRouter.get("/:courseId", asyncWrapper(CourseController.getCourseById));
courseRouter.get("/:courseId/assigned-modules", asyncWrapper(CourseController.getAssignedModules));
courseRouter.get("/:courseId/available-modules", asyncWrapper(CourseController.getAvailableModules));
courseRouter.get("/:courseId/semesters", asyncWrapper(CourseController.getCourseSemesters));
courseRouter.post("/:courseId/update-module-index", asyncWrapper(CourseController.updateModuleIndex));
courseRouter.post("/:courseId/update-module-semester", asyncWrapper(CourseController.updateModuleSemester));
courseRouter.get("/:courseId/students", asyncWrapper(CourseController.getCourseStudents));
courseRouter.get("/audit-logs/:courseId", asyncWrapper(CourseController.getAuditLogs));
