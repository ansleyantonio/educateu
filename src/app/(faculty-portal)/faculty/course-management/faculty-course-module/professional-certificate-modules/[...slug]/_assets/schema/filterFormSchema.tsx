import { z } from "zod";

export const formSchema = z.object({
  course_title: z.string().min(1, "Title is required"),
});
