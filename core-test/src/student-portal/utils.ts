import { CourseSnapshot, AssessmentSnapshot } from "./types";

/**
 * Flattens all assessments from a course snapshot into a single array
 * with module context included.
 */
export const getFlattenedAssessments = (snapshot: CourseSnapshot) => {
  const assessments: Array<{
    assessment: AssessmentSnapshot;
    moduleId?: string;
    moduleTitle?: string;
    semesterNumber?: number;
  }> = [];

  if (snapshot.modules && Array.isArray(snapshot.modules)) {
    snapshot.modules.forEach((module) => {
      if (module.moduleAssessments && Array.isArray(module.moduleAssessments)) {
        module.moduleAssessments.forEach((ma) => {
          assessments.push({
            assessment: ma.assessment,
            moduleId: module.id,
            moduleTitle: module.title,
            semesterNumber: module.semesterNumber,
          });
        });
      }
    });
  }

  return assessments;
};

/**
 * Determines the status of an assessment based on the snapshot data and student results
 */
export const getAssessmentStatus = (
  assessment: AssessmentSnapshot,
  result: { score: number | null; startedAt?: Date | null; submittedAt?: Date | null } | null,
  now: Date = new Date(),
): "GRADED" | "SUBMITTED" | "OVERDUE" | "AVAILABLE" | "LOCKED" | "EXPIRED" => {
  if (result) {
    const numericScore = result.score !== null ? Number(result.score) : null;

    if (numericScore !== null) {
      return "GRADED";
    }

    if (result.submittedAt) {
      return "SUBMITTED";
    }

    if (result.startedAt && !result.submittedAt) {
      const timeLimit = assessment.timeLimit ?? 0;
      if (hasTimeExpired(new Date(result.startedAt), timeLimit)) {
        return "EXPIRED";
      }
      return "AVAILABLE";
    }

    return "SUBMITTED";
  }

  const availableStart = new Date(assessment.availableStartDate);
  if (now < availableStart) {
    return "LOCKED";
  }

  const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;
  const availableEnd = new Date(assessment.availableEndDate);

  if (dueDate && now > dueDate) {
    return "OVERDUE";
  }

  if (!dueDate && now > availableEnd) {
    return "OVERDUE";
  }

  return "AVAILABLE";
};

/**
 * Extracts a specific module from a snapshot by ID
 */
export const getModuleFromSnapshot = (snapshot: CourseSnapshot, moduleId: string) => {
  return snapshot.modules?.find((m) => m.id === moduleId) || null;
};

/**
 * Checks if assessment time has expired
 */
export const hasTimeExpired = (startedAt: Date, timeLimitMinutes: number): boolean => {
  if (!startedAt || timeLimitMinutes <= 0) {
    return false;
  }
  const expiresAt = new Date(startedAt.getTime() + timeLimitMinutes * 60000);
  return new Date() > expiresAt;
};

/**
 * Extracts a specific lesson from a snapshot by ID
 */
export const getLessonFromSnapshot = (snapshot: CourseSnapshot, lessonId: string) => {
  if (!snapshot.modules) return null;

  for (const module of snapshot.modules) {
    const moduleLesson = module.moduleLessons?.find((ml) => ml.lesson.id === lessonId);
    if (moduleLesson) return { module, ...moduleLesson };
  }

  return null;
};

export const getContentFromSnapshot = (snapshot: CourseSnapshot, contentId: string) => {
  if (!snapshot.modules) return null;

  for (const module of snapshot.modules) {
    if (!module.moduleLessons) continue;
    for (const moduleLesson of module.moduleLessons) {
      const lessonContent = moduleLesson.lesson.lessonContents?.find((lc) => lc.content.id === contentId);
      if (lessonContent) {
        return {
          module,
          lesson: moduleLesson.lesson,
          content: lessonContent.content,
        };
      }
    }
  }

  return null;
};

export const getAllContentIdsFromSnapshot = (snapshot: CourseSnapshot): string[] => {
  const contentIds: string[] = [];

  if (!snapshot.modules) return contentIds;

  for (const module of snapshot.modules) {
    if (!module.moduleLessons) continue;
    for (const moduleLesson of module.moduleLessons) {
      if (!moduleLesson.lesson.lessonContents) continue;
      for (const lessonContent of moduleLesson.lesson.lessonContents) {
        contentIds.push(lessonContent.content.id);
      }
    }
  }

  return contentIds;
};
