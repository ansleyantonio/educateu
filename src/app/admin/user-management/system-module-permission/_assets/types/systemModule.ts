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
});

export type FormSchema = z.infer<typeof formSchema>;

export type PermissionFields =
  `modules.${number}.${"name" | "GET" | "POST" | "DELETE"}`;

export const modules = [
  { name: "Agent" },
  { name: "Sub-Agent" },
  { name: "Applications" },
];

export const permissionLabels: Record<string, string> = {
  GET: "Read",
  POST: "Edit",
  DELETE: "Delete",
};

export interface SystemModuleDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRows: Set<string>;
}
