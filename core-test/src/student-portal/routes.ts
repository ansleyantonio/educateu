import { Router } from "express";
import {
  getStudentCourses,
  getUpcomingAssessments,
  createSupportRequest,
  getFAQs,
  getStudentCourseById,
  getCourseModulesBySemester,
  getModuleContents,
  createLessonNote,
  getLessonNotes,
  updateLessonNote,
  completeContent,
  createDiscussionThread,
  getDiscussionThread,
  getDiscussionThreads,
  updateDiscussionThread,
  deleteDiscussionThread,
  createComment,
  getComment,
  getComments,
  updateComment,
  deleteComment,
  updateCommentLikes,
  updateCommentViews,
  getAllStudentAssessments,
  getAssessmentQuestions,
  startAssessment,
  getTimeRemaining,
  submitAssessmentAnswers,
  getAssessmentResults,
  getAllGrades,
  getCourseGrades,
  getCourseProgress,
  getIndividualCourseProgress,
  getCourseModulesBySemesterWithAssessmentStatus,
  updateThreadLikes,
  updateThreadViews,
  getDashboardCardsInfo,
  getSupportTickets,
  getDiscussionStats,
  saveVideoPosition,
  getFacultiesByCModuleIdController,
} from "./controllers";
import { asyncWrapper } from "../utils/asyncWrapper";
import { Controllers } from "../controllers";
import { upload } from "../middlewares/multer";
import { studentPaymentRouter } from "./payment/routes";
import { notificationRouter } from "./notification/routes";
import { AccountsController } from "../modules/accounts/controllers";
import { bankInfoRouter } from "../modules/accounts/routes";
import { StudentPaymentController } from "./payment/controllers";

export const studentPortalRouter = Router();

// ======================
// Dashboard Page Routes
// ======================
studentPortalRouter.get("/courses", asyncWrapper(getStudentCourses)); // Get courses for the authenticated student
studentPortalRouter.get("/dashboard-stats", asyncWrapper(getDashboardCardsInfo)); // Get dashboard statistics (enrolled courses, average grade, overall progress)
studentPortalRouter.get("/upcoming-assessments", asyncWrapper(getUpcomingAssessments)); // Get upcoming assessments for the authenticated student
studentPortalRouter.post("/support-requests", asyncWrapper(createSupportRequest)); // Create a support request for the authenticated student
studentPortalRouter.get("/support-tickets", asyncWrapper(getSupportTickets)); // Get all support tickets for the authenticated student

studentPortalRouter.get("/faculties-by-cModule-id/:cModuleId", asyncWrapper(getFacultiesByCModuleIdController)); // Get all faculty members for a course module

studentPortalRouter.get("/faqs", asyncWrapper(getFAQs)); // Get all FAQs for the student

// ======================
// My Learning Courses Page Routes
// ======================
studentPortalRouter.get("/my-learning-courses/:studentCourseId", asyncWrapper(getStudentCourseById));
studentPortalRouter.get(
  "/my-learning-courses/:studentCourseId/modules-by-semester",
  asyncWrapper(getCourseModulesBySemester),
);
studentPortalRouter.get(
  "/my-learning-courses/:studentCourseId/modules-by-semester-with-status",
  asyncWrapper(getCourseModulesBySemesterWithAssessmentStatus),
);
studentPortalRouter.get(
  "/my-learning-courses/:studentCourseId/modules/:moduleId/contents",
  asyncWrapper(getModuleContents),
);
studentPortalRouter.post(
  "/my-learning-courses/:studentCourseId/modules/:moduleId/lesson-notes",
  asyncWrapper(createLessonNote),
); // Create a lesson note for a student
studentPortalRouter.get("/my-learning-courses/:studentCourseId/lesson-notes", asyncWrapper(getLessonNotes)); // Get lesson notes for a student
studentPortalRouter.patch("/my-learning-courses/:studentCourseId/lesson-notes/:noteId", asyncWrapper(updateLessonNote)); // Update a lesson note for a student
studentPortalRouter.post(
  "/my-learning-courses/:studentCourseId/contents/:contentId/complete",
  asyncWrapper(completeContent),
);
studentPortalRouter.patch(
  "/my-learning-courses/:studentCourseId/contents/:contentId/video-position",
  asyncWrapper(saveVideoPosition),
);

// ======================
// Discussion Forum Routes
// ======================
studentPortalRouter.get("/discussion-threads/stats", asyncWrapper(getDiscussionStats)); // Get discussion stats for the authenticated student
studentPortalRouter.post("/discussion-threads", asyncWrapper(createDiscussionThread)); // Create a discussion thread for the authenticated student
studentPortalRouter.get("/discussion-threads", asyncWrapper(getDiscussionThreads)); // Get discussion threads for the authenticated student
studentPortalRouter.get("/discussion-threads/:discussionThreadId", asyncWrapper(getDiscussionThread)); // Get a specific discussion thread for the authenticated student
studentPortalRouter.patch("/discussion-threads/:discussionThreadId", asyncWrapper(updateDiscussionThread)); // Update a discussion thread for the authenticated student
studentPortalRouter.delete("/discussion-threads/:discussionThreadId", asyncWrapper(deleteDiscussionThread)); // Delete a discussion thread for the authenticated student
studentPortalRouter.post("/discussion-threads/:discussionThreadId/comments", asyncWrapper(createComment)); // Create a comment on a discussion thread for the authenticated student
studentPortalRouter.get("/comments/:commentId", asyncWrapper(getComment)); // Get a specific comment for the authenticated student
studentPortalRouter.get("/discussion-threads/:discussionThreadId/comments", asyncWrapper(getComments)); // Get comments for a discussion thread for the authenticated student
studentPortalRouter.patch("/comments/:commentId", asyncWrapper(updateComment)); // Update a comment for the authenticated student
studentPortalRouter.delete("/comments/:commentId", asyncWrapper(deleteComment)); // Delete a comment for the authenticated student
studentPortalRouter.patch("/comments/:commentId/likes", asyncWrapper(updateCommentLikes)); // Update comment likes for the authenticated student

studentPortalRouter.patch("/thread/:threadId/likes", asyncWrapper(updateThreadLikes)); // Update comment likes for the authenticated student
studentPortalRouter.patch("/thread/:threadId/views", asyncWrapper(updateThreadViews)); // Update comment views for the authenticated student

studentPortalRouter.patch("/comments/:commentId/views", asyncWrapper(updateCommentViews)); // Update comment views for the authenticated student

// ======================
// Assessment Routes
// ======================
studentPortalRouter.get("/assessments", asyncWrapper(getAllStudentAssessments)); // Get all assessments for the authenticated student across all courses
studentPortalRouter.post("/assessments/:assessmentId/start", asyncWrapper(startAssessment)); // Start an assessment and record the start time
studentPortalRouter.get("/assessments/:assessmentId/time-remaining", asyncWrapper(getTimeRemaining)); // Get time remaining for an assessment
studentPortalRouter.get("/assessments/:assessmentId/questions", asyncWrapper(getAssessmentQuestions)); // Get questions for a specific assessment
studentPortalRouter.post("/assessments/:assessmentId/submit-answers", asyncWrapper(submitAssessmentAnswers)); // Submit answers for a specific assessment
studentPortalRouter.get("/assessments/:assessmentId/results", asyncWrapper(getAssessmentResults)); // Get assessment results for a specific assessment

// ======================
// payment Routes
// ======================
studentPortalRouter.use("/payment", studentPaymentRouter); // Get all payments for the authenticated student across all courses
studentPaymentRouter.get("/payment/stats", asyncWrapper(StudentPaymentController.getPaymentStats));
// ======================
// Grades Routes
// ======================
studentPortalRouter.get("/grades", asyncWrapper(getAllGrades)); // Get all grades for the authenticated student across all courses and modules
studentPortalRouter.get("/grades/:studentCourseId", asyncWrapper(getCourseGrades)); // Get grades for a specific course

studentPortalRouter.get("/course-progress", asyncWrapper(getCourseProgress));
studentPortalRouter.get("/course-progress/:studentCourseId", asyncWrapper(getIndividualCourseProgress));

// ======================
// Notification Routes
// ======================
studentPortalRouter.use("/notifications", notificationRouter);
studentPortalRouter.use("/access", bankInfoRouter);

// ======================
// Upload Routes
// ======================
studentPortalRouter.get("/uploads/:fileKey", asyncWrapper(Controllers.getSingleFile));
studentPortalRouter.post("/uploads", upload.single("file"), asyncWrapper(Controllers.uploadSingleFile));
