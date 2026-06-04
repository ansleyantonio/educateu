import { createTitleSchema } from "@/lib/SchemaType/validationSchema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Permission  Types
export const permissionTypes = ["GET", "POST", "DELETE"] as const;

// Permission Labels
export const permissionLabels: Record<
  (typeof permissionTypes)[number],
  string
> = {
  GET: "Read",
  POST: "Write",
  DELETE: "Delete",
};

// Schema for Role Form
export const roleFormSchema = z.object({
  roleName: createTitleSchema("Role Name"),
  categories: z
    .array(z.string())
    .min(1, "At least one category must be selected"),
  modulePermissions: z.array(
    z.object({
      moduleId: z.string(),
      permissions: z
        .array(z.enum(permissionTypes))
        .min(1, "At least one permission must be selected"),
    }),
  ),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

// Type for Portal Categories
export interface IPortalCategory {
  id: string;
  name: string;
}

// Module Data
export interface Module {
  moduleName: string;
  moduleId: string;
  categoryId: string;
  modulePermissions: string[];
}

// Categories Data
export interface CategoriesData {
  categoryName: string;
  categoryId: string;
  modules: Module[];
}

export interface roleFormProps {
  setIsCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  token: string;
  form: UseFormReturn<RoleFormValues>;
  CategoriesData: CategoriesData[];
}
