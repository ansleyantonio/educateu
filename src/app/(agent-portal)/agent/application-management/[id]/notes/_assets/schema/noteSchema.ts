import { descriptionSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const addNoteFormSchema = z.object({
  note: descriptionSchema({ label: "Note", max: 1000 }),
});

export type NoteFormValues = z.infer<typeof addNoteFormSchema>;

export { addNoteFormSchema };
