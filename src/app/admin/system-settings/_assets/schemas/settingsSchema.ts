import { optionalNumberSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });


const SettingsLessonSchema = z.object({
  fileUploadLimit: optionalNumberSchema
});



// const UpdateLessonSchema = CreateLessonSchema.partial();
export type ISettingsForm = z.infer<typeof SettingsLessonSchema>;


export const SettingsSchema = {
  update: SettingsLessonSchema,
};
