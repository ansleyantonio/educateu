import { z } from "zod";
export const assignCourseSchema = z.object({
  courseAssign: z.array(
    z.object({
      id: z.string().min(1, "User ID is required"),
      session: z.string().min(1, "Session ID is required"),
      course: z.string().min(1, "Course ID is required"),
      module: z.array(z.string().min(1, "Course Module ID is required")),
      role: z
        .string(z.enum(["TEACHER", "TEACHING_ASSISTANT", "GUEST_TEACHER"]))
        .min(1, "Role is required"),
    })
  ),
});

export type IAssignCourseForm = z.infer<typeof assignCourseSchema>;
