import { descriptionSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const addNoteFormSchema = z.object({
  note: descriptionSchema({ label: "Note", min: 3, max: 1000 }),
  visibility: z.enum(["PRIVATE", "PUBLIC"], {
    required_error: "Note Type is required",
  }),
});

export type NoteFormValues = z.infer<typeof addNoteFormSchema>;

export { addNoteFormSchema };
