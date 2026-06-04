import { z } from "zod";

type ValidationSchemaProps = Partial<{
  min?: number;
  max?: number;
  label?: string;
  messages?: string;
}>;

// Name Validation
const nameSchema = z
  .string()
  .min(3, { message: "Name must be at least 3 characters long" })
  .max(50, { message: "Name must be at most 50 characters long" })
  .superRefine((val, ctx) => {
    // if (!/^[A-Z]/.test(val)) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: "Name must start with an uppercase letter (A-Z)",
    //   });
    // }
    if (!/^[A-Za-z .'-]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Name can only contain letters, spaces, and professional name characters ('.', '-', and `'`)",
      });
    }
    if (/\d/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name cannot contain numbers",
      });
    }
    if (/[@!#$%^&*()+=?/|{}[\]\\<>]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Name cannot contain special characters other than '.', '-', and `'`",
      });
    }
  });

const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(20, { message: "Username must be at most 20 characters long" })
  .superRefine((val, ctx) => {
    if (!/^[a-zA-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username must start with a letter",
      });
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Username can only contain letters, numbers, '.', '_', and '-'",
      });
    }
    if (/[\s@!#$%^&*()+=?/|{}[\]\\<>]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Username cannot contain spaces or special characters other than '.', '_', and '-'",
      });
    }
  });

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .superRefine((val, ctx) => {
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one uppercase letter",
      });
    }

    if (!/[0-9]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one number",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one special character",
      });
    }

    if (/(012|123|234|345|456|567|678|789|890)/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password cannot contain sequential numbers like 123 or 456",
      });
    }
  });

// Phone Validation
const phoneNumberSchema = z
  .string()
  .min(10, { message: "Phone number must be at least 10 digits long" })
  .max(15, { message: "Phone number must be at most 15 digits long" })
  .regex(/^\+?[0-9]+$/, {
    message:
      "Phone number can only contain digits and an optional '+' at the start",
  })
  .refine((val) => !/\s/.test(val), {
    message: "Phone number cannot contain spaces",
  });

const optionalPhoneNumberSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((val) => !val || val.length >= 10, {
    message: "Phone number must be at least 10 digits long",
  })
  .refine((val) => !val || val.length <= 15, {
    message: "Phone number must be at most 15 digits long",
  })
  .refine((val) => !val || /^\+?[0-9]+$/.test(val), {
    message:
      "Phone number can only contain digits and an optional '+' at the start",
  })
  .refine((val) => !val || !/\s/.test(val), {
    message: "Phone number cannot contain spaces",
  });

// Number Validation

const numberSchema = z.preprocess(
  (val) => {
    const num = Number(val);
    return val === "" || isNaN(num) ? undefined : num;
  },
  z
    .number({
      required_error: "Input must be a valid number",
      invalid_type_error: "Input must be a valid number",
    })
    .min(0, "Must be at least 1")
);

// Number Validation
const numberStringSchema = z
  .string()
  .min(1, { message: "Number cannot be empty" })
  .max(15, { message: "Number is too long" })
  .regex(/^-?\d+$/, {
    message: "Input must be a valid number!",
  });

const optionalNumberSchema = z
  .preprocess(
    (val) => {
      const num = Number(val);
      return val === "" || isNaN(num) ? undefined : num;
    },
    z.number({
      required_error: "Input must be a valid number",
      invalid_type_error: "Input must be a valid number",
    })
  )
  .optional();

// Address Validation
const descriptionSchema = ({
  min = 5,
  max = 1500,
  label = "Input",
}: ValidationSchemaProps) =>
  z
    .string()
    .min(min, {
      message: `${label} must be at least ${min} characters long`,
    })
    .max(max, {
      message: `${label} must be at most ${max} characters long`,
    })
    .refine((val) => /^[a-zA-Z]/.test(val), {
      message: `${label} must start with a letter (A–Z or a–z)`,
    })
    .refine((val) => /^[a-zA-Z0-9.,'\n\r\- ]+$/m.test(val), {
      message: `${label} can only contain letters, numbers, spaces, line breaks, commas, periods, apostrophes, and hyphens`,
    })
    .refine((val) => !/(  )/.test(val), {
      message: `${label} cannot contain consecutive spaces`,
    });

// Optional Description Validation
const optionalDescriptionSchema = z
  .string()
  .optional()
  .refine((val) => val === undefined || /^[a-zA-Z]/.test(val), {
    message: "Address must start with a letter (A-Z or a-z)",
  })
  .refine((val) => val === undefined || /^[a-zA-Z0-9.,' -]+$/.test(val), {
    message:
      "Address can only contain letters, numbers, spaces, commas, periods, apostrophes, and hyphens",
  })
  .refine((val) => val === undefined || !/\s{2,}/.test(val), {
    message: "Address cannot contain consecutive spaces",
  });

// Create Title Validation
const createTitleSchema = (fieldName: string) =>
  z
    .string()
    .min(3, { message: `${fieldName} must be at least 3 characters long` })
    .max(100, { message: `${fieldName} must be at most 100 characters long` })
    .refine((val) => /^[a-zA-Z]/.test(val), {
      message: `${fieldName} must start with a letter (A-Z or a-z)`,
    })
    .refine((val) => /^[a-zA-Z:' -]+$/.test(val), {
      message: `${fieldName} can only contain letters, spaces, apostrophes, and hyphens`,
    })
    .refine((val) => !/\s{2,}/.test(val), {
      message: `${fieldName} cannot contain consecutive spaces`,
    })
    .refine((val) => !/^\s|\s$/.test(val), {
      message: `${fieldName} cannot start or end with a space`,
    });

// Title Validation
const titleSchema = z
  .string()
  .min(3, { message: "Title must be at least 3 characters long" })
  .max(100, { message: "Title must be at most 100 characters long" })
  .refine((val) => /^[a-zA-Z]/.test(val), {
    message: "Title must start with a letter (A-Z or a-z)",
  })
  .refine((val) => /^[a-zA-Z:' -]+$/.test(val), {
    message: "Title can only contain letters, spaces,  apostrophes and hyphens",
  })
  .refine((val) => !/\s{2,}/.test(val), {
    message: "Title cannot contain consecutive spaces",
  });

// Text Validation
const textSchema = ({
  min = 1,
  max = 200,
  label = "Text",
}: ValidationSchemaProps = {}) =>
  z
    .string()
    .min(min, {
      message: `${label ?? "Input"} cannot be empty`,
    })
    .max(max, {
      message: `Maximum ${max} characters allowed`,
    });
// .regex(/^[^\s][a-zA-Z0-9()\-_'". ]*$/, {
//   message: `${label ?? "Input"} must not start with space and can contain letters, numbers, spaces, (), -, _, ', ",.`,
// })
// .refine((val) => !/\s{2,}/.test(val), {
//   message: `${label ?? "Input"} cannot contain multiple spaces`,
// });

//Optional Text validation
const optionalTextSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^[a-zA-Z0-9:.,_'()\-\s]*$/.test(val), {
    message:
      "Only letters, numbers, spaces, apostrophes, colons, commas, periods, underscores, hyphens, and parentheses are allowed",
  });

// Capital Text Validation
const capitalTextSchema = z
  .string()
  .min(1, { message: "Input cannot be empty" })
  .regex(/^[A-Z][a-zA-Z]*$/, {
    message:
      "Input must start with an uppercase letter and contain only letters",
  });

//Text_number validation
const textNumberSchema = z
  .string()
  .min(1, { message: "Input cannot be empty" })
  .regex(/^[a-zA-Z0-9:' -]+$/, {
    message:
      "Input can only contain letters, numbers, spaces, apostrophes, hyphens, and colons",
  });

//Optional Text_number validation

const optionalTextNumberSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\d+$/.test(val), {
    message: "Only numbers are allowed",
  });

// Export Schema
export {
  capitalTextSchema,
  createTitleSchema,
  descriptionSchema,
  nameSchema,
  numberSchema,
  numberStringSchema,
  optionalDescriptionSchema,
  optionalNumberSchema,
  optionalPhoneNumberSchema,
  optionalTextNumberSchema,
  optionalTextSchema,
  passwordSchema,
  phoneNumberSchema,
  textNumberSchema,
  textSchema,
  titleSchema,
  usernameSchema,
};
