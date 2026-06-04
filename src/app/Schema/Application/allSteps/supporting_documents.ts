import { z } from "zod";

export const supporting_documents = z.object({
  cv: z.array(z.string()).optional(),
  qualification: z.array(z.string()).optional(),
  nationalIdentification: z.array(z.string()).optional(),
  policeClearance: z.array(z.string()).optional(),
  englishCertificates: z.array(z.string()).optional(),
  passportId: z.array(z.string()).optional(),
  essay: z.array(z.string()).optional(),
  proofOfNameChange: z.array(z.string()).optional(),
  transcripts: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  otherDocument: z.array(z.string()).optional(),
});
