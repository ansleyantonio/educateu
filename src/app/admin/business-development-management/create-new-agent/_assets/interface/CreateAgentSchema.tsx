// import passwordValidation from "@/components/schema/passwordValidation";
// import { z } from "zod";

// export const CreateAgentFormSchema = z
//   .object({
//     username: z
//       .string()
//       .min(1, {
//         message: "Username Is Required.",
//       })
//       .regex(/^\S+$/, {
//         message: "Username cannot contain spaces.",
//       }),
//     firstName: z
//       .string()
//       .min(1, {
//         message: "First Name Is Required.",
//       })
//       .min(3, {
//         message: "First Name Must Be At Least 3 Characters.",
//       }),
//     lastName: z
//       .string()
//       .min(1, {
//         message: "Last Name Is Required.",
//       })
//       .min(3, {
//         message: "Last Name Must Be At Least 3 Characters.",
//       }),

//     password: passwordValidation,

//     email: z.string().email({ message: "Enter a Valid Email Address." }),

//     mobile: z
//       .string()
//       .min(1, { message: "Mobile Number Is Required." })
//       .min(10, { message: "Mobile Number At Least 10 Digits." })
//       .max(20, { message: "Mobile Number At Most 20 Digits." }),
//     // roleId: z.string().min(1, { message: "Role Is Required." }),
//     agentType: z.enum(["external", "internal", ""], {
//       required_error: "Please select agent type",
//     }),
//     commissionGroupId: z.string().optional(),
//     commissionTemplate: z.string().optional(),
//     companyName: z.string().min(1, {
//       message: "Company Name Is Required.",
//     }),
//     agreementStatus: z.literal(true, {
//       errorMap: () => ({
//         message: "You must accept the agreement to proceed.",
//       }),
//     }),
//     note: z.string().min(1, { message: "Note is Required" }),
//     address: z.string().min(1, { message: "Address is Required" }),
//     startDate: z.coerce.date({ message: "Start Date is required" }),
//     endDate: z.coerce.date({ message: "End Date is required" }),
//   })
//   .refine((data) => data.startDate < data.endDate, {
//     message: "End Date must be after Start Date",
//     path: ["endDate"],
//   });

// // export const updateAgentFormSchema = CreateAgentFormSchema.partial();
// export const updateAgentFormSchema = z
//   .object({
//     username: z
//       .string()
//       .min(1, {
//         message: "Username Is Required.",
//       })
//       .regex(/^\S+$/, {
//         message: "Username cannot contain spaces.",
//       }),
//     firstName: z
//       .string()
//       .min(1, {
//         message: "First Name Is Required.",
//       })
//       .min(3, {
//         message: "First Name Must Be At Least 3 Characters.",
//       })
//       .optional(), // Make this optional for updating
//     lastName: z
//       .string()
//       .min(1, {
//         message: "Last Name Is Required.",
//       })
//       .min(3, {
//         message: "Last Name Must Be At Least 3 Characters.",
//       })
//       .optional(), // Make this optional for updating
//     password: z
//       .string()
//       .min(1, {
//         message: "Password Is Required.",
//       })
//       .min(6, {
//         message: "Password Must Be At Least 6 Characters.",
//       })
//       .optional(), // Make this optional for updating
//     email: z
//       .string()
//       .email({ message: "Enter a Valid Email Address." })
//       .optional(), // Optional for updating
//     mobile: z
//       .string()
//       .min(1, { message: "Mobile Number Is Required." })
//       .min(10, { message: "Mobile Number At Least 10 Digits." })
//       .max(20, { message: "Mobile Number At Most 20 Digits." })
//       .optional(), // Optional for updating
//     agentType: z.string().optional(), // Optional for updating
//     commissionGroupId: z.string().optional(),
//     commissionTemplate: z.string().optional(),
//     companyName: z.string().optional(),
//     address: z.string().min(1, { message: "Address is Required" }).optional(), // Optional for updating
//     // startDate: z.date({ message: "Start Date is Required" }).optional(),
//     // endDate: z.date({ message: "End Date is Required" }).optional(),
//     note: z.string().min(1, { message: "Note is Required" }).optional(), // Optional for updating
//     // agreementStatus: z
//     //   .literal(true, {
//     //     errorMap: () => ({
//     //       message: "You must accept the agreement to proceed.",
//     //     }),
//     //   })
//     //   .optional(), // Optional for updating
//     agreementStatus: z.boolean(),
//     startDate: z.coerce.date({ message: "Start Date is required" }),
//     endDate: z.coerce.date({ message: "End Date is required" }),
//   })
//   .refine((data) => data.startDate < data.endDate, {
//     message: "End Date must be after Start Date",
//     path: ["endDate"],
//   });

// export interface UserRole {
//   role: {
//     name: string;
//   };
// }

// export interface CreateUsers {
//   id: string;
//   email: string;
//   mobile: string;
//   username: string;
//   firstName: string;
//   lastName: string;
//   userStatus: string;
//   userRoles: UserRole[];
// }

// export interface UserListType {
//   data: CreateUsers[];
//   totalUsers: number;
//   totalPages: number;
//   currentPage: number;
// }

import passwordValidation from "@/components/schema/passwordValidation";
import { z } from "zod";

// ✅ Awarding body + commission template pair
const AwardingBodyTemplateSchema = z.object({
  awardingBodyId: z.string().min(1, "Awarding body is required"),
  commissionTemplateId: z.string().min(1, "Commission template is required"),
});

// --------------------------------------------------
// 🔹 Create Schema (everything required for new agent)
// --------------------------------------------------
export const CreateAgentFormSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Username Is Required." })
      .regex(/^\S+$/, { message: "Username cannot contain spaces." }),
    firstName: z
      .string()
      .min(1, { message: "First Name Is Required." })
      .min(3, { message: "First Name Must Be At Least 3 Characters." }),
    lastName: z
      .string()
      .min(1, { message: "Last Name Is Required." })
      .min(3, { message: "Last Name Must Be At Least 3 Characters." }),

    password: passwordValidation,

    email: z.string().email({ message: "Enter a Valid Email Address." }),

    mobile: z
      .string()
      .min(1, { message: "Mobile Number Is Required." })
      // .min(10, { message: "Mobile Number At Least 10 Digits." })
      .max(20, { message: "Mobile Number At Most 20 Digits." }),

    agentType: z.enum(["external", "internal"], {
      required_error: "Please select agent type",
    }),

    commissionGroupId: z.string().optional(),

    // ✅ At least one awarding body with a required template
    awardingBodyTemplates: z
      .array(AwardingBodyTemplateSchema)
      .min(1, "At least one awarding body and template is required"),

    companyName: z.string().min(1, { message: "Company Name Is Required." }),

    agreementStatus: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the agreement to proceed.",
      }),
    }),

    TFieldValues: z.string().optional(),
    note: z.string().min(1, { message: "Note is Required" }),
    address: z.string().min(1, { message: "Address is Required" }),

    startDate: z.coerce.date({ message: "Start Date is required" }),
    endDate: z.coerce.date({ message: "End Date is required" }),
  })
  // Date validation
  .refine((data) => data.startDate < data.endDate, {
    message: "End Date must be after Start Date",
    path: ["endDate"],
  });

// --------------------------------------------------
// 🔹 Update Schema (optional, but consistent if provided)
// --------------------------------------------------
export const updateAgentFormSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Username Is Required." })
      .regex(/^\S+$/, { message: "Username cannot contain spaces." }),

    firstName: z
      .string()
      .min(3, { message: "First Name Must Be At Least 3 Characters." })
      .optional(),
    lastName: z
      .string()
      .min(3, { message: "Last Name Must Be At Least 3 Characters." })
      .optional(),

    password: passwordValidation.optional(),

    email: z
      .string()
      .email({ message: "Enter a Valid Email Address." })
      .optional(),

    mobile: z
      .string()
      // .min(10, { message: "Mobile Number At Least 10 Digits." })
      .max(20, { message: "Mobile Number At Most 20 Digits." })
      .optional(),

    agentType: z.enum(["external", "internal"]).optional(),

    commissionGroupId: z.string().optional(),

    // ✅ optional, but if provided must have valid pairs
    awardingBodyTemplates: z.array(AwardingBodyTemplateSchema).optional(),

    companyName: z.string().optional(),
    address: z.string().optional(),
    note: z.string().optional(),

    agreementStatus: z.boolean().optional(),

    startDate: z.coerce.date({ message: "Start Date is required" }),
    endDate: z.coerce.date({ message: "End Date is required" }),
  })
  // Enforce that if awardingBodyTemplates exist, all must have valid commissionTemplateId
  .refine(
    (data) =>
      !data.awardingBodyTemplates ||
      data.awardingBodyTemplates.every(
        (t) => t.awardingBodyId && t.commissionTemplateId
      ),
    {
      message: "Each awarding body must have a commission template",
      path: ["awardingBodyTemplates"],
    }
  )
  // Date validation
  .refine((data) => data.startDate < data.endDate, {
    message: "End Date must be after Start Date",
    path: ["endDate"],
  });

  export const terminateAgentSchema = z
  .object({
    userId: z
      .string()
      .min(1, { message: "Userid Is Required." }),
    agreementId: z
      .string()
      .min(1, { message: "AgreementId Is Required." }),
    status: z
      .string()
      .min(1, { message: "Status Required." }),});