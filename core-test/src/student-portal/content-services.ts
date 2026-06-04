import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import { GetModuleContentsResponse, CourseSnapshot, CompleteContentResponse, ModuleSnapshot } from "./types";
import { getModuleFromSnapshot, getContentFromSnapshot } from "./utils";

type LessonContentResponse = {
  id: string;
  title: string;
  type: "LESSON";
  contentType: string;
  lessonContentType?: "VIDEO" | "PDF" | "TEXT" | "IMAGE" | "AUDIO" | "HTML" | "OTHER";
  description?: string;
  duration?: number;
  paths?: string[];
  isCompleted: boolean;
  lastPosition?: number;
};

type LessonWithCompletion = {
  id: string;
  title: string;
  isCompleted: boolean;
  completedContents: number;
  totalContents: number;
  contents: LessonContentResponse[];
};

type ContentLocation = {
  module: ModuleSnapshot;
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
  content: {
    id: string;
    title: string;
    type: string;
    description?: string;
    paths: string[];
  };
};

async function getStudentCourseWithSnapshot(studentId: string, studentCourseId: string) {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId: studentId,
    },
    select: {
      id: true,
      sessionCourse: {
        select: {
          courseSnapshot: true,
          course: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  const courseSnapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot | null;

  if (!courseSnapshot) {
    throw new AppError("Course snapshot not found", "COURSE_SNAPSHOT_NOT_FOUND", 404);
  }

  return { studentCourse, courseSnapshot };
}

export async function getCompletedContentIds(studentCourseId: string): Promise<Set<string>> {
  const progressRecords = await prisma.courseProgress.findMany({
    where: {
      studentCourseId: studentCourseId,
      status: "COMPLETED",
    },
    select: {
      contentId: true,
    },
  });

  return new Set(progressRecords.map((record) => record.contentId));
}

export async function getContentPositions(studentCourseId: string): Promise<Map<string, number>> {
  const progressRecords = await prisma.courseProgress.findMany({
    where: {
      studentCourseId: studentCourseId,
      lastPosition: {
        gt: 0,
      },
    },
    select: {
      contentId: true,
      lastPosition: true,
    },
  });

  const positionMap = new Map<string, number>();
  progressRecords.forEach((record) => {
    positionMap.set(record.contentId, record.lastPosition);
  });

  return positionMap;
}

function computeLessonCompletion(
  lesson: ContentLocation["lesson"],
  completedContentIds: Set<string>,
): { isCompleted: boolean; completedContents: number; totalContents: number } {
  const contents = lesson.lessonContents || [];
  const totalContents = contents.length;
  const completedContents = contents.filter((lc) => completedContentIds.has(lc.content.id)).length;

  return {
    isCompleted: totalContents > 0 && completedContents === totalContents,
    completedContents,
    totalContents,
  };
}

export function computeModuleCompletion(
  module: ModuleSnapshot,
  completedContentIds: Set<string>,
): { isCompleted: boolean; completedLessons: number; totalLessons: number } {
  const lessons = module.moduleLessons || [];
  const totalLessons = lessons.length;

  let completedLessons = 0;
  for (const moduleLesson of lessons) {
    const lessonCompletion = computeLessonCompletion(moduleLesson.lesson, completedContentIds);
    if (lessonCompletion.isCompleted) {
      completedLessons++;
    }
  }

  return {
    isCompleted: totalLessons > 0 && completedLessons === totalLessons,
    completedLessons,
    totalLessons,
  };
}

export async function completeContentService(
  studentId: string,
  studentCourseId: string,
  contentId: string,
): Promise<CompleteContentResponse> {
  const { courseSnapshot } = await getStudentCourseWithSnapshot(studentId, studentCourseId);

  const contentLocation = getContentFromSnapshot(courseSnapshot, contentId) as ContentLocation | null;

  if (!contentLocation) {
    throw new AppError("Content not found in course snapshot", "CONTENT_NOT_FOUND", 404);
  }

  const now = new Date();

  const progressRecord = await prisma.courseProgress.upsert({
    where: {
      studentCourseId_contentId: {
        studentCourseId: studentCourseId,
        contentId: contentId,
      },
    },
    update: {
      status: "COMPLETED",
      updatedAt: now,
    },
    create: {
      studentCourseId: studentCourseId,
      contentId: contentId,
      status: "COMPLETED",
    },
    select: {
      updatedAt: true,
    },
  });

  const completedContentIds = await getCompletedContentIds(studentCourseId);

  completedContentIds.add(contentId);

  const lessonCompletion = computeLessonCompletion(contentLocation.lesson, completedContentIds);

  const moduleCompletion = computeModuleCompletion(contentLocation.module, completedContentIds);

  const response: CompleteContentResponse = {
    contentId: contentId,
    isCompleted: true,
    completedAt: progressRecord.updatedAt.toISOString(),
  };

  if (lessonCompletion.isCompleted) {
    response.lessonCompletion = {
      lessonId: contentLocation.lesson.id,
      isCompleted: true,
      completedContents: lessonCompletion.completedContents,
      totalContents: lessonCompletion.totalContents,
    };
  }

  if (moduleCompletion.isCompleted) {
    response.moduleCompletion = {
      moduleId: contentLocation.module.id,
      isCompleted: true,
      completedLessons: moduleCompletion.completedLessons,
      totalLessons: moduleCompletion.totalLessons,
    };
  }

  return response;
}

export async function saveVideoPositionService(
  studentId: string,
  studentCourseId: string,
  contentId: string,
  position: number,
): Promise<{ contentId: string; lastPosition: number }> {
  const { courseSnapshot } = await getStudentCourseWithSnapshot(studentId, studentCourseId);

  const contentLocation = getContentFromSnapshot(courseSnapshot, contentId) as ContentLocation | null;

  if (!contentLocation) {
    throw new AppError("Content not found in course snapshot", "CONTENT_NOT_FOUND", 404);
  }

  const contentType = contentLocation.content.type?.toUpperCase();
  if (contentType !== "VIDEO") {
    throw new AppError("Content is not a video", "INVALID_CONTENT_TYPE", 400);
  }

  const now = new Date();

  const progressRecord = await prisma.courseProgress.upsert({
    where: {
      studentCourseId_contentId: {
        studentCourseId: studentCourseId,
        contentId: contentId,
      },
    },
    update: {
      lastPosition: position,
      updatedAt: now,
    },
    create: {
      studentCourseId: studentCourseId,
      contentId: contentId,
      status: "INCOMPLETE",
      lastPosition: position,
    },
    select: {
      lastPosition: true,
    },
  });

  return {
    contentId: contentId,
    lastPosition: progressRecord.lastPosition,
  };
}

export async function getModuleContentsService(
  studentId: string,
  studentCourseId: string,
  moduleId: string,
): Promise<GetModuleContentsResponse> {
  const { courseSnapshot } = await getStudentCourseWithSnapshot(studentId, studentCourseId);

  const module = getModuleFromSnapshot(courseSnapshot, moduleId);

  if (!module) {
    throw new AppError("Module not found in course snapshot", "MODULE_NOT_FOUND", 404);
  }

  const completedContentIds = await getCompletedContentIds(studentCourseId);
  const contentPositions = await getContentPositions(studentCourseId);

  const lessonsWithContents: LessonWithCompletion[] =
    module.moduleLessons?.map((item) => {
      const lesson = item.lesson;

      const contents: LessonContentResponse[] = (lesson.lessonContents || []).map((lc) => {
        const content = lc.content;
        const contentId = content.id;
        const isVideo = (content.type as string)?.toUpperCase() === "VIDEO";
        return {
          id: contentId,
          title: content.title || lesson.title,
          type: "LESSON" as const,
          contentType: lesson.type || "lesson",
          lessonContentType:
            (content.type as "VIDEO" | "PDF" | "TEXT" | "IMAGE" | "AUDIO" | "HTML" | "OTHER") || undefined,
          description: content.title || undefined,
          duration: lesson.estimatedTimeToComplete || undefined,
          paths: content.paths,
          isCompleted: completedContentIds.has(contentId),
          lastPosition: isVideo ? contentPositions.get(contentId) || 0 : undefined,
        };
      });

      const lessonCompletion = computeLessonCompletion(lesson, completedContentIds);

      return {
        id: lesson.id,
        title: lesson.title,
        isCompleted: lessonCompletion.isCompleted,
        completedContents: lessonCompletion.completedContents,
        totalContents: lessonCompletion.totalContents,
        contents,
      };
    }) || [];

  const moduleCompletion = computeModuleCompletion(module, completedContentIds);

  return {
    module: {
      id: module.id,
      title: module.title,
      code: "",
      isCompleted: moduleCompletion.isCompleted,
      completedLessons: moduleCompletion.completedLessons,
      totalLessons: moduleCompletion.totalLessons,
    },
    lessons: lessonsWithContents,
  };
}
