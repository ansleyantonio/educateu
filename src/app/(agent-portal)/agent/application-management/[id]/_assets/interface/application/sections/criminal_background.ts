import { z } from "zod";

export const criminal_background = z.object({
  offenseOrPenalty: z.string().min(1, "Offense or penalty is required."),
  offenseOrPenaltyDetails: z
    .string()
    .min(1, "Details about the offense or penalty are required."),
  disqualificationOrSanction: z
    .string()
    .min(1, "Disqualification or sanction is required."),
  disqualificationOrSanctionDetails: z
    .string()
    .min(1, "Details about the disqualification or sanction are required."),
  policeClearance: z
    .string()
    .min(1, "Police clearance information is required."),
  // policeClearance: z.enum(["yes", "no"]).optional(),
});
