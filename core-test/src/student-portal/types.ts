/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// Define Zod schemas for student portal requests and responses

// Response schema for student courses
export const StudentCourseResponseSchema = z.object({
  studentCourseId: z.string().uuid(),
  sessionCourseId: z.string().uuid(),
  courseType: z.string(),
  title: z.string(),
  code: z.string(),
  status: z.string(),
  courseDescription: z.string().optional(),
  studyModes: z.array(z.string()),
  durationLength: z.number(),
  totalCredits: z.number(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  sessionId: z.string().uuid(),
  sessionName: z.string(),
  sessionStartDate: z.string().datetime(),
  sessionEndDate: z.string().datetime(),
  enrolledAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  progressPercentage: z.number().min(0).max(100).optional(),
  totalLessons: z.number().optional(),
  completedLessons: z.number().optional(),
  totalStudents: z.number(),
  semesterName: z.string(),
  minimumPassingCreditsPerYear: z.number(),
  awardingBodyName: z.string().nullable(),
});

export const CourseProgressResponseSchema = z.object({
  studentCourseId: z.string().uuid(),
  sessionCourseId: z.string().uuid(),
  courseTitle: z.string(),
  quizProgress: z.object({
    completed: z.number(),
    total: z.number(),
    progress: z.string(),
  }),
  assignmentProgress: z.object({
    completed: z.number(),
    total: z.number(),
    progress: z.string(),
  }),
  overallProgress: z.object({
    completed: z.number(),
    total: z.number(),
    percentage: z.number().min(0).max(100),
  }),
});

export const GetCourseProgressResponseSchema = z.object({
  progress: z.array(CourseProgressResponseSchema),
});

export const GetStudentCourseByIdResponseSchema = z.object({
  course: StudentCourseResponseSchema,
});

export const SemesterModuleResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  code: z.string(),
  credits: z.number(),
  semester: z.number(),
  order: z.number(),
  prerequisites: z.array(z.string()).optional(),
  totalLessons: z.number(),
  completedLessons: z.number(),
  incompleteLessons: z.number(),
  completionPercentage: z.number(),
});

export const GetCourseModulesBySemesterResponseSchema = z.object({
  paidSemesters: z.record(z.boolean()),
  course: z.object({
    id: z.string().uuid(),
    title: z.string(),
    code: z.string(),
  }),
  semesters: z.array(
    z.object({
      semesterNumber: z.number(),
      moduleCount: z.number(),
      lessonCount: z.number(),
      assessmentCount: z.number(),
      modules: z.array(SemesterModuleResponseSchema),
    }),
  ),
});

export const ModuleContentResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.enum(["LESSON", "ASSESSMENT"]),
  contentType: z.string().optional(),
  lessonContentType: z.enum(["VIDEO", "PDF", "TEXT", "IMAGE", "AUDIO", "HTML", "OTHER"]).optional(),
  assessmentType: z.enum(["QUIZ", "ASSIGNMENT", "EXAM", "PROJECT", "PRACTICAL", "OTHER"]).optional(),
  description: z.string().optional(),
  duration: z.number().optional(),
  fileSize: z.number().optional(),
  paths: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  passingScore: z.number().optional(),
  totalPointsOrWeight: z.number().optional(),
  questionSize: z.number().optional(),
  isCompleted: z.boolean().optional(),
});

export const GetModuleContentsResponseSchema = z.object({
  module: z.object({
    id: z.string().uuid(),
    title: z.string(),
    code: z.string(),
    isCompleted: z.boolean(),
    completedLessons: z.number(),
    totalLessons: z.number(),
  }),
  lessons: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      isCompleted: z.boolean(),
      completedContents: z.number(),
      totalContents: z.number(),
      contents: z.array(ModuleContentResponseSchema),
    }),
  ),
});

// Schema for creating a lesson note
export const CreateLessonNoteRequestSchema = z.object({
  lessonId: z.string().uuid(),
  note: z.string().min(1).max(5000), // Limit note length to 5000 characters
  timestamp: z.number().nonnegative().optional(), // Optional timestamp for video content
});

// Schema for the response when creating a lesson note
export const CreateLessonNoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  lessonNote: z.object({
    id: z.string().uuid(),
    lessonId: z.string().uuid(),
    note: z.string(),
    timestamp: z.number().optional(),
    createdAt: z.string().datetime(),
  }),
});

export const GetStudentCoursesRequestSchema = z.object({
  status: z.enum(["INCOMPLETE", "COMPLETED"]).optional(),
  search: z.string().optional(),
});

export const GetStudentCoursesResponseSchema = z.object({
  courses: z.array(StudentCourseResponseSchema),
});

// Response schema for upcoming assessments (matches all assessments response)
export const UpcomingAssessmentResponseSchema = z.object({
  id: z.string().uuid(),
  studentCourseId: z.string().uuid(),
  sessionCourseId: z.string().uuid(),
  moduleId: z.string().uuid(),
  moduleTitle: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullable(),
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  assessmentCategory: z.string(), // QUIZ or ASSIGNMENT
  assessmentType: z.string(),
  availableStartDate: z.string().datetime(),
  availableEndDate: z.string().datetime(),
  timeLimit: z.number(),
  totalPointsOrWeight: z.number(),
  passingScore: z.number().nullable(),
  attempts: z.number(),
  status: z.string(),
  assessmentStatus: z.enum(["AVAILABLE", "LOCKED", "OVERDUE", "SUBMITTED", "GRADED", "EXPIRED"]),
});

export const GetUpcomingAssessmentsResponseSchema = z.object({
  assessments: z.array(UpcomingAssessmentResponseSchema),
});

// Request schema for creating a support request
export const CreateSupportRequestSchema = z.object({
  studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
  moduleId: z.string().uuid("Module ID must be a valid UUID").optional(),
  subject: z.string().min(1, "Subject is required").max(100, "Subject cannot exceed 100 characters"),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
});

// Request schema for getting support tickets
export const GetSupportTicketsRequestSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

// Response schema for created support request
export const SupportRequestResponseSchema = z.object({
  id: z.string().uuid(),
  tokenNo: z.string().nanoid(),
  message: z.string(),
  status: z.enum(["PENDING", "RESOLVED", "ASSIGNED", "REJECTED"]).default("PENDING"),
  stage: z.enum(["SUPPORT", "EC_REQUEST", "WITHDRAWAL"]).optional(),
  studentCourseId: z.string().uuid(),
  moduleId: z.string().optional(),
  subject: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateSupportRequestResponseSchema = z.object({
  supportRequest: SupportRequestResponseSchema,
});

export const GetSupportTicketsResponseSchema = z.object({
  supportTickets: z.array(SupportRequestResponseSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
  }),
});

// Response schema for FAQ
export const FAQResponseSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const GetFAQsResponseSchema = z.object({
  faqs: z.array(FAQResponseSchema),
});

// TypeScript types derived from Zod schemas
export type StudentCourseResponse = z.infer<typeof StudentCourseResponseSchema>;
export type GetStudentCourseByIdResponse = z.infer<typeof GetStudentCourseByIdResponseSchema>;
export type SemesterModuleResponse = z.infer<typeof SemesterModuleResponseSchema>;
export type GetCourseModulesBySemesterResponse = z.infer<typeof GetCourseModulesBySemesterResponseSchema>;
export type ModuleContentResponse = z.infer<typeof ModuleContentResponseSchema>;
export type GetModuleContentsResponse = z.infer<typeof GetModuleContentsResponseSchema>;
export type GetStudentCoursesResponse = z.infer<typeof GetStudentCoursesResponseSchema>;
export type UpcomingAssessmentResponse = z.infer<typeof UpcomingAssessmentResponseSchema>;
export type GetUpcomingAssessmentsResponse = z.infer<typeof GetUpcomingAssessmentsResponseSchema>;
export type CreateSupportRequestInput = z.infer<typeof CreateSupportRequestSchema>;
export type SupportRequestResponse = z.infer<typeof SupportRequestResponseSchema>;
export type CreateSupportRequestResponse = z.infer<typeof CreateSupportRequestResponseSchema>;
export type GetSupportTicketsResponse = z.infer<typeof GetSupportTicketsResponseSchema>;
export type FAQResponse = z.infer<typeof FAQResponseSchema>;
export type GetFAQsResponse = z.infer<typeof GetFAQsResponseSchema>;
// Schema for fetching lesson notes
export const GetLessonNotesRequestSchema = z.object({
  lessonId: z.string().uuid(),
});

export const LessonNoteResponseSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().uuid(),
  note: z.string(),
  timestamp: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const GetLessonNotesResponseSchema = z.object({
  lessonNotes: z.array(LessonNoteResponseSchema),
});

// Schema for updating a lesson note
export const UpdateLessonNoteRequestSchema = z.object({
  note: z.string().min(1).max(5000), // Updated note content
  timestamp: z.number().nonnegative().optional(), // Optional timestamp update
});

// Schema for the response when updating a lesson note
export const UpdateLessonNoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  lessonNote: LessonNoteResponseSchema,
});

// Schema for creating a discussion thread
export const CreateDiscussionThreadRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content cannot exceed 5000 characters"),
  category: z.string().min(1, "Category is required").max(100, "Category cannot exceed 100 characters"),
  sessionCourseId: z.string().uuid("Session course ID must be a valid UUID"),
});

// Schema for updating a discussion thread
export const UpdateDiscussionThreadRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters").optional(),
  content: z.string().min(1, "Content is required").max(5000, "Content cannot exceed 5000 characters").optional(),
  category: z.string().min(1, "Category is required").max(100, "Category cannot exceed 100 characters").optional(),
});

// Response schema for created discussion thread
export const DiscussionThreadResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  courseCode: z.string().optional(),
  student: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      photo: z.string().optional(),
    })
    .optional(),
  creatorType: z.enum(["STUDENT", "FACULTY"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sessionCourseId: z.string().uuid(),
  studentId: z.string().uuid().nullable(),
  facultyId: z.string().uuid().nullable(),
  likes: z.number().optional(),
  views: z.number().optional(),
});

export const CreateDiscussionThreadResponseSchema = z.object({
  discussionThread: DiscussionThreadResponseSchema,
});

export const GetDiscussionThreadResponseSchema = z.object({
  discussionThread: DiscussionThreadResponseSchema,
});

export const UpdateDiscussionThreadResponseSchema = z.object({
  discussionThread: DiscussionThreadResponseSchema,
});

export const DeleteDiscussionThreadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Schema for getting discussion threads
export const GetDiscussionThreadsRequestSchema = z.object({
  search: z.string().optional(),
  sessionCourseId: z.string().uuid().optional(),
  category: z.string().optional(),
  sortBy: z.enum(["LATEST", "POPULAR", "UNRESOLVED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const GetDiscussionThreadsResponseSchema = z.object({
  threads: z.array(DiscussionThreadResponseSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateLessonNoteInput = z.infer<typeof CreateLessonNoteRequestSchema>;
export type CreateLessonNoteResponse = z.infer<typeof CreateLessonNoteResponseSchema>;
export type GetLessonNotesInput = z.infer<typeof GetLessonNotesRequestSchema>;
export type LessonNoteResponse = z.infer<typeof LessonNoteResponseSchema>;
export type GetLessonNotesResponse = z.infer<typeof GetLessonNotesResponseSchema>;
export type UpdateLessonNoteInput = z.infer<typeof UpdateLessonNoteRequestSchema>;
export type UpdateLessonNoteResponse = z.infer<typeof UpdateLessonNoteResponseSchema>;
export type CreateDiscussionThreadInput = z.infer<typeof CreateDiscussionThreadRequestSchema>;
export type CreateDiscussionThreadResponse = z.infer<typeof CreateDiscussionThreadResponseSchema>;
export type UpdateDiscussionThreadInput = z.infer<typeof UpdateDiscussionThreadRequestSchema>;
export type GetDiscussionThreadResponse = z.infer<typeof GetDiscussionThreadResponseSchema>;
export type UpdateDiscussionThreadResponse = z.infer<typeof UpdateDiscussionThreadResponseSchema>;
export type DeleteDiscussionThreadResponse = z.infer<typeof DeleteDiscussionThreadResponseSchema>;
export type GetDiscussionThreadsInput = z.infer<typeof GetDiscussionThreadsRequestSchema>;
export type GetDiscussionThreadsResponse = z.infer<typeof GetDiscussionThreadsResponseSchema>;

// Schema for getting student assessments with filters
export const GetStudentAssessmentsRequestSchema = z.object({
  status: z.enum(["PENDING", "SUBMITTED", "GRADED", "OVERDUE", "AVAILABLE", "LOCKED", "EXPIRED"]).optional(),
  sessionCourseId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const GetStudentAssessmentsResponseSchema = z.object({
  assessments: z.array(UpcomingAssessmentResponseSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
  }),
});

export type GetStudentAssessmentsInput = z.infer<typeof GetStudentAssessmentsRequestSchema>;
export type GetStudentAssessmentsResponse = z.infer<typeof GetStudentAssessmentsResponseSchema>;

// Schema for getting assessment questions with filters
export const GetAssessmentQuestionsRequestSchema = z.object({
  correctness: z.enum(["CORRECT", "INCORRECT"]).optional(),
});

export type GetAssessmentQuestionsInput = z.infer<typeof GetAssessmentQuestionsRequestSchema>;

// Schema for starting an assessment
export const StartAssessmentRequestSchema = z.object({
  assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
  studentCourseId: z.string().uuid("Student Course ID must be a valid UUID"),
  moduleId: z.string().uuid("Module ID must be a valid UUID"),
});

// Schema for the response when starting an assessment
export const StartAssessmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  startedAt: z.string().datetime(),
  timeLimit: z.number(),
  expiresAt: z.string().datetime(),
  assessmentId: z.string().uuid(),
  studentCourseId: z.string().uuid(),
  moduleId: z.string().uuid(),
});

export type StartAssessmentInput = z.infer<typeof StartAssessmentRequestSchema>;
export type StartAssessmentResponse = z.infer<typeof StartAssessmentResponseSchema>;

// Schema for getting time remaining
export const GetTimeRemainingRequestSchema = z.object({
  assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
  studentCourseId: z.string().uuid("Student Course ID must be a valid UUID"),
  moduleId: z.string().uuid("Module ID must be a valid UUID"),
});

// Schema for the response when getting time remaining
export const GetTimeRemainingResponseSchema = z.object({
  success: z.boolean(),
  assessmentId: z.string().uuid(),
  studentCourseId: z.string().uuid(),
  moduleId: z.string().uuid(),
  startedAt: z.string().datetime().nullable(),
  timeLimit: z.number(),
  expiresAt: z.string().datetime().nullable(),
  minutesRemaining: z.number(),
  secondsRemaining: z.number(),
  isExpired: z.boolean(),
  isStarted: z.boolean(),
  attemptCount: z.number().optional(),
  maxAttempts: z.number().optional(),
});

export type GetTimeRemainingInput = z.infer<typeof GetTimeRemainingRequestSchema>;
export type GetTimeRemainingResponse = z.infer<typeof GetTimeRemainingResponseSchema>;

// Schema for creating a comment
export const CreateCommentRequestSchema = z.object({
  comment: z.string().min(1, "Comment is required").max(2000, "Comment cannot exceed 2000 characters"),
  parentCommentId: z.string().uuid().optional(), // For nested comments
});

// Schema for updating a comment
export const UpdateCommentRequestSchema = z.object({
  comment: z.string().min(1, "Comment is required").max(2000, "Comment cannot exceed 2000 characters").optional(),
});

// Response schema for created comment
export const CommentResponseSchema = z.object({
  id: z.string().uuid(),
  comment: z.string(),
  likes: z.number(),
  views: z.number(),
  commenterType: z.enum(["STUDENT", "FACULTY"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  studentId: z.string().uuid().nullable(),
  facultyId: z.string().uuid().nullable(),
  discussionThreadId: z.string().uuid(),
  parentCommentId: z.string().uuid().nullable(),
});

// Define a recursive schema for comment with replies using a function to avoid circular reference
const createCommentWithRepliesSchema = (): z.ZodSchema<unknown> =>
  z.object({
    id: z.string().uuid(),
    comment: z.string(),
    likes: z.number(),
    views: z.number(),
    commenterType: z.enum(["STUDENT", "FACULTY"]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    studentId: z.string().uuid().nullable(),
    facultyId: z.string().uuid().nullable(),
    discussionThreadId: z.string().uuid(),
    parentCommentId: z.string().uuid().nullable(),
    replies: z.array(z.lazy(() => createCommentWithRepliesSchema())).optional(),
  });

export type CommentWithRepliesType = {
  id: string;
  comment: string;
  likes: number;
  views: number;
  commenterType: "STUDENT" | "FACULTY";
  createdAt: string;
  updatedAt: string;
  studentId: string | null;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
  };
  facultyId: string | null;
  discussionThreadId: string;
  parentCommentId: string | null;
  replies?: CommentWithRepliesType[];
};

export const CommentWithRepliesResponseSchema: z.ZodSchema<CommentWithRepliesType> =
  createCommentWithRepliesSchema() as z.ZodSchema<CommentWithRepliesType>;

export const CreateCommentResponseSchema = z.object({
  comment: CommentResponseSchema,
});

export const GetCommentResponseSchema = z.object({
  comment: CommentWithRepliesResponseSchema,
});

export const UpdateCommentResponseSchema = z.object({
  comment: CommentResponseSchema,
});

export const DeleteCommentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Schema for getting comments
export const GetCommentsRequestSchema = z.object({
  search: z.string().optional(),
  parentCommentId: z.string().uuid().optional(), // To get replies to a specific comment
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const GetCommentsResponseSchema = z.object({
  comments: z.array(CommentResponseSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateCommentInput = z.infer<typeof CreateCommentRequestSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentRequestSchema>;
export type CreateCommentResponse = z.infer<typeof CreateCommentResponseSchema>;
export type GetCommentResponse = z.infer<typeof GetCommentResponseSchema>;
export type UpdateCommentResponse = z.infer<typeof UpdateCommentResponseSchema>;
export type DeleteCommentResponse = z.infer<typeof DeleteCommentResponseSchema>;
export type GetCommentsInput = z.infer<typeof GetCommentsRequestSchema>;
export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema>;
export type CommentWithRepliesResponse = z.infer<typeof CommentWithRepliesResponseSchema>;

export const CompleteLessonRequestSchema = z.object({
  lessonId: z.string().uuid("Lesson ID must be a valid UUID"),
});

export const CompleteLessonResponseSchema = z.object({
  courseProgressId: z.string().uuid(),
  lessonId: z.string().uuid(),
  status: z.enum(["INCOMPLETE", "COMPLETED"]),
  completedAt: z.string().datetime(),
});

export type CompleteLessonInput = z.infer<typeof CompleteLessonRequestSchema>;
export type CompleteLessonResponse = z.infer<typeof CompleteLessonResponseSchema>;

export const CompleteContentRequestSchema = z.object({
  studentCourseId: z.string().uuid("Student course ID must be a valid UUID"),
  contentId: z.string().uuid("Content ID must be a valid UUID"),
});

export const CompleteContentResponseSchema = z.object({
  contentId: z.string().uuid(),
  isCompleted: z.boolean(),
  completedAt: z.string().datetime(),
  lessonCompletion: z
    .object({
      lessonId: z.string().uuid(),
      isCompleted: z.boolean(),
      completedContents: z.number(),
      totalContents: z.number(),
    })
    .optional(),
  moduleCompletion: z
    .object({
      moduleId: z.string().uuid(),
      isCompleted: z.boolean(),
      completedLessons: z.number(),
      totalLessons: z.number(),
    })
    .optional(),
});

export type CompleteContentInput = z.infer<typeof CompleteContentRequestSchema>;
export type CompleteContentResponse = z.infer<typeof CompleteContentResponseSchema>;

export interface ContentProgressRecord {
  contentId: string;
  status: "INCOMPLETE" | "COMPLETED";
  completedAt: Date | null;
}

// Course Snapshot Interfaces
export interface AssessmentSnapshot {
  id: string;
  nameOrTitle: string;
  assessmentCode: string;
  assessmentCategory: "QUIZ" | "ASSIGNMENT";
  assessmentType: string;
  descriptionOrInstructions: string;
  status: string;
  dueDate?: Date | string | null;
  availableStartDate: Date | string;
  availableEndDate: Date | string;
  timeLimit: number;
  totalPointsOrWeight: number;
  weight?: number;
  passingScore?: number;
  attempts: number;
  lateSubmissions: boolean;
  questionSize?: number;
  quizQuestions?: Array<{
    id: string;
    type: string;
    questionText?: string;
    point?: number;
    options?: unknown;
    answer?: unknown;
    partialMark?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }>;
  assignmentQuestions?: Array<{
    id: string;
    questionText?: string;
    submissionType?: unknown;
    point?: number;
    rubricName?: string;
    rubricDescription?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ModuleSnapshot {
  id: string;
  title: string;
  moduleType: string;
  index: number;
  semesterNumber: number;
  moduleLessons: Array<{
    index: number;
    lesson: {
      id: string;
      title: string;
      type: string;
      estimatedTimeToComplete: number;
      lessonContents: Array<{
        index: number;
        content: {
          id: string;
          title: string;
          type: string;
          description?: string;
          paths: string[];
        };
      }>;
    };
  }>;
  moduleAssessments: Array<{
    assessment: AssessmentSnapshot;
  }>;
  contentsOrder?: Array<{
    id: string;
    type: "LESSON" | "ASSESSMENT";
  }>;
}

export interface CourseModuleItem {
  id: string;
  index: number;
  cModule: {
    id: string;
    title: string;
  };
}

export interface CourseSnapshot {
  id: string;
  title: string;
  code: string;
  courseType: string;

  modules: ModuleSnapshot[];
  awardingBody?: {
    id: string;
    name: string;
    code: string;
    abbreviation?: string;
  };

  courseModules?: CourseModuleItem[];

  studyModes?: string[];
  durationLength?: number;
  totalCredits?: number;
  minimumPassingCreditsPerYear?: number;
}

export interface GetCourseGradesResponse {
  courseId: string;
  courseTitle: string;
  semesters: Array<{
    semesterNumber: number;
    modules: Array<{
      moduleId: string;
      moduleName: string;
      earned: number;
      total: number;
      percentage: number;
    }>;
  }>;
}
