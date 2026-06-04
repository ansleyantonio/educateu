
import { z } from "zod";

// Helper function to convert kebab-case to camelCase
const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

// Base schema with all fields optional
const BaseSchema = z.object({
  cv: z.array(z.string()).optional(),
  consentForm: z.array(z.string()).optional(),
  personalStatement: z.array(z.string()).optional(),
  englishCertificates: z.array(z.string()).optional(),
  essay: z.array(z.string()).optional(),
  passportId: z.array(z.string()).optional(),
  qualification: z.array(z.string()).optional(),
  proofOfNameChange: z.array(z.string()).optional(),
  nationalIdentification: z.array(z.string()).optional(),
  policeClearance: z.array(z.string()).optional(),
  transcripts: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  otherDocument: z.array(z.string()).optional(),
});

// Function to create dynamic schema based on required documents
export const createDocumentFormSchema = (requiredDocs: string[] = []) => {
  // Convert kebab-case required docs to camelCase
  const requiredFields = requiredDocs.map(kebabToCamel);
  
  // Build schema dynamically
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  
  // All possible fields
  const allFields = [
    "cv",
    "consentForm",
    "personalStatement",
    "englishCertificates",
    "essay",
    "passportId",
    "qualification",
    "proofOfNameChange",
    "nationalIdentification",
    "policeClearance",
    "transcripts",
    "references",
    "otherDocument",
  ];
  
  allFields.forEach((field) => {
    if (requiredFields.includes(field)) {
      // Required field: must have at least one file
      schemaShape[field] = z
        .array(z.string())
        .min(1, `${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
    } else {
      // Optional field
      schemaShape[field] = z.array(z.string()).optional();
    }
  });
  
  const DynamicSchema = z.object(schemaShape);
  
  return z.object({
    supportingDocument: DynamicSchema.optional(),
  });
};

// Static schema for backward compatibility (all optional)
export const DocumentFormSchema = z.object({
  supportingDocument: BaseSchema.optional(),
});
// import { z } from "zod";
// const Schema = z.object({
//   cv: z.array(z.string()).optional(),
//   personalStatement: z.array(z.string()).optional(),
//   consentForm: z.array(z.string()).optional(),
//   englishCertificates: z.array(z.string()).optional(),
//   essay: z.array(z.string()).optional(),
//   passportId: z.array(z.string()).optional(),
//   qualification: z.array(z.string()).optional(),
//   proofOfNameChange: z.array(z.string()).optional(),
//   nationalIdentification: z.array(z.string()).optional(),
//   policeClearance: z.array(z.string()).optional(),
//   transcripts: z.array(z.string()).optional(),
//   references: z.array(z.string()).optional(),
//   otherDocument: z.array(z.string()).optional(),
// });

// export const DocumentFormSchema = z.object({
//   supportingDocument: Schema.optional(),
// });
