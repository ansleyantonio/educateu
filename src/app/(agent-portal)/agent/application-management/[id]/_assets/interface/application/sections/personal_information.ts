import { z } from "zod";

export const personal_information = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email({ message: "Invalid email format." }),
  // dateOfBirth: z.date(),
  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
    invalid_type_error: "Invalid date format.",
  }),
  countryOfBirth: z.string().optional(),
  currentNationality: z.string().optional(),
  sex: z.string().optional().default("MALE"),
  ethnicity: z.string().optional(),
  mobileNumber: z.string().optional(),
  countryOfResidence: z.string().optional(),
  currentAddress: z.string().min(1, "Current address is required."),
  currentPostCode: z.string().optional(),
  permanentAddress: z.string().optional(),
  nationalIdentityType: z.string().optional(),
  nationalIdentityNumber: z.string().optional(),
});

// firstName: z.string().min(1, "First name is required."),
// lastName: z.string().min(1, "Last name is required."),
// dateOfBirth: z.date(),
// countryOfBirth: z.string().min(1, "Country of birth is required."),
// currentNationality: z.string().min(1, "Current nationality is required."),
// sex: z.string().min(1, "Sex is required."),
// ethnicity: z.string().min(1, "Ethnicity is required."),
// mobileNumber: z.string().min(1, "Mobile number is required."),
// countryOfResidence: z.string().min(1, "Country of residence is required."),
// currentAddress: z.string().min(1, "Current address is required."),
// currentPostCode: z.string().min(1, "Current postcode is required."),
// permanentAddress: z.string().min(1, "Permanent address is required."),
// nationalIdentityType: z
//   .string()
//   .min(1, "National identity type is required."),
// nationalIdentityNumber: z
//   .string()
//   .min(1, "National identity number is required."),
