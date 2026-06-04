import { z } from "zod";

export const academic_background = z.object({
  highestLevelOfQualification: z.string().optional(),
  areaOfQualification: z.string().optional(),
  gradeOrResult: z.string().optional(),
  yearCompleted: z.string().optional(),
  countryOfIssue: z.string().optional(),
  institutionName: z.string().optional(),
});

// highestLevelOfQualification: z.string().min(1, "Highest level of qualification is required."),
// areaOfQualification: z.string().min(1, "Area of qualification is required."),
// gradeOrResult: z.string().min(1, "Grade or result is required."),
// yearCompleted: z.string().min(1, "Year completed is required."),
// countryOfIssue: z.string().min(1, "Country of issue is required."),
// institutionName: z.string().min(1, "Institution name is required."),
