import { z } from "zod";

export const personal_information_fromSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryOfBirth: z.string().optional(),
  highestQualification: z.string().optional(),

  // //   dateOfBirth: z.date({
  // //     required_error: "Date of birth is required",
  // //   }),
  // countryOfBirth: z.string().optional(), // min(1, "Country of birth is required"),
  // currentNationality: z.string().optional(), // min(1, "Current nationality is required")
  // sex: z.string().optional(), // min(1, "Sex is required")
  // ethnicity: z.string().optional(),
  // mobileNumber: z.string().optional(),
  // countryOfResidence: z.string().optional(), //min(1, "Country of residence is required")
  // currentAddress: z.string().min(1, "Current address is required"),
  // currentPostCode: z.string().optional(),
  // permanentAddress: z.string().optional(),
  // nationalIdType: z.string().optional(), //min(1, "National ID type is required")
  // nationalIdNumber: z.string().optional(), //min(1, "National ID number is required")
});
