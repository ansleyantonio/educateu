import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import {
  CreateCommentResponse,
  GetCommentResponse,
  UpdateCommentResponse,
  DeleteCommentResponse,
  GetCommentsResponse,
  UpdateCommentInput,
  CommentWithRepliesResponse,
} from "./types";
import { getPagination } from "../utils/paginationUtils";
import { Prisma } from "@prisma/client";

// Service function to create a comment on a discussion thread
export const createCommentService = async (
  studentId: string,
  comment: string,
  discussionThreadId: string,
  parentCommentId?: string,
): Promise<CreateCommentResponse> => {
  // Verify that the discussion thread exists and the student has access to it
  const discussionThread = await prisma.discussionThread.findUnique({
    where: {
      id: discussionThreadId,
    },
    select: {
      id: true,
      sessionCourseId: true,
    },
  });

  if (!discussionThread) {
    throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
  }

  // Check if the student is enrolled in the session course that contains this thread
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      studentId: studentId,
      sessionCourseId: discussionThread.sessionCourseId,
    },
  });

  if (!studentCourse) {
    throw new AppError("Student does not have access to this discussion thread", "STUDENT_NOT_ENROLLED_IN_COURSE", 403);
  }

  // If this is a reply to another comment, verify that the parent comment exists
  if (parentCommentId) {
    const parentComment = await prisma.threadComment.findUnique({
      where: {
        id: parentCommentId,
        discussionThreadId: discussionThreadId,
      },
      select: {
        id: true,
      },
    });

    if (!parentComment) {
      throw new AppError("Parent comment not found in this discussion thread", "PARENT_COMMENT_NOT_FOUND", 404);
    }
  }

  // Create the comment in the database
  const threadComment = await prisma.threadComment.create({
    data: {
      comment,
      commenterType: "STUDENT",
      studentId,
      // Don't set facultyId for student comments
      discussionThreadId,
      parentCommentId: parentCommentId || null,
    },
    select: {
      id: true,
      comment: true,
      commenterType: true,
      createdAt: true,
      updatedAt: true,
      studentId: true,
      facultyId: true,
      discussionThreadId: true,
      parentCommentId: true,
      _count: {
        select: {
          commentLikes: true,
          commentViews: true,
        },
      },
    },
  });

  return {
    comment: {
      id: threadComment.id,
      comment: threadComment.comment,
      likes: threadComment._count.commentLikes,
      views: threadComment._count.commentViews,
      commenterType: threadComment.commenterType,
      createdAt: threadComment.createdAt.toISOString(),
      updatedAt: threadComment.updatedAt.toISOString(),
      studentId: threadComment.studentId,
      facultyId: threadComment.facultyId,
      discussionThreadId: threadComment.discussionThreadId,
      parentCommentId: threadComment.parentCommentId,
    },
  };
};

// Define the type for comment with replies locally to avoid circular reference issues
type LocalCommentWithReplies = {
  id: string;
  comment: string;
  likes: number;
  views: number;
  commenterType: "STUDENT" | "FACULTY";
  createdAt: string;
  updatedAt: string;
  studentId: string | null;
  facultyId: string | null;
  discussionThreadId: string;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
  };
  parentCommentId: string | null;
  replies?: LocalCommentWithReplies[];
};

// Helper function to recursively fetch comment replies
async function getCommentReplies(commentId: string, studentId: string): Promise<LocalCommentWithReplies[]> {
  const replies = await prisma.threadComment.findMany({
    where: {
      parentCommentId: commentId,
    },
    select: {
      id: true,
      comment: true,
      commenterType: true,
      createdAt: true,
      updatedAt: true,
      studentId: true,
      student: {
        select: { firstName: true, lastName: true, email: true, photo: true },
      },
      facultyId: true,
      discussionThreadId: true,
      parentCommentId: true,
      _count: {
        select: {
          commentLikes: true,
          commentViews: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Transform replies and recursively get their replies
  const transformedReplies: LocalCommentWithReplies[] = replies.map((reply) => ({
    id: reply.id,
    comment: reply.comment,
    likes: reply._count.commentLikes,
    views: reply._count.commentViews,
    commenterType: reply.commenterType,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    studentId: reply.studentId,
    student: {
      firstName: reply.student?.firstName ?? "",
      lastName: reply.student?.lastName ?? "",
      email: reply.student?.email ?? "",
      photo: reply.student?.photo ?? "",
    },
    facultyId: reply.facultyId,
    discussionThreadId: reply.discussionThreadId,
    parentCommentId: reply.parentCommentId,
    replies: [], // Initialize empty, will populate recursively
  }));

  // Recursively fetch replies for each reply
  for (const reply of transformedReplies) {
    reply.replies = await getCommentReplies(reply.id, studentId);
  }

  return transformedReplies;
}

// Service function to get a specific comment
export const getCommentService = async (studentId: string, commentId: string): Promise<GetCommentResponse> => {
  // Get the comment from the database
  const comment = await prisma.threadComment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      comment: true,
      commenterType: true,
      createdAt: true,
      updatedAt: true,
      studentId: true,
      student: {
        select: { firstName: true, lastName: true, email: true, photo: true },
      },
      facultyId: true,
      discussionThreadId: true,
      parentCommentId: true,
      _count: {
        select: {
          commentLikes: true,
          commentViews: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", "COMMENT_NOT_FOUND", 404);
  }

  // Check if the student has access to this comment
  // Either they created it or they are enrolled in the session course
  if ((comment.studentId ?? "") !== studentId) {
    const discussionThread = await prisma.discussionThread.findUnique({
      where: {
        id: comment.discussionThreadId,
      },
      select: {
        sessionCourseId: true,
      },
    });

    if (!discussionThread) {
      throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
    }

    const studentCourse = await prisma.studentCourse.findFirst({
      where: {
        studentId: studentId,
        sessionCourseId: discussionThread.sessionCourseId,
      },
    });

    if (!studentCourse) {
      throw new AppError("Student does not have access to this comment", "STUDENT_NOT_ENROLLED_IN_COURSE", 403);
    }
  }

  // Get replies for this comment
  const replies = await getCommentReplies(commentId, studentId);

  return {
    comment: {
      id: comment.id,
      comment: comment.comment,
      likes: comment._count.commentLikes,
      views: comment._count.commentViews,
      commenterType: comment.commenterType,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      studentId: comment.studentId,
      student: {
        firstName: comment.student?.firstName ?? "",
        lastName: comment.student?.lastName ?? "",
        email: comment.student?.email ?? "",
        photo: comment.student?.photo ?? "",
      },
      facultyId: comment.facultyId,
      discussionThreadId: comment.discussionThreadId,
      parentCommentId: comment.parentCommentId,
      replies,
    },
  };
};

// Service function to get comments for a discussion thread
export const getCommentsService = async (
  studentId: string,
  discussionThreadId: string,
  search?: string,
  parentCommentId?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<GetCommentsResponse> => {
  // Verify that the discussion thread exists and the student has access to it
  const discussionThread = await prisma.discussionThread.findUnique({
    where: {
      id: discussionThreadId,
    },
    select: {
      id: true,
      sessionCourseId: true,
    },
  });

  if (!discussionThread) {
    throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
  }

  // Check if the student is enrolled in the session course that contains this thread
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      studentId: studentId,
      sessionCourseId: discussionThread.sessionCourseId,
    },
  });

  if (!studentCourse) {
    throw new AppError("Student does not have access to this discussion thread", "STUDENT_NOT_ENROLLED_IN_COURSE", 403);
  }

  // Build the query conditions
  const whereConditions: Prisma.ThreadCommentWhereInput = {
    discussionThreadId: discussionThreadId,
    parentCommentId: null, // Default to top-level comments
  };

  if (parentCommentId !== undefined) {
    whereConditions.parentCommentId = parentCommentId;
  } else {
    // If no parentCommentId is specified, get top-level comments (where parentCommentId is null)
    whereConditions.parentCommentId = null;
  }

  // 🔍 Search filter
  if (search) {
    whereConditions.AND = [
      {
        OR: [{ comment: { contains: search, mode: "insensitive" } }],
      },
    ];
  }

  // Get the comments with pagination
  const { offset: skip, limit: take } = getPagination(page, pageSize);

  const [comments, totalCount] = await Promise.all([
    prisma.threadComment.findMany({
      where: whereConditions,
      select: {
        id: true,
        comment: true,
        commenterType: true,
        createdAt: true,
        updatedAt: true,
        studentId: true,
        student: {
          select: { firstName: true, lastName: true, email: true, photo: true },
        },
        facultyId: true,
        discussionThreadId: true,
        parentCommentId: true,
        commentLikes: true,
        commentViews: true,
        replies: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.threadComment.count({
      where: whereConditions,
    }),
  ]);

  // Transform the data to match the response schema
  const transformedComments = comments.map((comment) => ({
    id: comment.id,
    comment: comment.comment,
    likes: comment.commentLikes.length,
    isLiked: comment.commentLikes.some((like) => like.studentId === studentId),
    views: comment.commentViews.length,
    isViewed: comment.commentViews.some((view) => view.studentId === studentId),
    commenterType: comment.commenterType,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    studentId: comment.studentId,
    student: {
      firstName: comment.student?.firstName ?? "",
      lastName: comment.student?.lastName ?? "",
      email: comment.student?.email ?? "",
      photo: comment.student?.photo ?? "",
    },
    facultyId: comment.facultyId,
    discussionThreadId: comment.discussionThreadId,
    parentCommentId: comment.parentCommentId,
    commentReplies: comment.replies.length,
  }));

  return {
    comments: transformedComments,
    pagination: {
      page,
      pageSize: transformedComments.length,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

// Service function to update a comment
export const updateCommentService = async (
  studentId: string,
  commentId: string,
  updateData: UpdateCommentInput,
): Promise<UpdateCommentResponse> => {
  // Verify that the comment exists and the student owns it
  const comment = await prisma.threadComment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      studentId: true,
      discussionThreadId: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", "COMMENT_NOT_FOUND", 404);
  }

  // Check if the student is the owner of the comment
  if ((comment.studentId ?? "") !== studentId) {
    throw new AppError("Student does not have permission to update this comment", "UNAUTHORIZED", 403);
  }

  // Update the comment in the database
  const updatedComment = await prisma.threadComment.update({
    where: {
      id: commentId,
    },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      comment: true,
      commenterType: true,
      createdAt: true,
      updatedAt: true,
      studentId: true,
      facultyId: true,
      discussionThreadId: true,
      parentCommentId: true,
      _count: {
        select: {
          commentLikes: true,
          commentViews: true,
        },
      },
    },
  });

  return {
    comment: {
      id: updatedComment.id,
      comment: updatedComment.comment,
      likes: updatedComment._count.commentLikes,
      views: updatedComment._count.commentViews,
      commenterType: updatedComment.commenterType,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
      studentId: updatedComment.studentId,
      facultyId: updatedComment.facultyId,
      discussionThreadId: updatedComment.discussionThreadId,
      parentCommentId: updatedComment.parentCommentId,
    },
  };
};

// Service function to delete a comment
export const deleteCommentService = async (studentId: string, commentId: string): Promise<DeleteCommentResponse> => {
  // Verify that the comment exists and the student owns it
  const comment = await prisma.threadComment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      studentId: true,
      discussionThreadId: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", "COMMENT_NOT_FOUND", 404);
  }

  // Check if the student is the owner of the comment
  if ((comment.studentId ?? "") !== studentId) {
    throw new AppError("Student does not have permission to delete this comment", "UNAUTHORIZED", 403);
  }

  // Delete the comment from the database
  await prisma.threadComment.delete({
    where: {
      id: commentId,
    },
  });

  return {
    success: true,
    message: "Comment deleted successfully",
  };
};

// Service function to update comment likes
export const updateCommentLikesService = async (
  studentId: string,
  commentId: string,
): Promise<{ message: string; comments: CommentWithRepliesResponse }> => {
  return await prisma.$transaction(async (tx) => {
    //  Comment exists
    const comment = await tx.threadComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        discussionThreadId: true,
        studentId: true,
      },
    });

    if (!comment) {
      throw new AppError("Thread not found", "THREAD_NOT_FOUND", 404);
    }

    // 2️⃣ Access check
    // Check if the student has access to this comment
    // Either they created it or they are enrolled in the session course
    if ((comment.studentId ?? "") !== studentId) {
      const discussionThread = await prisma.discussionThread.findUnique({
        where: {
          id: comment.discussionThreadId,
        },
        select: {
          sessionCourseId: true,
        },
      });

      if (!discussionThread) {
        throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
      }

      const studentCourse = await prisma.studentCourse.findFirst({
        where: {
          studentId: studentId,
          sessionCourseId: discussionThread.sessionCourseId,
        },
      });

      if (!studentCourse) {
        throw new AppError("Student does not have access to this comment", "STUDENT_NOT_ENROLLED_IN_COURSE", 403);
      }
    }

    let actionMessage: string;
    // 3️⃣ Toggle Like (SAFE)
    const removed = await tx.commentLike.deleteMany({
      where: { commentId, studentId },
    });

    if (removed.count === 0) {
      await tx.commentLike.create({ data: { commentId, studentId } });
      actionMessage = "Comment liked successfully";
    } else {
      actionMessage = "Comment unliked successfully";
    }

    // 4️⃣ Return updated counts
    const updated = await tx.threadComment.findUnique({
      where: { id: commentId },

      select: {
        id: true,
        comment: true,
        commenterType: true,
        createdAt: true,
        updatedAt: true,
        studentId: true,
        facultyId: true,
        discussionThreadId: true,
        parentCommentId: true,
        _count: {
          select: {
            commentLikes: true,
            commentViews: true,
          },
        },
      },
    });

    if (!updated) throw new AppError("Comment missing", "THREAD_NOT_FOUND", 404);

    return {
      message: actionMessage,
      comments: {
        id: updated.id,
        comment: updated.comment,
        commenterType: updated.commenterType,
        likes: updated._count.commentLikes,
        views: updated._count.commentViews,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        studentId: updated.studentId,
        facultyId: updated.facultyId,
        discussionThreadId: updated.discussionThreadId,
        parentCommentId: updated.parentCommentId,
      },
    };
  });
};

// Service function to update comment Views
export const updateCommentViewsService = async (
  studentId: string,
  commentId: string,
): Promise<{ message: string; comments: CommentWithRepliesResponse }> => {
  return await prisma.$transaction(async (tx) => {
    //  Comment exists
    const comment = await tx.threadComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        discussionThreadId: true,
        studentId: true,
      },
    });

    if (!comment) {
      throw new AppError("Thread not found", "THREAD_NOT_FOUND", 404);
    }

    // 2️⃣ Access check
    // Check if the student has access to this comment
    // Either they created it or they are enrolled in the session course
    if ((comment.studentId ?? "") !== studentId) {
      const discussionThread = await prisma.discussionThread.findUnique({
        where: {
          id: comment.discussionThreadId,
        },
        select: {
          sessionCourseId: true,
        },
      });

      if (!discussionThread) {
        throw new AppError("Discussion thread not found", "DISCUSSION_THREAD_NOT_FOUND", 404);
      }

      const studentCourse = await prisma.studentCourse.findFirst({
        where: {
          studentId: studentId,
          sessionCourseId: discussionThread.sessionCourseId,
        },
      });

      if (!studentCourse) {
        throw new AppError("Student does not have access to this comment", "STUDENT_NOT_ENROLLED_IN_COURSE", 403);
      }
    }

    let actionMessage: string;

    // 3️⃣ Add view if not already viewed
    const existingView = await tx.commentView.findUnique({
      where: {
        commentId_studentId: { commentId, studentId },
      },
    });

    if (!existingView) {
      await tx.commentView.create({ data: { commentId, studentId } });
      actionMessage = "Comment viewed successfully";
    } else {
      actionMessage = "You already viewed this comment";
    }

    // 4️⃣ Return updated counts
    const updated = await tx.threadComment.findUnique({
      where: { id: commentId },

      select: {
        id: true,
        comment: true,
        commenterType: true,
        createdAt: true,
        updatedAt: true,
        studentId: true,
        facultyId: true,
        discussionThreadId: true,
        parentCommentId: true,
        _count: {
          select: {
            commentLikes: true,
            commentViews: true,
          },
        },
      },
    });

    if (!updated) throw new AppError("Comment missing", "THREAD_NOT_FOUND", 404);

    return {
      message: actionMessage,
      comments: {
        id: updated.id,
        comment: updated.comment,
        commenterType: updated.commenterType,
        likes: updated._count.commentLikes,
        views: updated._count.commentViews,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        studentId: updated.studentId,
        facultyId: updated.facultyId,
        discussionThreadId: updated.discussionThreadId,
        parentCommentId: updated.parentCommentId,
      },
    };
  });
};
