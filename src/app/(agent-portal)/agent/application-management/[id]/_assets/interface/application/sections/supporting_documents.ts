import { z } from "zod";

export const supporting_documents = z
  .object({
    cv: z.string().optional(),
    englishCertificates: z.string().optional(),
    essay: z.string().optional(),
    passportId: z.string().optional(),
    proofOfNameChange: z.string().optional(),
    qualification: z.string().optional(),
    nationalIdentification: z.string().optional(),
    policeClearance: z.string().optional(),
    transcripts: z.string().optional(),
    references: z.string().optional(),
    otherDocument: z.string().optional(),
  })
  .strict();

//  nationalIdentification: z.string().min(1, "National identification document is required."),
//   policeClearance: z.string().min(1, "Police clearance document is required."),
//   otherDocument: z.string().min(1, "Other supporting document is required."),
