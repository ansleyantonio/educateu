import { z } from "zod";

export const updateRequestFormSchema = z
  .object({
    personal_information: z.boolean().optional(),
    personal_informationNote: z.string().optional(),

    academic_background: z.boolean().optional(),
    academic_backgroundNote: z.string().optional(),

    course_selection: z.boolean().optional(),
    course_selectionNote: z.string().optional(),

    personal_statement: z.boolean().optional(),
    personal_statementNote: z.string().optional(),

    disability_and_accessibility: z.boolean().optional(),
    disability_and_accessibilityNote: z.string().optional(),

    next_of_kin: z.boolean().optional(),
    next_of_kinNote: z.string().optional(),

    funds: z.boolean().optional(),
    fundsNote: z.string().optional(),

    references: z.boolean().optional(),
    referencesNote: z.string().optional(),

    criminal_background: z.boolean().optional(),
    criminal_backgroundNote: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const pairs: [keyof typeof data, keyof typeof data, string][] = [
      [
        "personal_information",
        "personal_informationNote",
        "Personal information note",
      ],
      [
        "academic_background",
        "academic_backgroundNote",
        "Academic background note",
      ],
      ["course_selection", "course_selectionNote", "Course selection note"],
      [
        "personal_statement",
        "personal_statementNote",
        "Personal statement note",
      ],
      [
        "disability_and_accessibility",
        "disability_and_accessibilityNote",
        "Disability and accessibility note",
      ],
      ["next_of_kin", "next_of_kinNote", "Next of kin note"],
      ["funds", "fundsNote", "Funds note"],
      ["references", "referencesNote", "References note"],
      [
        "criminal_background",
        "criminal_backgroundNote",
        "Criminal background note",
      ],
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

export type UpdateRequestFormValues = z.infer<typeof updateRequestFormSchema>;
