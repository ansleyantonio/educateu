import passwordValidation from "@/components/schema/passwordValidation";
import { z } from "zod";

// Reusable validation
const optionalTextSchema = z.string().optional();

const baseFacultySchema = z.object({
  username: z.string().min(1, {
    message: "username is required.",
  }),
  firstName: z.string().min(1, {
    message: "first name is required.",
  }),
  lastName: z.string().optional(),
  email: z.string().min(1, {
    message: "email name is required.",
  }),
  mobile: optionalTextSchema,
  password: passwordValidation,
  confirmPassword: z.string().min(1, {
    message: "Confirm Password is required.",
  }),
  facultyStatus: z.enum(["ACTIVE", "INACTIVE"]),
  userStatus: z.enum(["ACTIVE", "DEACTIVATED"]),
  photo: optionalTextSchema,
});

const CreateFacultySchema = baseFacultySchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords did not match.",
    path: ["confirmPassword"],
  }
);

const filterFacultySchema = z.object({
  FacultyName: optionalTextSchema,
  email: optionalTextSchema,
  mobile: optionalTextSchema,
});

const UpdateLessonSchema = baseFacultySchema
  .omit({
    password: true,
    confirmPassword: true,
  })

  .partial();

export type IFacultyForm = z.infer<typeof CreateFacultySchema>;

export type IFilterFacultyForm = z.infer<typeof filterFacultySchema>;

export const FacultySchema = {
  create: CreateFacultySchema,
  update: UpdateLessonSchema,
  filter: filterFacultySchema,
};
