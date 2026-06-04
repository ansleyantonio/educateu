import z from "zod";

// Schema for validating rubric template ID parameter
export const rubricTemplateIdParamSchema = z.object({
  id: z.string().uuid("Rubric template ID must be a valid UUID"),
});

// Schema for updating a rubric criteria index for templates
export const UpdateRubricCriteriaTemplateIndexSchema = z.object({
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for validating update rubric criteria template index request body
export const updateRubricCriteriaTemplateIndexReqBodySchema = UpdateRubricCriteriaTemplateIndexSchema;

// Schema for creating a rubric template
export const CreateRubricTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
});

// Schema for connecting an existing rubric criteria
export const ConnectExistingRubricCriteriaSchema = z.object({
  type: z.literal("existing"),
  rubricCriteriaId: z.string().uuid("Rubric criteria ID must be a valid UUID"),
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for creating a new rubric criteria
export const CreateNewRubricCriteriaSchema = z.object({
  type: z.literal("new"),
  data: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    weight: z.number().int().min(0, "Weight must be a non-negative integer"),
    levels: z.array(
      z.object({
        name: z.string().min(1, "Level name is required"),
        description: z.string().min(1, "Level description is required"),
        weight: z.number().int().min(0, "Level weight must be a non-negative integer"),
      })
    ).optional().default([]),
  }),
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for either connecting existing or creating new rubric criteria
export const RubricCriteriaConnectionSchema = z.discriminatedUnion("type", [
  ConnectExistingRubricCriteriaSchema,
  CreateNewRubricCriteriaSchema,
]);

// Schema for validating create rubric criteria with mix of existing and new request body
export const createRubricCriteriaReqBodySchema = z.object({
  rubricCriteriaConnections: z
    .array(RubricCriteriaConnectionSchema)
    .optional(), // Making this optional as criteria can be added later
});

// Schema for validating create rubric template request body
export const createRubricTemplateReqBodySchema = CreateRubricTemplateSchema.merge(createRubricCriteriaReqBodySchema);

// Schema for validating query parameters for getting rubric templates with pagination
export const getRubricTemplatesQuerySchema = z.object({
  page: z.string().transform(Number).optional().default("1"),
  pageSize: z.string().transform(Number).optional().default("10"),
  searchTerm: z.string().optional(),
});