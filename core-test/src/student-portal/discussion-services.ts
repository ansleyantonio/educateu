import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import {
  CreateDiscussionThreadResponse,
  GetDiscussionThreadResponse,
  UpdateDiscussionThreadResponse,
  DeleteDiscussionThreadResponse,
  GetDiscussionThreadsResponse,
  UpdateDiscussionThreadInput,
} from "./types";
import { getPagination } from "../utils/paginationUtils";
import { Prisma } from "@prisma/client";

// Service function to create a discussion thread for a student
export const createDiscussionThreadService = async (
  studentId: string,
  title: string,
  content: string,
  category: string,
  creatorType: "STUDENT" | "FACULTY",
  sessionCourseId: string,
): Promise<CreateDiscussionThreadResponse> => {
  // Verify that the student is enrolled in the session course
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      studentId: studentId,
      sessionCourseId: sessionCourseId,
    },
  });

  if (!studentCourse) {
    throw new AppError(
      "Student is not enrolled in the specified session course",
      "STUDENT_NOT_ENROLLED_IN_COURSE",
      403,
    );
  }

  // Create the discussion thread in the database
  const discussionThread = await prisma.discussionThread.create({
    data: {
      title,
      content,
      category,
      creatorType,
      sessionCourseId,
      studentId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      creatorType: true,
      createdAt: true,
      updatedAt: true,
      sessionCourseId: true,
      studentId: true,
      facultyId: true,
      _count: {
        select: {
          threadLikes: true,
          threadViews: true,
        },
      },
    },
  });

  return {
    discussionThread: {
      id: discussionThread.id,
      title: discussionThread.title,
      content: discussionThread.content,
      category: discussionThread.category,
      creatorType: discussionThread.creatorType,
      createdAt: discussionThread.createdAt.toISOString(),
      updatedAt: discussionThread.updatedAt.toISOString(),
      sessionCourseId: discussionThread.sessionCourseId,
      studentId: discussionThread.studentId,
      facultyId: discussionThread.facultyId,
      likes: discussionThread._count.threadLikes,
      views: discussionThread._count.threadViews,
    },
  };
};

// Service function to get a specific discussion thread for a student
export const getDiscussionThreadService = async (
  studentId: string,
  discussionThreadId: string,
): Promise<GetDiscussionThreadResponse> => {
  // Verify that the discussion thread exists and the student has access to it
  const discussionThread = await prisma.discussionThread.findUnique({
    where: {
      id: discussionThreadId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      creatorType: true,
      createdAt: true,
      updatedAt: true,
      sessionCourseId: true,
      facultyId: true,
      sessionCourse: {
        select: { course: { select: { code: true } } },
      },
      studentId: true,
      student: {
        select: { firstName: true, lastName: true, email: true, photo: true },
      },

      _count: {
        select: {
          threadLikes: true,
          threadViews: true,
        },
      },
    },
  });

  if (!discussionThread) {
    throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
  }

  // Check if the student has access to this discussion thread
  // Either they created it or they are enrolled in the session course
  if (discussionThread.studentId !== studentId) {
    const studentCourse = await prisma.studentCourse.findFirst({
      where: {
        studentId: studentId,
        sessionCourseId: discussionThread.sessionCourseId,
      },
    });

    if (!studentCourse) {
      throw new AppError(
        "Student does not have access to this discussion thread",
        "STUDENT_NOT_ENROLLED_IN_COURSE",
        403,
      );
    }
  }

  return {
    discussionThread: {
      id: discussionThread.id,
      title: discussionThread.title,
      content: discussionThread.content,
      category: discussionThread.category,
      creatorType: discussionThread.creatorType,
      createdAt: discussionThread.createdAt.toISOString(),
      updatedAt: discussionThread.updatedAt.toISOString(),
      sessionCourseId: discussionThread.sessionCourseId,
      courseCode: discussionThread.sessionCourse?.course?.code ?? "",
      student: {
        firstName: discussionThread.student?.firstName ?? "",
        lastName: discussionThread.student?.lastName ?? "",
        email: discussionThread.student?.email ?? "",
        photo: discussionThread.student?.photo ?? "",
      },
      studentId: discussionThread.studentId,
      facultyId: discussionThread.facultyId,
      likes: discussionThread._count.threadLikes,
      views: discussionThread._count.threadViews,
    },
  };
};

// Service function to get discussion threads for a student
export const getDiscussionThreadsService = async (
  studentId: string,
  search?: string,
  sessionCourseId?: string,
  category?: string,
  sortBy?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<GetDiscussionThreadsResponse> => {
  // Build the query conditions
  const whereConditions: Prisma.DiscussionThreadWhereInput = {
    OR: [
      { studentId: studentId },
      {
        sessionCourse: {
          studentCourses: {
            some: {
              studentId: studentId,
            },
          },
        },
      },
    ],
  };

  if (sessionCourseId) {
    whereConditions.sessionCourseId = sessionCourseId;
  }

  if (category) {
    whereConditions.category = category;
  }

  // 🔍 Search filter
  if (search) {
    whereConditions.AND = [
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  // Get the threads with pagination
  const { offset: skip, limit: take } = getPagination(page, pageSize);

  // const take = page * pageSize;

  const [threads, totalCount] = await Promise.all([
    prisma.discussionThread.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        creatorType: true,
        createdAt: true,
        updatedAt: true,
        sessionCourseId: true,
        sessionCourse: {
          select: { course: { select: { code: true } } },
        },
        studentId: true,
        student: {
          select: { firstName: true, lastName: true, email: true, photo: true },
        },
        threadComments: true,
        threadLikes: { select: { studentId: true } },
        threadViews: true,
        facultyId: true,
      },
      skip,
      take,
      orderBy:
        sortBy === "POPULAR"
          ? [{ threadComments: { _count: "desc" } }, { threadLikes: { _count: "desc" } }, { createdAt: "desc" }]
          : { createdAt: "desc" },
    }),
    prisma.discussionThread.count({
      where: whereConditions,
    }),
  ]);

  // console.log(chalk.blue("Student-Id", studentId));

  // Transform the data to match the response schema
  const transformedThreads = threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    content: thread.content,
    category: thread.category,
    creatorType: thread.creatorType,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    sessionCourseId: thread.sessionCourseId,
    courseCode: thread.sessionCourse?.course?.code ?? "",
    student: {
      firstName: thread.student?.firstName ?? "",
      lastName: thread.student?.lastName ?? "",
      email: thread.student?.email ?? "",
      photo: thread.student?.photo ?? "",
    },
    studentId: thread.studentId,
    threadComments: thread.threadComments?.length,
    isInstructorComment: thread.threadComments?.some((comment) => comment.commenterType === "FACULTY"),
    facultyId: thread.facultyId,
    likes: thread.threadLikes.length,
    isLiked: thread.threadLikes.some((like) => like.studentId === studentId),
    views: thread.threadViews.length,
    isViewed: thread.threadViews.some((view) => view.studentId === studentId),
  }));

  return {
    threads: transformedThreads,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

// Service function to update a discussion thread for a student
export const updateDiscussionThreadService = async (
  studentId: string,
  discussionThreadId: string,
  updateData: UpdateDiscussionThreadInput,
): Promise<UpdateDiscussionThreadResponse> => {
  // Verify that the discussion thread exists and the student owns it
  const discussionThread = await prisma.discussionThread.findUnique({
    where: {
      id: discussionThreadId,
    },
    select: {
      id: true,
      studentId: true,
      sessionCourseId: true,
    },
  });

  if (!discussionThread) {
    throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
  }

  // Check if the student is the owner of the discussion thread
  if (discussionThread.studentId !== studentId) {
    throw new AppError("Student does not have permission to update this discussion thread", "UNAUTHORIZED", 403);
  }

  // Update the discussion thread in the database
  const updatedDiscussionThread = await prisma.discussionThread.update({
    where: {
      id: discussionThreadId,
    },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      creatorType: true,
      createdAt: true,
      updatedAt: true,
      sessionCourseId: true,
      studentId: true,
      facultyId: true,
      _count: {
        select: {
          threadLikes: true,
          threadViews: true,
        },
      },
    },
  });

  return {
    discussionThread: {
      id: updatedDiscussionThread.id,
      title: updatedDiscussionThread.title,
      content: updatedDiscussionThread.content,
      category: updatedDiscussionThread.category,
      creatorType: updatedDiscussionThread.creatorType,
      createdAt: updatedDiscussionThread.createdAt.toISOString(),
      updatedAt: updatedDiscussionThread.updatedAt.toISOString(),
      sessionCourseId: updatedDiscussionThread.sessionCourseId,
      studentId: updatedDiscussionThread.studentId,
      facultyId: updatedDiscussionThread.facultyId,
      likes: updatedDiscussionThread._count.threadLikes,
      views: updatedDiscussionThread._count.threadViews,
    },
  };
};

// Service function to delete a discussion thread for a student
export const deleteDiscussionThreadService = async (
  studentId: string,
  discussionThreadId: string,
): Promise<DeleteDiscussionThreadResponse> => {
  // Verify that the discussion thread exists and the student owns it
  const discussionThread = await prisma.discussionThread.findUnique({
    where: {
      id: discussionThreadId,
    },
    select: {
      id: true,
      studentId: true,
      sessionCourseId: true,
    },
  });

  if (!discussionThread) {
    throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
  }

  // Check if the student is the owner of the discussion thread
  if (discussionThread.studentId !== studentId) {
    throw new AppError("Student does not have permission to delete this discussion thread", "UNAUTHORIZED", 403);
  }

  // Delete the discussion thread from the database
  await prisma.discussionThread.delete({
    where: {
      id: discussionThreadId,
    },
  });

  return {
    success: true,
    message: "Discussion thread deleted successfully",
  };
};

// Service function to update thread likes
export const updateThreadLikesService = async (
  studentId: string,
  threadId: string,
): Promise<{ message: string; discussionThread: UpdateDiscussionThreadResponse }> => {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Thread exists
    const thread = await tx.discussionThread.findUnique({
      where: { id: threadId },
      select: {
        sessionCourseId: true,
        studentId: true,
      },
    });

    if (!thread) {
      throw new AppError("Thread not found", "THREAD_NOT_FOUND", 404);
    }

    // 2️⃣ Access check
    if (thread.studentId !== studentId) {
      const enrolled = await tx.studentCourse.findFirst({
        where: {
          studentId,
          sessionCourseId: thread.sessionCourseId,
        },
        select: { id: true },
      });

      if (!enrolled) {
        throw new AppError("No access", "FORBIDDEN", 403);
      }
    }

    let actionMessage: string;
    // 3️⃣ Toggle Like (SAFE)
    const removed = await tx.threadLike.deleteMany({
      where: { threadId, studentId },
    });

    if (removed.count === 0) {
      await tx.threadLike.create({ data: { threadId, studentId } });
      actionMessage = "Thread liked successfully";
    } else {
      actionMessage = "Thread unliked successfully";
    }

    // 4️⃣ Return updated counts
    const updated = await tx.discussionThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        creatorType: true,
        createdAt: true,
        updatedAt: true,
        sessionCourseId: true,
        studentId: true,
        facultyId: true,
        _count: {
          select: {
            threadComments: true,
            threadLikes: true,
            threadViews: true,
          },
        },
      },
    });

    if (!updated) throw new AppError("Thread missing", "THREAD_NOT_FOUND", 404);

    return {
      message: actionMessage,
      discussionThread: {
        discussionThread: {
          id: updated.id,
          title: updated.title,
          content: updated.content,
          category: updated.category,
          creatorType: updated.creatorType,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          sessionCourseId: updated.sessionCourseId,
          studentId: updated.studentId,
          facultyId: updated.facultyId,
          threadComments: updated._count.threadComments,
          likes: updated._count.threadLikes,
          views: updated._count.threadViews,
        },
      },
    };
  });
};

// Service function to update thread views
export const updateThreadViewsService = async (
  studentId: string,
  threadId: string,
): Promise<{ message: string; discussionThread: UpdateDiscussionThreadResponse }> => {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Thread exists
    const thread = await tx.discussionThread.findUnique({
      where: { id: threadId },
      select: {
        sessionCourseId: true,
        studentId: true,
      },
    });

    if (!thread) {
      throw new AppError("Thread not found", "THREAD_NOT_FOUND", 404);
    }

    // 2️⃣ Access check
    if (thread.studentId !== studentId) {
      const enrolled = await tx.studentCourse.findFirst({
        where: {
          studentId,
          sessionCourseId: thread.sessionCourseId,
        },
        select: { id: true },
      });

      if (!enrolled) {
        throw new AppError("No access", "FORBIDDEN", 403);
      }
    }

    let actionMessage: string;

    // 3️⃣ Add view if not already viewed
    const existingView = await tx.threadView.findUnique({
      where: {
        threadId_studentId: { threadId, studentId },
      },
    });

    if (!existingView) {
      await tx.threadView.create({ data: { threadId, studentId } });
      actionMessage = "Thread viewed successfully";
    } else {
      actionMessage = "You already viewed this thread";
    }

    // 4️⃣ Return updated counts
    const updated = await tx.discussionThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        creatorType: true,
        createdAt: true,
        updatedAt: true,
        sessionCourseId: true,
        studentId: true,
        facultyId: true,
        _count: {
          select: {
            threadComments: true,
            threadLikes: true,
            threadViews: true,
          },
        },
      },
    });

    if (!updated) throw new AppError("Thread missing", "THREAD_NOT_FOUND", 404);

    return {
      message: actionMessage,
      discussionThread: {
        discussionThread: {
          id: updated.id,
          title: updated.title,
          content: updated.content,
          category: updated.category,
          creatorType: updated.creatorType,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          sessionCourseId: updated.sessionCourseId,
          studentId: updated.studentId,
          facultyId: updated.facultyId,
          threadComments: updated._count.threadComments,
          likes: updated._count.threadLikes,
          views: updated._count.threadViews,
        },
      },
    };
  });
};
