import { z } from "zod";

export const academic_background = z.object({
  highestLevelOfQualification: z.string().optional(),
  areaOfQualification: z.string().optional(),
  gradeOrResult: z.string().optional(),
  yearCompleted: z.string().optional(),
  countryOfIssue: z.string().optional(),
  institutionName: z.string().optional(),
});
