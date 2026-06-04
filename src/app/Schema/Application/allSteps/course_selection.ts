import { z } from "zod";

export const course_selection = z.object({
  awardingBodyId: z.string().min(1, {
    message: "Awarding body is required.",
  }),
  course: z.string().min(1, {
    message: "Course is required.",
  }),
  sessionId: z.string().min(1, {
    message: "session is required.",
  }),
  // awardingBodyId: z.string().optional(),
  // courseId: z.string().optional(),
  // sessionId: z.string().optional(),
  yearOfCourse: z.string().optional(),
});
