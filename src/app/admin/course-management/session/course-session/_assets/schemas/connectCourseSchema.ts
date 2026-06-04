import z from "zod";

const connectCourseSchema = z.object({
  // courses: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       title: z.string(),
  //     }
  //   ),
  //   )
  courseIds: z.array(z.any()).min(1, "Select at least one course"),
});

export type IConnectCourseForm = z.infer<typeof connectCourseSchema>;

export default connectCourseSchema;
