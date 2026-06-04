import { link } from "fs";
import { z } from "zod";

const facultyStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "PENDING",
  "DEACTIVATED",
]);
const userStatus = z.enum(["ACTIVE", "PENDING", "DEACTIVATED", "SUSPENDED"]);
const httpMethods = z.enum([
  "GET",
  "POST",
  "RE-ORDER",
  "DELETE",
  "UPDATE",
  "PATCH",
  "PUT",
  "OPTIONS",
]);

// const courseModuleItem = z.object({
//   moduleName: z.string().optional(),
//   roleName: z.string().optional(),
//   modulePermission: z.array(httpMethods).optional(),
// });
const courseModuleItem = z.object({
  courseName: z.string().min(1),
  roleName: z.string().min(1),
  modules: z.array(
    z.object({
      moduleName: z.string().min(1),
      modulePermission: z.array(httpMethods).optional(),
    })
  ),
});
const photoSchema = z.object({
  path: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().nonnegative(),
  originalname: z.string().min(1),
});

export const facultyRegisterSchema = z
  .object({
    firstName: z.string().min(1, "Name is required"),
    lastName: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    userStatus: userStatus.default("ACTIVE").optional(),
    websiteUrl: z.string().url("Invalid URL format").optional(),
    roleId: z.string().optional(),
    facultyStatus: facultyStatusEnum.default("ACTIVE").optional(),
    photo: z
      .string()
      .transform((val, ctx) => {
        try {
          return JSON.parse(val);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON format in photo",
          });
          return z.NEVER;
        }
      })
      .pipe(photoSchema)
      .optional(),
    coursePermissions: z.boolean().default(false).optional(),
    courseModule: z.array(courseModuleItem).optional(),
    assessmentPermissions: z.boolean().default(false).optional(),
    studentMessagingAccess: z.boolean().default(false).optional(),
  })
  .strict()
  .partial();

export type FacultyRegisterSchema = z.infer<typeof facultyRegisterSchema>;

// export const assignCourse = z
//   .object({
//     userId: z.string().min(1, "User ID is required"),
//     courseId: z.string().min(1, "Course ID is required"),
//     courseModuleId: z.string().min(1, "Course Module ID is required"),
//     role: z.enum(["TEACHER", "TEACHING_ASSISTANT", "GUEST_TEACHER"]),
//   })
//   .strict()
//   .partial();
export const assignCourse = z
  .object({
    courseAssign: z.array(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        sessionId: z.string().min(1, "Session ID is required"),
        courseId: z.string().min(1, "Course ID is required"),
        courseModuleId: z.array(
          z.string().min(1, "Course Module ID is required")
        ),
        role: z.array(
          z.enum(["TEACHER", "TEACHING_ASSISTANT", "GUEST_TEACHER"])
        ),
      })
    ),
  })
  .strict()
  .partial();
export type AssignCourseSchema = z.infer<typeof assignCourse>;
