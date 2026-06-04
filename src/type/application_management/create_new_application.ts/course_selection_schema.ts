import { z } from "zod";

export const course_selection_fromSchema = z.object({
  faculty: z.string().optional(),
  course: z.string().optional(),
  intake: z.string().optional(),
  yearOfCourse: z.string().optional(),
});

//   faculty: z.string().min(1, "Faculty is required."),
//   course: z.string().min(1, "Course is required."),
//   intake: z.string().min(1, "Intake is required."),
//   yearOfCourse: z.string().min(1, "Year of course is required."),
