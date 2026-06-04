import { z } from "zod";

export const requiredInfoChecksFormSchema = (items: { id: string }[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  items.forEach((item) => {
    shape[item.id] = z.boolean().optional();
    shape[`${item.id}Note`] = z.string().optional();
  });

  return z.object(shape).superRefine((data, ctx) => {
    items.forEach(({ id }) => {
      if (data[id] && !data[`${id}Note`]) {
        ctx.addIssue({
          path: [`${id}Note`],
          code: z.ZodIssueCode.custom,
          message: `${id} note is required because checkbox is selected.`,
        });
      }
    });
  });
};

export const noRequiredChecksFormSchema = z.object({
  cv: z.boolean().optional(),
  cvNote: z.string().optional(),

  englishCertificates: z.boolean().optional(),
  englishCertificatesNote: z.string().optional(),

  essay: z.boolean().optional(),
  essayNote: z.string().optional(),

  passport_id: z.boolean().optional(),
  passport_idNote: z.string().optional(),

  proof_of_name_change: z.boolean().optional(),
  proof_of_name_changeNote: z.string().optional(),

  qualifications: z.boolean().optional(),
  qualificationsNote: z.string().optional(),

  transcripts: z.boolean().optional(),
  transcriptsNote: z.string().optional(),

  references: z.boolean().optional(),
  referencesNote: z.string().optional(),

  text_box_to_add_a_message: z.boolean().optional(),
  text_box_to_add_a_messageNote: z.string().optional(),

  attachment: z.boolean().optional(),
  attachmentNote: z.string().optional(),

  sendEmailOption: z.boolean().optional(),
  sendEmailOptionNote: z.string().optional(),
});

export type NoRequiredChecksFormValues = z.infer<
  typeof noRequiredChecksFormSchema
>;
