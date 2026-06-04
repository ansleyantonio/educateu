import { CourseSnapshot, FacultyMember } from "../modules/faculty-ec-request/types";
import { prisma } from "../prismaClient";
import { AppError } from "../utils/AppError";

type FacultyUser = {
  id: string;
  firstName: string;
  lastName: string;
  facultyUser: string | null;
  facultyEmail: string | null;
  photo: string | null;
  mobile: string | null;
};

// Check if the assigned faculty user has access to the course module from faculty-management (EC2 Access Check)
export const ensureFacultyCourseModuleAccess = async (moduleId: string, userId: string) => {
  const sessionCourses = await prisma.sessionCourse.findMany({
    select: {
      courseSnapshot: true,
    },
  });

  let hasAccess = false;

  for (const sc of sessionCourses) {
    const snapshot = sc.courseSnapshot as unknown as CourseSnapshot;
    if (!snapshot?.courseModules) continue;

    const matchedModule = snapshot.courseModules.find((m) => m.cModule?.id === moduleId);

    if (!matchedModule) continue;

    hasAccess = matchedModule.cModule?.faculty?.some((f: FacultyMember) => f.userId === userId) ?? false;

    if (hasAccess) break;
  }

  if (!hasAccess) {
    throw new AppError("You don't have access to this course module", "ACCESS_DENIED", 400);
  }
};

// Get all faculty members for a course module
export const getFacultiesByCModuleId = async (
  cModuleId: string,
  ids: boolean = false,
): Promise<string[] | FacultyUser[]> => {
  const sessionCourses = await prisma.sessionCourse.findMany({
    select: { courseSnapshot: true },
  });

  for (const sc of sessionCourses) {
    const module = (sc.courseSnapshot as unknown as CourseSnapshot)?.courseModules?.find(
      (m) => m.cModule?.id === cModuleId,
    );

    const faculty = module?.cModule?.faculty;
    if (!faculty?.length) continue;

    const facultyIds = faculty.map((f) => f.userId);

    if (ids) return facultyIds;

    return prisma.user.findMany({
      where: { id: { in: facultyIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        facultyUser: true,
        facultyEmail: true,
        photo: true,
        mobile: true,
      },
    });
  }

  return [];
};
