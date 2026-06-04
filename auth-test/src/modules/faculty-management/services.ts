import prisma from "../../prismaClient";
import bcrypt from "bcryptjs";
import { AssignCourseSchema, FacultyRegisterSchema } from "./schema";
import { AppError } from "../../utils/AppError";
import jwt from "jsonwebtoken";
import axios from "axios";
import FormData from "form-data";
import * as jsonwebtoken from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import { date } from "zod";
type ParsedPhoto = {
  path: string;
  mimetype: string;
  size: number;
  originalname: string;
};
interface FacultyAssignment {
  role: string;
  userId: string;
  moduleId: string;
}
type FlattenedUserRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  facultyEmail: string | null;
  mobile: string | null;
  username: string | null;
  userStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  userPortalCategoryId: string;
  portalCategoryName: string;
  roleId: string | null;
  roleName: string | null;
  websiteUrl: string | null;
  facultyStatus: string | null;
  photo?: string | null;
  coursePermissions: boolean;
  // courseModule:
  //   | {
  //       moduleName?: string | null;
  //       modulePermission?: string[] | null;
  //     }[]
  //   | null;
  courseModule:
    | {
        moduleName?: string | null;
        modulePermission?: string[] | null;
      }[]
    | null;
  assessmentPermissions: boolean;
  studentMessagingAccess: boolean;

  //   roleData: any | null;
};

const flattened: FlattenedUserRole[] = [];

const facultyRegister = async (data: FacultyRegisterSchema) => {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Check for existing user
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [
          { facultyEmail: { equals: data.email, mode: "insensitive" } },
          { mobile: { equals: data.mobile, mode: "insensitive" } },
          { facultyUser: { equals: data.username, mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.facultyUser === data.username) {
        throw new AppError("Username is already registered", "CONFLICT", 409);
      }
      if (existingUser.facultyEmail === data.email) {
        throw new AppError("Email is already registered", "CONFLICT", 409);
      }
      if (existingUser.mobile === data.mobile) {
        throw new AppError(
          "Mobile number is already registered",
          "CONFLICT",
          409
        );
      }
    }

    // Step 2: Hash password
    const hashedPassword = await bcrypt.hash(data.password || "", 10);

    // Step 3: Create user
    const user = await tx.user.create({
      data: {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        facultyEmail: data.email || "",
        mobile: data.mobile || "",
        photo: data.photo ? JSON.stringify(data.photo) : "",
        facultyUser: data.username || "",
        password: hashedPassword,
        mfaEnabled: false,
      },
    });

    // Step 4: Fetch the faculty portalCategory (not userPortalCategory yet)
    const portalCategory = await tx.portalCategory.findFirst({
      where: { name: "faculty" },
    });

    if (!portalCategory) {
      throw new AppError("Faculty portal category not found", "NOT_FOUND", 404);
    }

    // Step 5: Create UserPortalCategory for this user
    const userPortalCategory = await tx.userPortalCategory.create({
      data: {
        user: { connect: { id: user.id } },
        portalCategory: { connect: { id: portalCategory.id } },
        status: "ACTIVE", // or your default
      },
    });

    if (!userPortalCategory) {
      throw new AppError("User portal category not found", "NOT_FOUND", 404);
    }

    // Step 5: Get role
    const userRole = await tx.role.findFirst({
      where: {
        name: "faculty",
      },
    });

    if (!data.roleId && !userRole?.id) {
      throw new AppError("Faculty role not found", "NOT_FOUND", 404);
    }

    // Step 6: Create UserPortalCategoryRole
    await tx.userPortalCategoryRole.create({
      data: {
        userPortalCategory: {
          connect: {
            id: userPortalCategory.id,
          },
        },
        role: {
          connect: {
            id: data.roleId || userRole!.id,
          },
        },
        roleData: {
          websiteUrl: data.websiteUrl || null,
          role: data.roleId || null,
          facultyStatus: data.facultyStatus || "ACTIVE",
          coursePermissions: data.coursePermissions || false,
        },
      },
    });

    return user;
  });
};

export const fetchUsers = async (
  page = 1,
  pageSize = 10,
  searchName = "",
  searchStatus = ""
): Promise<{
  data: FlattenedUserRole[];

  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * pageSize;

  const baseWhere: any = {
    AND: [
      {
        OR: [
          { firstName: { contains: searchName, mode: "insensitive" } },
          { lastName: { contains: searchName, mode: "insensitive" } },
          { email: { contains: searchName, mode: "insensitive" } },
          { username: { contains: searchName, mode: "insensitive" } },
        ],
      },
      {
        userPortalCategories: {
          some: {
            portalCategory: { name: "faculty" },
            ...(searchStatus && {
              userPortalCategoryRoles: {
                some: {
                  roleData: {
                    path: ["facultyStatus"],
                    equals: searchStatus,
                  },
                },
              },
            }),
          },
        },
      },
    ],
  };

  const total = await prisma.user.count({ where: baseWhere });

  const users = await prisma.user.findMany({
    where: baseWhere,
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      facultyEmail: true,
      mobile: true,
      userStatus: true,
      username: true,
      facultyUser: true,
      photo: true,
      createdAt: true,
      updatedAt: true,
      userPortalCategories: {
        where: {
          portalCategory: { name: "faculty" },
        },
        select: {
          id: true,
          portalCategory: {
            select: { name: true },
          },
          userPortalCategoryRoles: {
            select: {
              roleData: true,
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const flattened: FlattenedUserRole[] = [];

  users.forEach((user) => {
    user.userPortalCategories.forEach((category) => {
      category.userPortalCategoryRoles.forEach((roleEntry) => {
        const roleData = roleEntry.roleData as {
          websiteUrl?: string | null;
          facultyStatus?: string | null;
          coursePermissions?: boolean;
          courseModule?:
            | {
                moduleName?: string | null;
                modulePermission?: string[] | null;
              }[]
            | null;
          assessmentPermissions?: boolean;
          studentMessagingAccess?: boolean;
        };

        flattened.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.facultyEmail || user.email || null,
          facultyEmail: user.facultyEmail || null,
          mobile: user.mobile,
          username: user.facultyUser || "",
          userStatus: user.userStatus,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          photo: user.photo || "",
          userPortalCategoryId: category.id,
          portalCategoryName: category.portalCategory.name,
          roleId: roleEntry.role?.id || null,
          roleName: roleEntry.role?.name || null,
          websiteUrl: roleData?.websiteUrl || "",
          facultyStatus: roleData?.facultyStatus || null,
          coursePermissions: roleData?.coursePermissions || false,
          courseModule: roleData?.courseModule || null,
          assessmentPermissions: roleData?.assessmentPermissions || false,
          studentMessagingAccess: roleData?.studentMessagingAccess || false,
          // roleData: roleData || null, // 👈 Add custom static field
        });
      });
    });
  });

  return {
    data: flattened,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

const getFacultyById = async (id: string): Promise<FlattenedUserRole[]> => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      userPortalCategories: {
        some: {
          portalCategory: { name: "faculty" },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      facultyEmail: true,
      mobile: true,
      username: true,
      facultyUser: true,
      userStatus: true,
      createdAt: true,
      updatedAt: true,
      photo: true,
      userPortalCategories: {
        where: {
          portalCategory: { name: "faculty" },
        },
        select: {
          id: true,
          portalCategory: {
            select: { name: true },
          },
          userPortalCategoryRoles: {
            select: {
              roleData: true,
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("Faculty not found", "NOT_FOUND", 404);
  }

  const flattened: FlattenedUserRole[] = [];

  user.userPortalCategories.forEach((category) => {
    category.userPortalCategoryRoles.forEach((roleEntry) => {
      const rawData = roleEntry.roleData;
      const roleData =
        typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      flattened.push({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.facultyEmail || user.email || null,
        facultyEmail: user.facultyEmail || null,
        mobile: user.mobile,
        username: user.facultyUser || null,
        userStatus: user.userStatus,
        photo: user.photo || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        userPortalCategoryId: category.id,
        portalCategoryName: category.portalCategory.name,
        roleId: roleEntry.role?.id || null,
        roleName: roleEntry.role?.name || null,
        websiteUrl: roleData?.websiteUrl || null,
        facultyStatus: roleData?.facultyStatus || null,
        coursePermissions: roleData?.coursePermissions ?? false,
        courseModule: roleData?.courseModule ?? null,
        assessmentPermissions: roleData?.assessmentPermissions ?? false,
        studentMessagingAccess: roleData?.studentMessagingAccess ?? false,
      });
    });
  });

  return flattened;
};

const updateFacultyById = async (
  id: string,
  data: Partial<FacultyRegisterSchema>
) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError("Faculty not found", "NOT_FOUND", 404);
  }

  // Step 1: Update user fields
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      facultyEmail: data.email,
      mobile: data.mobile,
      facultyUser: data.username,
      userStatus: data.userStatus,
      photo: data.photo ? JSON.stringify(data.photo) : undefined,
    },
  });

  // Step 2: Get faculty category for user
  const facultyCategory = await prisma.userPortalCategory.findFirst({
    where: {
      userId: id,
      portalCategory: {
        name: "faculty",
      },
    },
  });

  if (!facultyCategory) {
    throw new AppError("Faculty portal category not found", "NOT_FOUND", 404);
  }

  // Step 3: Update roleData JSON field
  await prisma.userPortalCategoryRole.updateMany({
    where: {
      userPortalCategoryId: facultyCategory.id,
    },
    data: {
      roleData: {
        websiteUrl: data.websiteUrl ?? undefined,
        facultyStatus: data.facultyStatus ?? undefined,
        coursePermissions: data.coursePermissions ?? undefined,
        courseModule: data.courseModule ?? undefined,
        assessmentPermissions: data.assessmentPermissions ?? undefined,
        studentMessagingAccess: data.studentMessagingAccess ?? undefined,
      },
    },
  });

  // Step 4: Update the actual role relation if roleId is provided
  if (data.roleId) {
    const existingRoles = await prisma.userPortalCategoryRole.findMany({
      where: {
        userPortalCategoryId: facultyCategory.id,
      },
    });

    for (const roleEntry of existingRoles) {
      await prisma.userPortalCategoryRole.update({
        where: { id: roleEntry.id },
        data: {
          role: {
            connect: {
              id: data.roleId,
            },
          },
        },
      });
    }
  }

  return updatedUser;
};
const assignCourseToFaculty = async (data: AssignCourseSchema) => {
  const results: any[] = [];

  for (const assignment of data.courseAssign || []) {
    const { userId, sessionId, courseId, courseModuleId, role } = assignment;

    // Validate that role array has exactly one element
    if (!role || role.length !== 1) {
      throw new AppError(
        `Exactly one role must be specified for assignment`,
        "BAD_REQUEST",
        400
      );
    }

    const newRole = role[0];

    // Query sessionCourse using courseId (not id)
    const sessionCourseRecord = await prisma.sessionCourse.findUnique({
      where: {
        sessionId_courseId: {
          sessionId: sessionId,
          courseId: courseId,
        },
      },
    });

    // Alternatively, if you want to find by courseId only, use findFirst
    // const sessionCourseRecord = await prisma.sessionCourse.findFirst({
    //   where: { courseId: courseId }
    // });

    if (!sessionCourseRecord) {
      throw new AppError(
        `SessionCourse not found for courseId: ${courseId}`,
        "NOT_FOUND",
        404
      );
    }

    // Parse the courseSnapshot JSON to access modules
    const courseSnapshot = sessionCourseRecord.courseSnapshot as any;

    if (!courseSnapshot || !courseSnapshot.courseModules) {
      throw new AppError(
        `Invalid course snapshot structure for courseId: ${courseId}`,
        "BAD_REQUEST",
        400
      );
    }

    const courseModules = courseSnapshot.courseModules;

    // Process faculty assignments in the course modules
    for (const courseModule of courseModules) {
      if (!courseModule.cModule) continue;

      const module = courseModule.cModule;

      if (!Array.isArray(module.faculty)) {
        module.faculty = [];
      }

      const isAssignedModule = courseModuleId.includes(module.id);

      if (isAssignedModule) {
        module.faculty = module.faculty.filter((f: any) => f.userId !== userId);

        module.faculty.push({
          role: newRole,
          userId,
          moduleId: module.id,
          assignedAt: new Date().toISOString(),
        });
      } else {
        module.faculty = module.faculty.filter((f: any) => f.userId !== userId);
      }
    }

    const updated = await prisma.sessionCourse.update({
      where: { id: sessionCourseRecord.id },
      data: {
        courseSnapshot: courseSnapshot,
      },
    });

    results.push(updated);
  }

  return results;
};
// const assignCourseToFaculty = async (data: AssignCourseSchema) => {
//   const results: any[] = [];

//   for (const assignment of data.courseAssign || []) {
//     const { userId, courseId, courseModuleId, role } = assignment;

//     const courseRecord = await prisma.courseAndModule.findUnique({
//       where: { courseId },
//     });

//     if (!courseRecord) {
//       throw new AppError(
//         `CourseAndModule not found for courseId: ${courseId}`,
//         "NOT_FOUND",
//         404
//       );
//     }

//     const modulesJson = courseRecord.modules as any[];
//     const newRole = role[0];

//     // First, remove user from all modules in this course (to handle role changes)
//     for (const module of modulesJson) {
//       if (Array.isArray(module.faculty)) {
//         module.faculty = module.faculty.filter((f: any) => f.userId !== userId);
//       }
//     }

//     // Then add user to specified modules with the new role
//     for (const moduleId of courseModuleId) {
//       const moduleObj = modulesJson.find((m) => m.id === moduleId);
//       if (!moduleObj) continue;

//       if (!Array.isArray(moduleObj.faculty)) {
//         moduleObj.faculty = [];
//       }

//       moduleObj.faculty.push({
//         role: newRole,
//         userId,
//         moduleId,
//       });
//     }

//     const updated = await prisma.courseAndModule.update({
//       where: { courseId },
//       data: { modules: modulesJson },
//     });

//     results.push(updated);
//   }

//   return results;
// };

const getFacultyCoursesByUserId = async (userId: string) => {
  try {
    // Get all SessionCourse entries
    const allSessionCourses = await prisma.sessionCourse.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const result = [];
    let hasFacultyModules = false;

    for (const sessionCourse of allSessionCourses) {
      const courseSnapshot = sessionCourse.courseSnapshot as any;

      if (!courseSnapshot || !Array.isArray(courseSnapshot.courseModules)) {
        continue;
      }

      const courseModules = [];

      for (const courseModule of courseSnapshot.courseModules) {
        if (!courseModule.cModule) continue;

        const module = courseModule.cModule;
        const faculty = Array.isArray(module?.faculty) ? module.faculty : [];

        const userAssignments = faculty.filter((f: any) => f.userId === userId);

        if (userAssignments.length > 0) {
          hasFacultyModules = true;

          for (const assignment of userAssignments) {
            courseModules.push({
              courseModuleId: module.id || "unknown",
              modulesName: module.title ?? null,
              facultyRole: assignment.role,
            });
          }
        }
      }

      // If this session course has assignments for the user, add to result
      if (courseModules.length > 0) {
        // Group by role within this session course
        const roleGroups = new Map<string, any>();

        for (const module of courseModules) {
          const key = module.facultyRole;
          if (!roleGroups.has(key)) {
            roleGroups.set(key, {
              facultyRole: key,
              courseModuleNames: [],
            });
          }
          roleGroups.get(key).courseModuleNames.push({
            courseModuleId: module.courseModuleId,
            modulesName: module.modulesName,
          });
        }

        // Create entries for each role group
        for (const [role, roleData] of roleGroups) {
          result.push({
            courseId: sessionCourse.courseId,
            courseName:
              sessionCourse.course?.title ?? courseSnapshot.title ?? null,
            sessionId: sessionCourse.sessionId,
            sessionName: sessionCourse.session?.name ?? null,
            facultyRole: role,
            courseModuleNames: roleData.courseModuleNames,
          });
        }
      }
    }

    return hasFacultyModules ? result : [];
  } catch (error) {
    console.error("Error in getFacultyCoursesByUserId:", error);
    throw new AppError(
      "Failed to fetch faculty courses",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
};

type AssignCourseSchemaData = {
  courseAssign?: Array<{
    userId: string;
    courseId: string;
    courseModuleId: string[];
    role: Array<"TEACHER" | "TEACHING_ASSISTANT" | "GUEST_TEACHER">;
  }>;
};

const updateCourseToFacultyById = async (
  id: string,
  data: AssignCourseSchemaData
) => {
  const courseFaculty = await prisma.courseFaculty.findUnique({
    where: { id },
  });

  if (!courseFaculty) {
    throw new AppError("Course faculty not found", "NOT_FOUND", 404);
  }

  if (
    !data.courseAssign ||
    !Array.isArray(data.courseAssign) ||
    data.courseAssign.length === 0
  ) {
    throw new AppError(
      "No course assignment data provided",
      "BAD_REQUEST",
      400
    );
  }
  const [assignment] = data.courseAssign;

  const { userId, courseId, courseModuleId, role } = assignment;

  // Optional: Validate course and modules exist
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  // For simplicity, we’ll only update the **first module** and **first role**
  const updatedCourseFaculty = await prisma.courseFaculty.update({
    where: { id },
    data: {
      facultyId: userId,
      courseId,
      coursemoduleId: courseModuleId[0],
      facultyRole: role[0],
    },
  });

  return updatedCourseFaculty;
};

const getFacultyCoursesModulesByUserId = async (
  userId: string,
  page: number,
  pageSize: number,
  searchName: string
) => {
  const allCourseModules = await prisma.sessionCourse.findMany({
    select: {
      id: true,
      courseId: true,
      courseSnapshot: true,
    },
  });

  let modulesList = allCourseModules.flatMap((sc) => {
    const courseSnap = sc.courseSnapshot as any;
    if (!courseSnap) return [];

    const modulesFromSnapshot = courseSnap.modules || [];
    const modulesFromCourseModules =
      (courseSnap.courseModules || []).map((cm: any) => cm.cModule) || [];

    const mergedModules = modulesFromSnapshot.map((m: any) => {
      const match = modulesFromCourseModules.find((cm: any) => cm.id === m.id);
      return match ? { ...m, faculty: match.faculty } : m;
    });

    return mergedModules
      .filter((module: any) =>
        (module.faculty || []).some((f: any) => f.userId === userId)
      )
      .map((m: any) => ({
        moduleId: m.id,
        moduleName: m.title,
        moduleType: m.moduleType,
        moduleCode: m.code,
        lessons: m.moduleLessons || [],
        faculty: m.faculty || [],
        courseId: sc.courseId,
        courseName: courseSnap.title,
        courseType: courseSnap.courseType,
        courseCode: courseSnap.code,
        startDate: courseSnap.startDate,
        endDate: courseSnap.endDate,
      }));
  });

  if (searchName) {
    const lowerSearch = searchName.toLowerCase();
    modulesList = modulesList.filter(
      (item) =>
        item.moduleName.toLowerCase().includes(lowerSearch) ||
        item.courseName.toLowerCase().includes(lowerSearch)
    );
  }

  const total = modulesList.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedModules = modulesList.slice(startIndex, endIndex);

  return {
    modules: paginatedModules,
    pagination: {
      count: paginatedModules.length,
      total,
      page,
      perPage: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// const getFacultyCoursesList = async (id?: string) => {
//   const courseWithModules = await prisma.courseAndModule.findMany({
//     where: { courseId: id },
//     include: {
//       course: true,
//     },
//   });

//   const flattened = courseWithModules.map((item) => ({
//     courseId: item.courseId,
//     courseTitle: item.course.title,

//     modules: (item.modules as any[]).map((mod: any) => ({
//       id: mod.id,
//       title: mod.title,
//     })),
//   }));

//   return flattened;
// };
// service/faculty.service.ts
const getFacultyCoursesList = async (courseId?: string) => {
  const courses = await prisma.course.findMany({
    where: courseId ? { id: courseId } : {}, // filter if courseId given
    include: {
      courseModules: {
        include: {
          cModule: true, // only need id & title
        },
      },
    },
  });

  const flattened = courses.map((course) => ({
    courseId: course.id,
    courseTitle: course.title,
    modules: course.courseModules.map((cm) => ({
      id: cm.cModule.id,
      title: cm.cModule.title,
    })),
  }));

  return flattened;
};

export const FacultyService = {
  facultyRegister,
  fetchUsers,
  getFacultyById,
  updateFacultyById,
  assignCourseToFaculty,
  getFacultyCoursesByUserId,
  updateCourseToFacultyById,
  getFacultyCoursesModulesByUserId,
  getFacultyCoursesList,
};
