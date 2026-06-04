import { z } from "zod";

export const requiredInfoChecksFormSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    const pairs: [keyof typeof data, keyof typeof data, string][] = [
      ["cv", "cvNote", "CV note"],
      [
        "englishCertificates",
        "englishCertificatesNote",
        "English certificates note",
      ],
      ["essay", "essayNote", "Essay note"],
      ["passport_id", "passport_idNote", "Passport/ID note"],
      [
        "proof_of_name_change",
        "proof_of_name_changeNote",
        "Proof of name change note",
      ],
      ["qualifications", "qualificationsNote", "Qualifications note"],
      ["transcripts", "transcriptsNote", "Transcripts note"],
      ["references", "referencesNote", "References note"],
      [
        "text_box_to_add_a_message",
        "text_box_to_add_a_messageNote",
        "Message box note",
      ],
      ["attachment", "attachmentNote", "Attachment note"],
      ["sendEmailOption", "sendEmailOptionNote", "Send email option note"],
    ];

    pairs.forEach(([checkKey, noteKey, label]) => {
      if (data[checkKey] && !data[noteKey]) {
        ctx.addIssue({
          path: [noteKey],
          code: z.ZodIssueCode.custom,
          message: `${label} is required because the checkbox is selected.`,
        });
      }
    });
  });

export type RequiredInfoChecksFormValues = z.infer<
  typeof requiredInfoChecksFormSchema
>;

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
