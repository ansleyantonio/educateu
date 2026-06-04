
import { z } from "zod";

export const rubricLevelSchema = z.object({
  name: z.string().min(1, "Level name must be at least 1 character"),
  description: z.string().min(1, "Level description must be at least 1 character").optional(),
  weight: z.number().int().min(0, "Level weight must be a non-negative integer"),
});

export const rubricCriteriaSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  weight: z.number().int().min(0).optional(),
  levels: z.array(rubricLevelSchema).optional(),
});

export const connectRubricSchema = z.object({
  rubricName: z.string().min(1, "Rubric name must be at least 1 character"),
  rubricDescription: z.string().min(1, "Rubric description must be at least 1 character"),

  // for more flexibility
  name: z.string().min(1, "Rubric name must be at least 1 character").optional(),

  rubricCriteriaConnections: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("existing"),
        index: z.number().min(0),
        rubricCriteriaId: z.string().min(1),
        data: z.never().optional(), // ensures data is not allowed
      }),

      z.object({
        type: z.literal("new"),
        index: z.number().min(0),
        data: rubricCriteriaSchema,
        rubricCriteriaId: z.never().optional(), // ensures id is not allowed
      }),
    ])
  ),
});


export const rubricSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Rubric name must be at least 1 character").optional(),
  templateName: z.string().min(1, "Rubric name must be at least 1 character").optional(),
  description: z.string().min(1, "Rubric description must be at least 1 character").optional(),
  rubricCriteria: z.array(rubricCriteriaSchema),
});


export type Rubric = z.infer<typeof rubricSchema>;

export type ConnectRubric = z.infer<typeof connectRubricSchema>;

export type RubricCriteria = z.infer<typeof rubricCriteriaSchema>;
export type RubricLevel = z.infer<typeof rubricLevelSchema>;

