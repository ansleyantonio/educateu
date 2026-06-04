import { z } from "zod";
const today = new Date();
const minAgeDate = new Date(
  today.getFullYear() - 100,
  today.getMonth(),
  today.getDate()
); // 100 years ago
const maxAgeDate = new Date(
  today.getFullYear() - 16,
  today.getMonth(),
  today.getDate()
); // 16 years ago

export const personal_information = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email({ message: "Invalid email format." }),
  // dateOfBirth: z.date(),
  dateOfBirth: z
    .date({
      required_error: "Date of birth is required",
      invalid_type_error: "Invalid date",
    })
    .refine((date) => date >= minAgeDate && date <= maxAgeDate, {
      message: "Age must be between 16 and 100 years",
    }),
  // dateOfBirth: z.date({
  //   required_error: "Date of birth is required.",
  //   invalid_type_error: "Invalid date format.",
  // }),
  countryOfBirth: z.string().min(1, {
    message: "Country of birth is required.",
  }),
  currentNationality: z.string().min(1, {
    message: "Current nationality is required.",
  }),
  sex: z.string().min(1, { message: "Sex is required." }),

  // if sex is OTHER, then otherSex is required
  // else otherSex is not required
  otherSex: z.string().optional(),
  ethnicity: z.string().min(1, { message: "Ethnicity is required." }),
  mobileNumber: z.string().min(1, { message: "Mobile number is required." }),
  countryOfResidence: z.string().min(1, {
    message: "Country of residence is required.",
  }),
  currentAddress: z.string().min(1, "Current address is required."),
  currentPostCode: z.string().optional(),
  permanentAddress: z.string().optional(),
  nationalIdentityType: z.string().optional(),
  nationalIdentityNumber: z.string().optional(),
});
