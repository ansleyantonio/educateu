import z from "zod";
import { nonEmptyString } from "../../types";

export const createRoleReqBodySchema = z.object({
  roleName: nonEmptyString,
  categories: z.array(
    z.object({
      categoryName: nonEmptyString,
      categoryId: z.string().uuid(),
      modules: z.array(
        z.object({
          moduleName: nonEmptyString,
          moduleId: z.string().uuid(),
          categoryId: z.string().uuid(),
          modulePermissions: z.array(z.enum(["GET", "POST", "PUT", "DELETE"])),
        }),
      ),
    }),
  ),

  // })
  // portalCategoryName: nonEmptyString,
  // modules: z.array(
  //   z.object({
  //     moduleName: nonEmptyString,
  //     modulePermission: z
  //       .array(z.enum(["GET", "POST", "PUT", "DELETE"]))
  //       .default(["GET", "POST", "PUT", "DELETE"]),
  //   }),
  // ),
});

export type CreateRoleReqBody = z.infer<typeof createRoleReqBodySchema>;

export const filterRolesReqBodySchema = z
  .object({
    searchTerm: nonEmptyString.optional(),
    moduleFilters: z
      .array(
        z.object({
          moduleName: nonEmptyString,
          modulePermission: z
            .array(z.enum(["GET", "POST", "PUT", "DELETE"]))
            .min(1)
            .optional(),
        }),
      )
      .min(1)
      .optional(),
    portalCategoryFilters: z
      .array(
        z.object({
          name: nonEmptyString,
        }),
      )
      .min(1)
      .optional(),
    page: z.coerce.number().int().default(1),
  })
  .strict();

export type FilterRolesReqBody = z.infer<typeof filterRolesReqBodySchema>;

export const updateRoleReqBodySchema = z
  .object({
    roleName: nonEmptyString.optional(),
    modules: z
      .array(
        z.object({
          moduleName: nonEmptyString,
          modulePermission: z
            .array(z.enum(["GET", "POST", "PUT", "DELETE"]))
            .min(1),
          // .default(["GET", "POST", "PUT", "DELETE"]),
        }),
      )
      .min(1)
      .optional(),
  })
  .refine(
    (data) => {
      return Object.values(data).some((value) => value !== undefined);
    },
    {
      message: "At least one field must be present",
    },
  );

export type UpdateRoleReqBody = z.infer<typeof updateRoleReqBodySchema>;

export const getRolesReqQuerySchema = z.object({
  portal: nonEmptyString.optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().default(1),
});

export type GetRolesReqQuery = z.infer<typeof getRolesReqQuerySchema>;
