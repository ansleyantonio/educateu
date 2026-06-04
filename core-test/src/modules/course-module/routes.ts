import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { CourseModuleController } from "./controllers";
import { AssessmentController } from "../assessment/controllers";

export const courseModuleRouter = Router();

courseModuleRouter.post("/get", asyncWrapper(CourseModuleController.getCourseModule));
courseModuleRouter.post("/create", asyncWrapper(CourseModuleController.createCourseModule));
courseModuleRouter.patch("/update", asyncWrapper(CourseModuleController.updateCourseModule));
// courseModuleRouter.post("/course-course-modules/get", asyncWrapper(CourseModuleController.getCourseCourseModule));
courseModuleRouter.post("/assign-lesson", asyncWrapper(CourseModuleController.assignLessonToCourseModule));
courseModuleRouter.post("/assign-assessment", asyncWrapper(CourseModuleController.assignAssessmentToCourseModule));
courseModuleRouter.post("/unassign-lesson", asyncWrapper(CourseModuleController.unassignLessonOfCourseModule));

// Additional routes for updating specific fields of assessments
courseModuleRouter.patch(
  "/assessment/:id/late-submissions",
  asyncWrapper(AssessmentController.updateAssessmentLateSubmissions),
);
courseModuleRouter.patch("/assessment/:id/attempts", asyncWrapper(AssessmentController.updateAssessmentAttempts));

courseModuleRouter.post("/unassign-assessment", asyncWrapper(CourseModuleController.unassignAssessmentOfCourseModule));
courseModuleRouter.get("/:moduleId", asyncWrapper(CourseModuleController.getCourseModuleById));
// courseModuleRouter.get("/:moduleId/connected-courses", asyncWrapper(CourseModuleController.getAvailableLessons));
courseModuleRouter.get("/:moduleId/assigned-lessons", asyncWrapper(CourseModuleController.getAssignedLessons));
courseModuleRouter.get("/:moduleId/assigned-contents", asyncWrapper(CourseModuleController.getAssignedContents));
courseModuleRouter.get("/:moduleId/available-lessons", asyncWrapper(CourseModuleController.getAvailableLessons));
courseModuleRouter.get(
  "/:moduleId/available-assessments",
  asyncWrapper(CourseModuleController.getAvailableAssessments),
);
courseModuleRouter.post("/:moduleId/update-lessons-index", asyncWrapper(CourseModuleController.updateLessonsIndex));
courseModuleRouter.post(
  "/:moduleId/update-assessment-index",
  asyncWrapper(CourseModuleController.updateAssessmentIndex),
);
courseModuleRouter.get("/:moduleId/connected-courses", asyncWrapper(CourseModuleController.getConnectedCourses));
courseModuleRouter.get("/audit-logs/:moduleId", asyncWrapper(CourseModuleController.getAuditLogs));
