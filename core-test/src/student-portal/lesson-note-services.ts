import crypto from "crypto";
import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import { CreateLessonNoteResponse, GetLessonNotesResponse, UpdateLessonNoteResponse } from "./types";

// Define interfaces for the course snapshot structure
// Using more flexible types to accommodate different possible structures
interface CourseSnapshotLesson {
  id: string;
  title?: string;
  name?: string;
  nameOrTitle?: string;
  order?: number;
  index?: number;
  type?: string;
  outcome?: string;
  description?: string;
  estimatedTimeToComplete?: number;
}

interface CourseSnapshotModule {
  id: string;
  title?: string;
  name?: string;
  nameOrTitle?: string;
  order?: number;
  index?: number;
  type?: string;
  lessons?: CourseSnapshotLesson[] | Array<{ lesson: CourseSnapshotLesson }> | Array<{ lesson?: CourseSnapshotLesson }>;
  // Alternative property names that might be used
  lesson?: CourseSnapshotLesson[];
  lessonContents?: Array<{ lesson: CourseSnapshotLesson }>;
  // Structure from the actual course snapshot
  moduleLessons?: Array<{ lesson: CourseSnapshotLesson }>;
}

interface CourseSnapshot {
  modules?: CourseSnapshotModule[];
  // Alternative property names that might be used
  module?: CourseSnapshotModule[];
  courseModules?: CourseSnapshotModule[];
}

// Function to create a lesson note for a student
export const createLessonNoteService = async (
  studentId: string,
  studentCourseId: string,
  moduleId: string,
  lessonId: string,
  note: string,
  timestamp?: number,
): Promise<CreateLessonNoteResponse> => {
  // First, verify that the student is enrolled in the course and has access to the module
  const studentCourse = await prisma.studentCourse.findUnique({
    where: {
      id: studentCourseId,
    },
    select: {
      id: true,
      studentId: true,
      lessonNotes: true,
      sessionCourse: {
        select: {
          courseSnapshot: true,
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course enrollment not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  // Verify that the student is the owner of this course
  if (studentCourse.studentId !== studentId) {
    throw new AppError("Unauthorized: Student does not own this course", "UNAUTHORIZED", 403);
  }

  // Verify that the lesson exists in the module
  const courseSnapshot = studentCourse.sessionCourse.courseSnapshot as CourseSnapshot;
  if (!courseSnapshot) {
    throw new AppError("Course snapshot not available", "COURSE_SNAPSHOT_NOT_AVAILABLE", 404);
  }

  // Find the module in the course snapshot - try different possible property names
  let module = courseSnapshot.modules?.find((m: CourseSnapshotModule) => m.id === moduleId);

  // If not found in 'modules', try alternative property names
  if (!module) {
    module = courseSnapshot.module?.find((m: CourseSnapshotModule) => m.id === moduleId);
  }

  if (!module) {
    module = courseSnapshot.courseModules?.find((m: CourseSnapshotModule) => m.id === moduleId);
  }

  if (!module) {
    throw new AppError("Module not found in course snapshot", "MODULE_NOT_FOUND", 404);
  }

  // Find the lesson in the module - based on the actual structure
  // Lessons are nested in moduleLessons array, each with a lesson property
  let lesson = null;
  if (module.moduleLessons && Array.isArray(module.moduleLessons)) {
    const moduleLesson = module.moduleLessons.find(
      (ml: { lesson: CourseSnapshotLesson }) => ml.lesson && ml.lesson.id === lessonId,
    );
    if (moduleLesson) {
      lesson = moduleLesson.lesson;
    }
  }

  if (!lesson) {
    throw new AppError("Lesson not found in module", "LESSON_NOT_FOUND", 404);
  }

  // Get the current lesson notes from the student course
  let currentLessonNotes: Array<{
    id: string;
    lessonId: string;
    note: string;
    timestamp?: number;
    createdAt: string;
  }> = [];
  if (studentCourse.lessonNotes && Array.isArray(studentCourse.lessonNotes)) {
    // Type assertion since we know the structure of lessonNotes
    currentLessonNotes = studentCourse.lessonNotes as Array<{
      id: string;
      lessonId: string;
      note: string;
      timestamp?: number;
      createdAt: string;
    }>;
  }

  // Create the new lesson note
  const newLessonNote = {
    id: crypto.randomUUID(), // Generate a unique ID for the note
    lessonId,
    note,
    timestamp,
    createdAt: new Date().toISOString(),
  };

  // Add the new note to the existing notes
  const updatedLessonNotes = [...currentLessonNotes, newLessonNote];

  // Update the student course with the new lesson notes
  const updatedStudentCourse = await prisma.studentCourse.update({
    where: {
      id: studentCourseId,
    },
    data: {
      lessonNotes: updatedLessonNotes,
    },
  });

  return {
    success: true,
    message: "Lesson note created successfully",
    lessonNote: newLessonNote,
  };
};

// Function to get lesson notes for a student
export const getLessonNotesService = async (
  studentId: string,
  studentCourseId: string,
  lessonId: string,
): Promise<GetLessonNotesResponse> => {
  // First, verify that the student is enrolled in the course
  const studentCourse = await prisma.studentCourse.findUnique({
    where: {
      id: studentCourseId,
    },
    select: {
      id: true,
      studentId: true,
      lessonNotes: true,
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course enrollment not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  // Verify that the student is the owner of this course
  if (studentCourse.studentId !== studentId) {
    throw new AppError("Unauthorized: Student does not own this course", "UNAUTHORIZED", 403);
  }

  // Get the lesson notes from the student course
  let lessonNotes: Array<{
    id: string;
    lessonId: string;
    note: string;
    timestamp?: number;
    createdAt: string;
  }> = [];

  if (studentCourse.lessonNotes && Array.isArray(studentCourse.lessonNotes)) {
    // Type assertion since we know the structure of lessonNotes
    lessonNotes = studentCourse.lessonNotes as Array<{
      id: string;
      lessonId: string;
      note: string;
      timestamp?: number;
      createdAt: string;
    }>;
  }

  // Filter the notes to only include notes for the specified lesson
  const filteredLessonNotes = lessonNotes.filter((note) => note.lessonId === lessonId);

  return {
    lessonNotes: filteredLessonNotes,
  };
};

// Function to update a lesson note for a student
export const updateLessonNoteService = async (
  studentId: string,
  studentCourseId: string,
  noteId: string,
  note: string,
  timestamp?: number,
): Promise<UpdateLessonNoteResponse> => {
  // First, verify that the student is enrolled in the course
  const studentCourse = await prisma.studentCourse.findUnique({
    where: {
      id: studentCourseId,
    },
    select: {
      id: true,
      studentId: true,
      lessonNotes: true,
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course enrollment not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  // Verify that the student is the owner of this course
  if (studentCourse.studentId !== studentId) {
    throw new AppError("Unauthorized: Student does not own this course", "UNAUTHORIZED", 403);
  }

  // Get the current lesson notes from the student course
  let currentLessonNotes: Array<{
    id: string;
    lessonId: string;
    note: string;
    timestamp?: number;
    createdAt: string;
    updatedAt?: string;
  }> = [];

  if (studentCourse.lessonNotes && Array.isArray(studentCourse.lessonNotes)) {
    // Type assertion since we know the structure of lessonNotes
    currentLessonNotes = studentCourse.lessonNotes as Array<{
      id: string;
      lessonId: string;
      note: string;
      timestamp?: number;
      createdAt: string;
      updatedAt?: string;
    }>;
  }

  // Find the note to update
  const noteIndex = currentLessonNotes.findIndex((n) => n.id === noteId);

  if (noteIndex === -1) {
    throw new AppError("Note not found", "NOTE_NOT_FOUND", 404);
  }

  // Update the note
  const updatedNote = {
    ...currentLessonNotes[noteIndex],
    note,
    ...(timestamp !== undefined && { timestamp }),
    updatedAt: new Date().toISOString(),
  };

  // Replace the old note with the updated one
  currentLessonNotes[noteIndex] = updatedNote;

  // Update the student course with the updated lesson notes
  await prisma.studentCourse.update({
    where: {
      id: studentCourseId,
    },
    data: {
      lessonNotes: currentLessonNotes,
    },
  });

  return {
    success: true,
    message: "Lesson note updated successfully",
    lessonNote: updatedNote,
  };
};
