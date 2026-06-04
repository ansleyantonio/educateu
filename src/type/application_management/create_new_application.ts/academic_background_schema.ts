import { z } from "zod";

export const academic_background_formSchema = z.object({
  highestQualification: z.string().optional(),
  areaOfQualification: z.string().optional(),
  grade: z.string().optional(),
  yearCompleted: z.string().optional(),
  countryOfIssue: z.string().optional(),
  institutionName: z.string().optional(),
});
