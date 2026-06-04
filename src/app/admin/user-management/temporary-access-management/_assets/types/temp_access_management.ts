import z from "zod";

export const TempAccessManagementSchema = z
  .object({
    categories: z.array(
      z.object({
        categoryId: z.string().optional(),
        modules: z.array(
          z.object({
            moduleId: z.string().optional(),
            modulePermission: z.array(z.string().optional()).optional(),
          }),
        ),
      }),
    ),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    manualRevocation: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.manualRevocation) {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message:
        "Start and end dates are required when manual revocation is off.",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.manualRevocation && data.startDate && data.endDate) {
        return data.endDate.getTime() !== data.startDate.getTime();
      }
      return true;
    },
    {
      message: "End date cannot be the same as start date.",
      path: ["endDate"],
    },
  )
  .refine(
    (data) =>
      data.categories.some((c) =>
        c.modules.some(
          (m) =>
            Array.isArray(m.modulePermission) &&
            m.modulePermission.some(Boolean),
        ),
      ),
    {
      message: "At least one access permission is required.",
      path: ["categories"],
    },
  );
