import { z } from "zod";

// Reusable validation schemas
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
const numberSchema = z.number().positive("Must be a positive number");
const optionalNumberSchema = z.number().positive().optional();

// Enum definitions matching API requirements
const CourseTypeEnum = z.enum(["CPD_COURSE", "PROFESSIONAL_COURSE"], {
  errorMap: () => ({
    message: "Course type must be either CPD_COURSE or PROFESSIONAL_COURSE",
  }),
});

const ScheduleFrequencyEnum = z.enum(["on demand", "once", "recurring"], {
  errorMap: () => ({ message: "Invalid schedule frequency" }),
});

const PromoCodeStatusEnum = z.enum(["ACTIVE", "INACTIVE", "UPCOMING"], {
  errorMap: () => ({ message: "Invalid promo code status" }),
});

// Helper function to handle date conversion to ISO without timezone shift
const dateToISOString = (
  date: string | Date | undefined
): string | undefined => {
  if (!date) return undefined;

  let dateString: string;

  if (typeof date === "string") {
    // If already a string like "YYYY-MM-DD", use it directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateString = date;
    } else {
      // Try to parse the date
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return undefined;
      }
      // Extract date part without timezone conversion
      dateString = parsed.toISOString().split("T")[0];
    }
  } else {
    // Date object - extract date part without timezone conversion
    dateString = date.toISOString().split("T")[0];
  }

  // Return ISO format with UTC midnight
  return `${dateString}T00:00:00Z`;
};

// Tiered pricing schema
const tieredPricingSchema = z.object({
  tierName: z.string().min(1, "Tier name is required").optional(),
  price: z.number().min(1, "Price must be at least 1").optional(),
  discountType: z
    .enum(["PERCENTAGE", "FIXED"], {
      errorMap: () => ({ message: "Invalid discount type" }),
    })
    .optional(),
});

// Create schema matching API body
const CreateCourseFeeSchema = z
  .object({
    // Required fields
    courseId: textSchema,
    overallCourseFee: z
      .union([z.string(), z.number()])
      .transform((val) => {
        const numVal =
          typeof val === "string"
            ? parseFloat(val.replace(/[^0-9.]/g, ""))
            : val;
        return numVal;
      })
      .refine((val) => !isNaN(val) && val > 0, {
        message: "Overall course fee must be a positive number",
      }),
    currencyType: textSchema,

    // Optional fields
    newCourseFee: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (!val || val === "") return undefined;
        const numVal =
          typeof val === "string"
            ? parseFloat(val.replace(/[^0-9.]/g, ""))
            : val;
        return numVal;
      })
      .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
        message: "New course fee must be a positive number",
      })
      .optional(),
    scheduleType: optionalTextSchema,
    scheduleFrequency: ScheduleFrequencyEnum.optional(),
    promoCodeStatus: PromoCodeStatusEnum.optional(),
    startDate: z
      .union([z.string(), z.date()]).refine(val => val !== undefined, "Start date is required")
      .transform((val) => dateToISOString(val)),
    endDate: z
      .union([z.string(), z.date()]).refine(val => val !== undefined, "End date is required")
      .transform((val) => dateToISOString(val)),
    effectiveDate: z
      .union([z.string(), z.date()])
      .transform((val) => dateToISOString(val))
      .optional(),
    promotionalCodes: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Validate start date is today or later
      if (data.startDate) {
        const startDate = new Date(data.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          return false;
        }
      }

      // Validate end date is on or after start date if both provided
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (endDate < startDate) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        "Start date must be today or later, end date must be on or after start date",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // Effective date must be between start and end date if end date exists
      if (data.effectiveDate && data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const effectiveDate = new Date(data.effectiveDate);

        if (effectiveDate < startDate || effectiveDate > endDate) {
          return false;
        }
      }
      // If only start date exists, effective date must be on or after start date
      else if (data.effectiveDate && data.startDate && !data.endDate) {
        const startDate = new Date(data.startDate);
        const effectiveDate = new Date(data.effectiveDate);

        if (effectiveDate < startDate) {
          return false;
        }
      }

      return true;
    },
    {
      message: "Effective date must be between start date and end date",
      path: ["effectiveDate"],
    }
  );

// Update schema - all fields optional except ID
const UpdateCourseFeeSchema = z
  .object({
    courseId: optionalTextSchema,
    overallCourseFee: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (!val || val === "") return undefined;
        const numVal =
          typeof val === "string"
            ? parseFloat(val.replace(/[^0-9.]/g, ""))
            : val;
        return numVal;
      })
      .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
        message: "Overall course fee must be a positive number",
      })
      .optional(),
    newCourseFee: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (!val || val === "") return undefined;
        const numVal =
          typeof val === "string"
            ? parseFloat(val.replace(/[^0-9.]/g, ""))
            : val;
        return numVal;
      })
      .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
        message: "New course fee must be a positive number",
      })
      .optional(),
    scheduleType: optionalTextSchema,
    scheduleFrequency: ScheduleFrequencyEnum.optional(),
    currencyType: optionalTextSchema,
    promoCodeStatus: PromoCodeStatusEnum.optional(),
    startDate: z
      .union([z.string(), z.date()]).refine(val => val !== undefined, "Start date is required").
      transform((val) => dateToISOString(val)),
    endDate: z
      .union([z.string(), z.date()]).refine(val => val !== undefined, "End date is required")
      .transform((val) => dateToISOString(val)),
    effectiveDate: z
      .union([z.string(), z.date()])
      .transform((val) => dateToISOString(val))
      .optional(),
    promotionalCodes: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Validate start date is today or later
      // if (data.startDate) {
      //   const startDate = new Date(data.startDate);
      //   const today = new Date();
      //   today.setHours(0, 0, 0, 0);
      //   if (startDate < today) {
      //     return false;
      //   }
      // }

      // Validate end date is on or after start date if both provided
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (endDate < startDate) {
          return false;
        }
      }

      return true;
    },
    // {
    //   message:
    //     "Start date must be today or later, end date must be on or after start date",
    //   path: ["startDate"],
    // }
  )
  .refine(
    (data) => {
      // Effective date must be between start and end date if end date exists
      if (data.effectiveDate && data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const effectiveDate = new Date(data.effectiveDate);

        if (effectiveDate < startDate || effectiveDate > endDate) {
          return false;
        }
      }
      // If only start date exists, effective date must be on or after start date
      else if (data.effectiveDate && data.startDate && !data.endDate) {
        const startDate = new Date(data.startDate);
        const effectiveDate = new Date(data.effectiveDate);

        if (effectiveDate < startDate) {
          return false;
        }
      }

      return true;
    },
    {
      message: "Effective date must be between start date and end date",
      path: ["effectiveDate"],
    }
  );

// Filter schema for search/filter functionality
const FilterCourseFeeSchema = z.object({
  courseId: optionalTextSchema,
  sessionId: optionalTextSchema,
  currencyType: optionalTextSchema,
  scheduleType: optionalTextSchema,
  scheduleFrequency: ScheduleFrequencyEnum.optional(),
  promoCodeStatus: PromoCodeStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type exports
export type ICourseFeeForm = z.infer<typeof CreateCourseFeeSchema>;
export type ICourseFeeUpdateForm = z.infer<typeof UpdateCourseFeeSchema>;
export type IFilterCourseFeeForm = z.infer<typeof FilterCourseFeeSchema>;

// Schema exports
export const CourseFeeSchema = {
  create: CreateCourseFeeSchema,
  update: UpdateCourseFeeSchema,
  filter: FilterCourseFeeSchema,
};

// Export enums for use in components
export { CourseTypeEnum, PromoCodeStatusEnum, ScheduleFrequencyEnum };
