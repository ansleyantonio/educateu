import z from "zod";

export const portalSchema = z.object({
  name: z.string().min(1, "Portal name is required"),
});
export type portalType = z.infer<typeof portalSchema>;

// export const moduleIdSchema = z.array(
//   z.object({
//     id: z.string().min(1, "Module ID is required"),
//   })
// );

export const portalCategoryModuleSchema = z.object({
  portalCategoryId: z.string().min(1, "Portal Category ID is required"),
  moduleIds: z.array(z.string()).min(1, "At least one module ID is required"),
});
export type portalCategoryModuleType = z.infer<
  typeof portalCategoryModuleSchema
>;
