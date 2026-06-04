import { CourseSnapshot, FacultyMember } from "../modules/faculty-ec-request/types";
import prisma from "../prismaClient";

// Get course module IDs by user() ID
export const getUserAssignedCourseModuleIds = async (userId: string): Promise<string[]> => {
  const sessionCourses = await prisma.sessionCourse.findMany({
    select: { courseSnapshot: true },
  });

  return [
    ...new Set(
      sessionCourses.flatMap((sc) =>
        ((sc.courseSnapshot as unknown as CourseSnapshot)?.courseModules ?? [])
          .filter((m) => m?.cModule?.faculty?.some((f: FacultyMember) => f.userId === userId))
          .map((m) => m.cModule.id),
      ),
    ),
  ];
};
