import { Router } from "express";
import { CourseModuleController } from "../course-module/controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AssessmentController } from "../assessment/controllers";

export const facultyCourseModuleRouter = Router();

facultyCourseModuleRouter.post("/get", asyncWrapper(CourseModuleController.getCourseModule));
facultyCourseModuleRouter.post("/create", asyncWrapper(CourseModuleController.createCourseModule));
facultyCourseModuleRouter.patch("/update", asyncWrapper(CourseModuleController.updateCourseModule));
// facultyCourseModuleRouter.post("/course-course-modules/get", asyncWrapper(CourseModuleController.getCourseCourseModule));
facultyCourseModuleRouter.post("/assign-lesson", asyncWrapper(CourseModuleController.assignLessonToCourseModule));
facultyCourseModuleRouter.post(
  "/assign-assessment",
  asyncWrapper(CourseModuleController.assignAssessmentToCourseModule),
);
facultyCourseModuleRouter.post("/unassign-lesson", asyncWrapper(CourseModuleController.unassignLessonOfCourseModule));
facultyCourseModuleRouter.post(
  "/unassign-assessment",
  asyncWrapper(CourseModuleController.unassignAssessmentOfCourseModule),
);

// Additional routes for updating specific fields of assessments
facultyCourseModuleRouter.patch(
  "/assessment/:id/late-submissions",
  asyncWrapper(AssessmentController.updateAssessmentLateSubmissions),
);
facultyCourseModuleRouter.patch(
  "/assessment/:id/attempts",
  asyncWrapper(AssessmentController.updateAssessmentAttempts),
);

facultyCourseModuleRouter.get("/:moduleId", asyncWrapper(CourseModuleController.getCourseModuleById));
// facultyCourseModuleRouter.get("/:moduleId/connected-courses", asyncWrapper(CourseModuleController.getAvailableLessons));
facultyCourseModuleRouter.get("/:moduleId/assigned-lessons", asyncWrapper(CourseModuleController.getAssignedLessons));
facultyCourseModuleRouter.get("/:moduleId/assigned-contents", asyncWrapper(CourseModuleController.getAssignedContents));
facultyCourseModuleRouter.get("/:moduleId/available-lessons", asyncWrapper(CourseModuleController.getAvailableLessons));
facultyCourseModuleRouter.get(
  "/:moduleId/available-assessments",
  asyncWrapper(CourseModuleController.getAvailableAssessments),
);
facultyCourseModuleRouter.post(
  "/:moduleId/update-lessons-index",
  asyncWrapper(CourseModuleController.updateLessonsIndex),
);
facultyCourseModuleRouter.post(
  "/:moduleId/update-assessment-index",
  asyncWrapper(CourseModuleController.updateAssessmentIndex),
);
facultyCourseModuleRouter.get("/:moduleId/connected-courses", asyncWrapper(CourseModuleController.getConnectedCourses));
facultyCourseModuleRouter.get("/audit-logs/:moduleId", asyncWrapper(CourseModuleController.getAuditLogs));

// TODO: (Faculty Discussion Thread Routes)
// export const facultyDiscussionThreadRouter = Router();
// facultyDiscussionThreadRouter.post("/discussion-threads", asyncWrapper(createDiscussionThreadByFaculty));
