import { numberSchema } from "@/lib/SchemaType/validationSchema";
import * as z from "zod";

export const formSchema = z.object({
  modules: z.array(
    z.object({
      name: z.string(),
      GET: z.boolean().default(false),
      POST: z.boolean().default(false),
      DELETE: z.boolean().default(false),
    }),
  ),
  day: numberSchema,
  manualRevocation: z.boolean(),
});

export type FormSchema = z.infer<typeof formSchema>;

export type PermissionFields =
  `modules.${number}.${"name" | "GET" | "POST" | "DELETE"}`;

export const options = [
  { value: "agent", label: "Agent" },
  { value: "sub-agent", label: "Sub-Agent" },
  { value: "application", label: "Application" },
];

export const permissionLabels: Record<string, string> = {
  GET: "Read",
  POST: "Edit",
  DELETE: "Delete",
};
