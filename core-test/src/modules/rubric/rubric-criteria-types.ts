import z from "zod";

// Schema for validating rubric criteria ID parameter
export const rubricCriteriaIdParamSchema = z.object({
  id: z.string().uuid("Rubric criteria ID must be a valid UUID"),
});

// Schema for updating a rubric criteria (only non-relational fields)
export const UpdateRubricCriteriaSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  weight: z.number().int().min(0, "Weight must be a non-negative integer").optional(),
  levels: z.array(
    z.object({
      name: z.string().min(1, "Level name is required"),
      description: z.string().min(1, "Level description is required"),
      weight: z.number().int().min(0, "Level weight must be a non-negative integer"),
    })
  ).optional(),
});

// Schema for validating update rubric criteria request body
export const updateRubricCriteriaReqBodySchema = UpdateRubricCriteriaSchema;

// Schema for deleting a rubric criteria response
export const deleteRubricCriteriaResponseSchema = z.object({
  status: z.literal("success"),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.object({
    rubricCriteria: z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      description: z.string(),
      weight: z.number().min(0),
      levels: z.array(
        z.object({
          name: z.string().min(1),
          description: z.string(),
          weight: z.number().min(0),
        })
      ),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      assignmentQuestionId: z.string().uuid(),
    }),
  }),
});