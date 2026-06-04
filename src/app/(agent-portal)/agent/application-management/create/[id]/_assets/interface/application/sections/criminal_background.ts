import { z } from "zod";

export const criminal_background = z.object({
  offenseOrPenalty: z.string().min(1, "Offense or penalty is required."),
  offenseOrPenaltyDetails: z.string().optional(),
  // .min(1, "Details about the offense or penalty are required."),
  disqualificationOrSanction: z
    .string()
    .min(1, "Disqualification or sanction is required."),
  disqualificationOrSanctionDetails: z.string().optional(),
  // .min(1, "Details about the disqualification or sanction are required."),
  policeClearance: z
    .string()
    .min(1, "Police clearance information is required."),
  // policeClearance: z.enum(["yes", "no"]).optional(),
});

// // criminal_background.ts
// export const criminal_background_refined = z.object({
//   offenseOrPenalty: z.string().min(1, "Offense or penalty is required."),
//   offenseOrPenaltyDetails: z.string().optional(),
//   disqualificationOrSanction: z
//     .string()
//     .min(1, "Disqualification or sanction is required."),
//   disqualificationOrSanctionDetails: z.string().optional(),
//   policeClearance: z
//     .string()
//     .min(1, "Police clearance information is required."),
// });

// // Refined schema with conditional validation
// export const criminal_background = criminal_background_refined
//   .refine(
//     (data) =>
//       data.offenseOrPenalty !== "YES" ||
//       (data.offenseOrPenalty === "YES" &&
//         data.offenseOrPenaltyDetails &&
//         data.offenseOrPenaltyDetails.trim().length > 0),
//     {
//       message:
//         "Details about the offense or penalty are required when 'Yes' is selected",
//       path: ["offenseOrPenaltyDetails"],
//     }
//   )
//   .refine(
//     (data) =>
//       data.disqualificationOrSanction !== "YES" ||
//       (data.disqualificationOrSanction === "YES" &&
//         data.disqualificationOrSanctionDetails &&
//         data.disqualificationOrSanctionDetails.trim().length > 0),
//     {
//       message:
//         "Details about the disqualification or sanction are required when 'Yes' is selected",
//       path: ["disqualificationOrSanctionDetails"],
//     }
//   );
