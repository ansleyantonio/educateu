import { RequestWithUser } from "../types";
import { Response } from "express";
import { sendSuccessResponse } from "../utils/responseUtils";
import { AppError } from "../utils/AppError";
import {
  getStudentCoursesService,
  getUpcomingAssessmentsService,
  createSupportRequestService,
  getFAQsService,
  getStudentCourseByIdService,
  getCourseModulesBySemesterService,
  getModuleContentsService,
  createLessonNoteService,
  getLessonNotesService,
  updateLessonNoteService,
  getAllStudentAssessmentsService,
  getAssessmentQuestionsService,
  submitAssessmentAnswersService,
  getAssessmentResultsService,
  getAllGradesService,
  getDashboardCardsInfoService,
  getDiscussionStatsService,
  startAssessmentService,
} from "./services";

import { getCourseModulesBySemesterWithAssessmentStatusService } from "./course-services";

import { completeContentService, saveVideoPositionService } from "./content-services";

import {
  getCourseProgressService,
  getCourseGradesService,
  getTimeRemainingService,
  getIndividualCourseProgressService,
} from "./assessment-services";
import {
  createDiscussionThreadService,
  getDiscussionThreadService,
  getDiscussionThreadsService,
  updateDiscussionThreadService,
  deleteDiscussionThreadService,
  updateThreadLikesService,
  updateThreadViewsService,
} from "./discussion-services";
import {
  createCommentService,
  getCommentService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
  updateCommentLikesService,
  updateCommentViewsService,
} from "./thread-comment-services";
import { zodSafeParse } from "../utils/zodUtils";
import {
  CreateSupportRequestSchema,
  CreateLessonNoteRequestSchema,
  GetLessonNotesRequestSchema,
  UpdateLessonNoteRequestSchema,
  CompleteLessonRequestSchema,
  CreateDiscussionThreadRequestSchema,
  GetDiscussionThreadsRequestSchema,
  UpdateDiscussionThreadRequestSchema,
  CreateCommentRequestSchema,
  UpdateCommentRequestSchema,
  GetCommentsRequestSchema,
  GetStudentCoursesRequestSchema,
  GetCourseProgressResponseSchema,
  GetStudentAssessmentsRequestSchema,
  GetAssessmentQuestionsRequestSchema,
  GetSupportTicketsRequestSchema,
  StartAssessmentRequestSchema,
} from "./types";
import { z } from "zod";
import { getSupportTicketsService } from "./support-services";
import { getFacultiesByCModuleId } from "../helpers/ensure-faculty-cModule-access";

// Get courses for the authenticated student
export const getStudentCourses = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  const { status, search } = zodSafeParse(req.query, GetStudentCoursesRequestSchema);

  const result = await getStudentCoursesService(studentId, status, search);

  sendSuccessResponse(res, result, "Student courses retrieved successfully", 200);
};

export const getCourseProgress = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  const result = await getCourseProgressService(studentId);

  sendSuccessResponse(res, result, "Course progress retrieved successfully", 200);
};

export const getIndividualCourseProgress = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  const { studentCourseId } = zodSafeParse(
    req.params,
    z.object({ studentCourseId: z.string().uuid("Invalid student course ID") }),
  );

  const result = await getIndividualCourseProgressService(studentId, studentCourseId);

  sendSuccessResponse(res, result, "Course progress retrieved successfully", 200);
};

// Get upcoming assessments for the authenticated student
export const getUpcomingAssessments = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Call the service to get the student's upcoming assessments
  const result = await getUpcomingAssessmentsService(studentId);

  sendSuccessResponse(res, result, "Upcoming assessments retrieved successfully", 200);
};

// Create a support request for the authenticated student
export const createSupportRequest = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Validate the request body
  const inputData = zodSafeParse(req.body, CreateSupportRequestSchema);

  // Call the service to create the support request
  const result = await createSupportRequestService(studentId, inputData);

  sendSuccessResponse(res, result, "Support request created successfully", 201);
};

// Get all support tickets for the authenticated student
export const getSupportTickets = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Validate the request query parameters
  const { status, search, page, pageSize } = zodSafeParse(req.query, GetSupportTicketsRequestSchema);

  // Call the service to get the support tickets with sorting
  const result = await getSupportTicketsService(studentId, status, search, page, pageSize);

  sendSuccessResponse(res, result, "Support tickets retrieved successfully", 200);
};

// Get all FAQs for the student
export const getFAQs = async (_req: RequestWithUser, res: Response) => {
  // Call the service to get all FAQs
  const result = await getFAQsService();

  sendSuccessResponse(res, result, "FAQs retrieved successfully", 200);
};

// Get a single student course by ID
export const getStudentCourseById = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Extract studentCourseId from route parameters
  const { studentCourseId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
    }),
  );

  // Get the authenticated student ID from the request
  const studentId = req.student.id;

  // Call the service function to get the student course
  const result = await getStudentCourseByIdService(studentId, studentCourseId);

  // Send success response
  sendSuccessResponse(res, result, "Student course retrieved successfully", 200);
};

// Get course modules by semester for a student
export const getCourseModulesBySemester = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Extract studentCourseId from route parameters
  const { studentCourseId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
    }),
  );

  // Get the authenticated student ID from the request
  const studentId = req.student.id;

  // Call the service function to get the course modules by semester
  const result = await getCourseModulesBySemesterService(studentId, studentCourseId);

  // Send success response
  sendSuccessResponse(res, result, "Course modules by semester retrieved successfully", 200);
};

// Get module contents (lessons and assessments) for a student
export const getModuleContents = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Extract studentCourseId and moduleId from route parameters
  const { studentCourseId, moduleId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
      moduleId: z.string().uuid("Module ID must be a valid UUID"),
    }),
  );

  // Get the authenticated student ID from the request
  const studentId = req.student.id;

  // Call the service function to get the module contents
  const result = await getModuleContentsService(studentId, studentCourseId, moduleId);

  // Send success response
  sendSuccessResponse(res, result, "Module contents retrieved successfully", 200);
};

// Create a lesson note for a student
export const createLessonNote = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Extract studentCourseId and moduleId from route parameters
  const { studentCourseId, moduleId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
      moduleId: z.string().uuid("Module ID must be a valid UUID"),
    }),
  );

  // Get the authenticated student ID from the request
  const studentId = req.student.id;

  // Validate the request body
  const { lessonId, note, timestamp } = zodSafeParse(req.body, CreateLessonNoteRequestSchema);

  // Call the service to create the lesson note
  const result = await createLessonNoteService(studentId, studentCourseId, moduleId, lessonId, note, timestamp);

  sendSuccessResponse(res, result, "Lesson note created successfully", 201);
};

// Get lesson notes for a student
export const getLessonNotes = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Extract studentCourseId from route parameters
  const { studentCourseId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
    }),
  );

  // Get the authenticated student ID from the request
  const studentId = req.student.id;

  // Validate the request query for lessonId
  const { lessonId } = zodSafeParse(req.query, GetLessonNotesRequestSchema);

  // Call the service to get the lesson notes
  const result = await getLessonNotesService(studentId, studentCourseId, lessonId);

  sendSuccessResponse(res, result, "Lesson notes retrieved successfully", 200);
};

// Update a lesson note for a student
export const updateLessonNote = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Extract studentCourseId and noteId from route parameters
  const { studentCourseId, noteId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
      noteId: z.string().uuid("Note ID must be a valid UUID"),
    }),
  );

  // Get the authenticated student ID from the request
  const studentId = req.student.id;

  // Validate the request body
  const { note, timestamp } = zodSafeParse(req.body, UpdateLessonNoteRequestSchema);

  // Call the service to update the lesson note
  const result = await updateLessonNoteService(studentId, studentCourseId, noteId, note, timestamp);

  sendSuccessResponse(res, result, "Lesson note updated successfully", 200);
};

// Create a discussion thread for the authenticated student
export const createDiscussionThread = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Validate the request body
  const inputData = zodSafeParse(req.body, CreateDiscussionThreadRequestSchema);

  // Call the service to create the discussion thread
  const result = await createDiscussionThreadService(
    studentId,
    inputData.title,
    inputData.content,
    inputData.category,
    "STUDENT",
    inputData.sessionCourseId,
  );

  sendSuccessResponse(res, result, "Discussion thread created successfully", 201);
};

// Get a specific discussion thread for the authenticated student
export const getDiscussionThread = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract discussion thread ID from route parameters
  const { discussionThreadId } = zodSafeParse(
    req.params,
    z.object({
      discussionThreadId: z.string().uuid("Discussion thread ID must be a valid UUID"),
    }),
  );

  // Call the service to get the discussion thread
  const result = await getDiscussionThreadService(studentId, discussionThreadId);

  sendSuccessResponse(res, result, "Discussion thread retrieved successfully", 200);
};

// Get discussion threads for the authenticated student
export const getDiscussionThreads = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Validate the request query parameters
  const { sessionCourseId, search, category, sortBy, page, pageSize } = zodSafeParse(
    req.query,
    GetDiscussionThreadsRequestSchema,
  );

  // Call the service to get the discussion threads with sorting
  const result = await getDiscussionThreadsService(
    studentId,
    search,
    sessionCourseId,
    category,
    sortBy,
    page,
    pageSize,
  );

  sendSuccessResponse(res, result, "Discussion threads retrieved successfully", 200);
};

// Update a discussion thread for the authenticated student
export const updateDiscussionThread = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract discussion thread ID from route parameters
  const { discussionThreadId } = zodSafeParse(
    req.params,
    z.object({
      discussionThreadId: z.string().uuid("Discussion thread ID must be a valid UUID"),
    }),
  );

  // Validate the request body
  const updateData = zodSafeParse(req.body, UpdateDiscussionThreadRequestSchema);

  // Call the service to update the discussion thread
  const result = await updateDiscussionThreadService(studentId, discussionThreadId, updateData);

  sendSuccessResponse(res, result, "Discussion thread updated successfully", 200);
};

// Delete a discussion thread for the authenticated student
export const deleteDiscussionThread = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract discussion thread ID from route parameters
  const { discussionThreadId } = zodSafeParse(
    req.params,
    z.object({
      discussionThreadId: z.string().uuid("Discussion thread ID must be a valid UUID"),
    }),
  );

  // Call the service to delete the discussion thread
  const result = await deleteDiscussionThreadService(studentId, discussionThreadId);

  sendSuccessResponse(res, result, "Discussion thread deleted successfully", 200);
};

// Update thread likes for the authenticated student
export const updateThreadLikes = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { threadId } = zodSafeParse(
    req.params,
    z.object({
      threadId: z.string().uuid("Thread ID must be a valid UUID"),
    }),
  );

  // // Call the service to update comment likes
  const result = await updateThreadLikesService(studentId, threadId);

  sendSuccessResponse(res, result.discussionThread, result.message, 200);
};

// Update Thread Views for the authenticated student
export const updateThreadViews = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { threadId } = zodSafeParse(
    req.params,
    z.object({
      threadId: z.string().uuid("Thread ID must be a valid UUID"),
    }),
  );

  // // Call the service to update comment likes
  const result = await updateThreadViewsService(studentId, threadId);

  sendSuccessResponse(res, result.discussionThread, result.message, 200);
};

// Create a comment on a discussion thread for the authenticated student
export const createComment = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract discussion thread ID from route parameters
  const { discussionThreadId } = zodSafeParse(
    req.params,
    z.object({
      discussionThreadId: z.string().uuid("Discussion thread ID must be a valid UUID"),
    }),
  );

  // Validate the request body
  const inputData = zodSafeParse(req.body, CreateCommentRequestSchema);

  // Call the service to create the comment
  const result = await createCommentService(
    studentId,
    inputData.comment,
    discussionThreadId,
    inputData.parentCommentId,
  );

  sendSuccessResponse(res, result, "Comment created successfully", 201);
};

// Get a specific comment for the authenticated student
export const getComment = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { commentId } = zodSafeParse(
    req.params,
    z.object({
      commentId: z.string().uuid("Comment ID must be a valid UUID"),
    }),
  );

  // Call the service to get the comment
  const result = await getCommentService(studentId, commentId);

  sendSuccessResponse(res, result, "Comment retrieved successfully", 200);
};

// Get comments for a discussion thread for the authenticated student
export const getComments = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract discussion thread ID from route parameters
  const { discussionThreadId } = zodSafeParse(
    req.params,
    z.object({
      discussionThreadId: z.string().uuid("Discussion thread ID must be a valid UUID"),
    }),
  );

  // Validate the request query parameters
  const { parentCommentId, search, page, pageSize } = zodSafeParse(req.query, GetCommentsRequestSchema);

  // Call the service to get the comments
  const result = await getCommentsService(studentId, discussionThreadId, search, parentCommentId, page, pageSize);

  sendSuccessResponse(res, result, "Comments retrieved successfully", 200);
};

// Update a comment for the authenticated student
export const updateComment = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { commentId } = zodSafeParse(
    req.params,
    z.object({
      commentId: z.string().uuid("Comment ID must be a valid UUID"),
    }),
  );

  // Validate the request body
  const updateData = zodSafeParse(req.body, UpdateCommentRequestSchema);

  // Call the service to update the comment
  const result = await updateCommentService(studentId, commentId, updateData);

  sendSuccessResponse(res, result, "Comment updated successfully", 200);
};

// Delete a comment for the authenticated student
export const deleteComment = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { commentId } = zodSafeParse(
    req.params,
    z.object({
      commentId: z.string().uuid("Comment ID must be a valid UUID"),
    }),
  );

  // Call the service to delete the comment
  const result = await deleteCommentService(studentId, commentId);

  sendSuccessResponse(res, result, "Comment deleted successfully", 200);
};

// Update comment likes for the authenticated student
export const updateCommentLikes = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { commentId } = zodSafeParse(
    req.params,
    z.object({
      commentId: z.string().uuid("Comment ID must be a valid UUID"),
    }),
  );

  // Call the service to update comment likes
  const result = await updateCommentLikesService(studentId, commentId);

  sendSuccessResponse(res, result?.comments, result?.message, 200);
};

// Update comment views for the authenticated student
export const updateCommentViews = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract comment ID from route parameters
  const { commentId } = zodSafeParse(
    req.params,
    z.object({
      commentId: z.string().uuid("Comment ID must be a valid UUID"),
    }),
  );

  // Call the service to update comment views
  const result = await updateCommentViewsService(studentId, commentId);

  sendSuccessResponse(res, result.comments, result.message, 200);
};

// Get all assessments for the authenticated student across all courses
export const getAllStudentAssessments = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Validate the request query parameters
  const { status, sessionCourseId, page, pageSize } = zodSafeParse(req.query, GetStudentAssessmentsRequestSchema);

  // Call the service to get all assessments for the student with filters
  const result = await getAllStudentAssessmentsService(studentId, status, sessionCourseId, page, pageSize);

  sendSuccessResponse(res, result, "Student assessments retrieved successfully", 200);
};

// Get course modules by semester with assessment status for the authenticated student
export const getCourseModulesBySemesterWithAssessmentStatus = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;
  const { studentCourseId } = zodSafeParse(req.params, z.object({ studentCourseId: z.string().uuid() }));

  const result = await getCourseModulesBySemesterWithAssessmentStatusService(studentId, studentCourseId);

  sendSuccessResponse(res, result, "Course modules with assessment status retrieved successfully", 200);
};

// Get questions for a specific assessment
export const getAssessmentQuestions = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract assessment ID from route parameters
  const { assessmentId } = zodSafeParse(
    req.params,
    z.object({
      assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
    }),
  );

  // Get studentCourseId from query params - required to know which course context
  const { studentCourseId } = zodSafeParse(
    req.query,
    z.object({
      studentCourseId: z.string().uuid("Student Course ID must be a valid UUID"),
    }),
  );

  // Validate the request query parameters
  const { correctness } = zodSafeParse(req.query, GetAssessmentQuestionsRequestSchema);

  // Get moduleId from query params - required to uniquely identify assessment instance
  const { moduleId } = zodSafeParse(
    req.query,
    z.object({
      moduleId: z.string().uuid("Module ID must be a valid UUID"),
    }),
  );

  // Call the service to get the assessment questions with filters
  const result = await getAssessmentQuestionsService(studentId, studentCourseId, assessmentId, moduleId, correctness);

  sendSuccessResponse(res, result, "Assessment questions retrieved successfully", 200);
};

// Start an assessment and record the start time
export const startAssessment = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract assessment ID from request parameters
  const { assessmentId } = zodSafeParse(
    req.params,
    z.object({
      assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
    }),
  );

  // Validate the request body
  const { studentCourseId, moduleId } = zodSafeParse(req.body, StartAssessmentRequestSchema);

  // Call the service to start the assessment and record the start time
  const result = await startAssessmentService(studentId, studentCourseId, assessmentId, moduleId);

  sendSuccessResponse(res, result, "Assessment started successfully", 200);
};

// Get time remaining for an assessment
export const getTimeRemaining = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract assessment ID from request parameters
  const { assessmentId } = zodSafeParse(
    req.params,
    z.object({
      assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
    }),
  );

  // Get studentCourseId and moduleId from query params
  const { studentCourseId, moduleId } = zodSafeParse(
    req.query,
    z.object({
      studentCourseId: z.string().uuid("Student Course ID must be a valid UUID"),
      moduleId: z.string().uuid("Module ID must be a valid UUID"),
    }),
  );

  // Call the service to get time remaining
  const result = await getTimeRemainingService(studentId, studentCourseId, assessmentId, moduleId);

  sendSuccessResponse(res, result, "Time remaining retrieved successfully", 200);
};

// Submit answers for a specific assessment
export const submitAssessmentAnswers = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract assessment ID and studentCourseId from request
  const { assessmentId } = zodSafeParse(
    req.params,
    z.object({
      assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
    }),
  );

  // Get studentCourseId from query params - required to know which course context
  const { studentCourseId } = zodSafeParse(
    req.query,
    z.object({
      studentCourseId: z.string().uuid("Student Course ID must be a valid UUID"),
    }),
  );

  // Validate the request body - allow flexible answer types at the controller level
  // More specific validation will happen in the service based on assessment category
  const { answers } = zodSafeParse(
    req.body,
    z.object({
      answers: z.array(
        z.object({
          questionId: z.string().uuid("Question ID must be a valid UUID"),
          answer: z
            .union([
              z.string(), // For FILL_BLANK, TRUE_FALSE, SHORT_ANSWER, ESSAY
              z.boolean(), // For TRUE_FALSE
              z.array(z.string()), // For MULTIPLE_SELECT, SHORT_ANSWER with multiple acceptable answers, ASSIGNMENT
              z
                .object({
                  leftSideId: z.string(),
                  rightSideId: z.string(),
                })
                .array(), // For MATCHING
              z.object({
                correctValue: z.number(),
                tolerance: z.number().optional(),
              }), // For NUMERICAL_ENTRY
              z.array(z.union([z.string(), z.number()])), // For ORDERING
            ])
            .optional(), // Optional to allow saving questions without answers
        }),
      ),
    }),
  );

  // Get moduleId from query params - required to uniquely identify assessment instance
  const { moduleId } = zodSafeParse(
    req.query,
    z.object({
      moduleId: z.string().uuid("Module ID must be a valid UUID"),
    }),
  );

  // Call the service to submit the assessment answers
  const result = await submitAssessmentAnswersService(studentId, studentCourseId, assessmentId, moduleId, answers);

  sendSuccessResponse(res, result, "Assessment answers submitted successfully", 200);
};

// Get assessment results for a specific assessment
export const getAssessmentResults = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  // Get the student ID from the authenticated student
  const studentId = req.student.id;

  // Extract assessment ID from route parameters
  const { assessmentId } = zodSafeParse(
    req.params,
    z.object({
      assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
    }),
  );

  // Get studentCourseId from query params - required to know which course context
  const { studentCourseId } = zodSafeParse(
    req.query,
    z.object({
      studentCourseId: z.string().uuid("Student Course ID must be a valid UUID"),
    }),
  );

  // Get moduleId from query params - required to uniquely identify assessment instance
  const { moduleId } = zodSafeParse(
    req.query,
    z.object({
      moduleId: z.string().uuid("Module ID must be a valid UUID"),
    }),
  );

  // Call the service to get the assessment results
  const result = await getAssessmentResultsService(studentId, studentCourseId, assessmentId, moduleId);

  sendSuccessResponse(res, result, "Assessment results retrieved successfully", 200);
};

// Get all grades for the authenticated student across all courses and modules
export const getAllGrades = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  const result = await getAllGradesService(studentId);

  sendSuccessResponse(res, result, "All grades retrieved successfully", 200);
};

export const getCourseGrades = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;
  const { studentCourseId } = req.params;

  if (!studentCourseId) {
    throw new AppError("Student course ID is required", "BAD_REQUEST", 400);
  }

  const result = await getCourseGradesService(studentId, studentCourseId);

  sendSuccessResponse(res, result, "Course grades retrieved successfully", 200);
};

export const completeContent = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }
  const studentId = req.student.id;

  const { studentCourseId, contentId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
      contentId: z.string().uuid("Content ID must be a valid UUID"),
    }),
  );

  const result = await completeContentService(studentId, studentCourseId, contentId);

  sendSuccessResponse(res, result, "Content marked as completed successfully", 200);
};

export const saveVideoPosition = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }
  const studentId = req.student.id;

  const { studentCourseId, contentId } = zodSafeParse(
    req.params,
    z.object({
      studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
      contentId: z.string().uuid("Content ID must be a valid UUID"),
    }),
  );

  const { position } = zodSafeParse(
    req.body,
    z.object({
      position: z.number().int().min(0, "Position must be a non-negative integer"),
    }),
  );

  const result = await saveVideoPositionService(studentId, studentCourseId, contentId, position);

  sendSuccessResponse(res, result, "Video position saved successfully", 200);
};

// Get all cards for the authenticated student
export const getDashboardCardsInfo = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  // Call the service to get all cards for the student
  const result = await getDashboardCardsInfoService(studentId);

  sendSuccessResponse(res, result, "All Dashboard Cards retrieved successfully", 200);
};

// Get discussion stats for the authenticated student
export const getDiscussionStats = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  const result = await getDiscussionStatsService(studentId);

  sendSuccessResponse(res, result, "Discussion stats retrieved successfully", 200);
};

// Get all faculty members for a course module
export const getFacultiesByCModuleIdController = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }
  if (!req.params.cModuleId) {
    throw new AppError("Course module ID is required", "BAD_REQUEST", 400);
  }

  // Extract course module ID from route parameters
  const { cModuleId } = zodSafeParse(
    req.params,
    z.object({
      cModuleId: z.string().uuid("Course module ID must be a valid UUID"),
    }),
  );

  // Call the service to get all faculty members for the course module
  const result = await getFacultiesByCModuleId(cModuleId);

  sendSuccessResponse(res, result, "Faculty members retrieved successfully", 200);
};

// TODO: Create a discussion thread By Faculty

// export const createDiscussionThreadByFaculty = async (req: RequestWithUser, res: Response) => {
//   // Verify that student information is attached to the request
//   if (!req.user) {
//     throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
//   }
//
//   // Get the student ID from the authenticated student
//   const userId = req.user?.userPortalCategory?.userId;
//
//   // Validate the request body
//   const inputData = zodSafeParse(req.body, CreateDiscussionThreadRequestSchema);
//
//   // Call the service to create the discussion thread
//   const result = await createDiscussionThreadService(
//     userId,
//     inputData.title,
//     inputData.content,
//     inputData.category,
//     "FACULTY",
//     inputData.sessionCourseId,
//   );
//
//   sendSuccessResponse(res, result, "Discussion thread created successfully", 201);
// };
