import { z } from "zod";

// Define form validation schema
const assignFormSchema = z.object({
  userPortalCategoryRoleId: z.string().min(1, "Please select a user"),
  // date: z.string().min(1, "Please select a date"),
  applicationId: z.array(z.string()),
  // assignedBy: z.string().min(1, "Please enter who is assigning"),
  // time: z.string().min(1, "Please select a time"),
});

export type AssignFormValues = z.infer<typeof assignFormSchema>;

export { assignFormSchema };
