import { z } from "zod";

export const supporting_documents_fromSchema = z.object({
  nationalIdentification: z.string().optional(),
  policeClearance: z.string().optional(),
  otherDocument: z.string().optional(),
});

//  nationalIdentification: z.string().min(1, "National identification document is required."),
//   policeClearance: z.string().min(1, "Police clearance document is required."),
//   otherDocument: z.string().min(1, "Other supporting document is required."),
