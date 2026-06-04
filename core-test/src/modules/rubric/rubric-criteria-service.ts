import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";

// Get a single rubric criteria by its ID
// This function retrieves a specific rubric criteria by its ID with validation
// to ensure it exists.
// rubricCriteriaId - The ID of the rubric criteria to retrieve
// Returns the rubric criteria
export const getSingleRubricCriteria = async (rubricCriteriaId: string): Promise<{
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: {
    name: string;
    description: string;
    weight: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  assignmentQuestionId: string | null;
  rubricTemplateId: string | null;
  rubricTemplate: {
    id: string;
    name: string;
  } | null;
}> => {
  // Get the specific rubric criteria
  const rubricCriteria = await prisma.rubricCriteria.findUnique({
    where: {
      id: rubricCriteriaId,
    },
    include: {
      rubricTemplate: true,
    },
  });

  if (!rubricCriteria) {
    throw new AppError("Rubric criteria not found", "NOT_FOUND", 404);
  }

  return {
    id: rubricCriteria.id,
    name: rubricCriteria.name,
    description: rubricCriteria.description,
    weight: rubricCriteria.weight,
    levels: (rubricCriteria.levels as {
      name: string;
      description: string;
      weight: number;
    }[]) || [],
    createdAt: rubricCriteria.createdAt,
    updatedAt: rubricCriteria.updatedAt,
    assignmentQuestionId: rubricCriteria.assignmentQuestionId,
    rubricTemplateId: rubricCriteria.rubricTemplateId,
    rubricTemplate: rubricCriteria.rubricTemplate,
  };
};

// Updates a rubric criteria by its ID with only non-relational fields.
// Validates that the rubric criteria exists.
// rubricCriteriaId - ID of the rubric criteria to update
// updateData - Fields to update (non-relational fields only)
// Returns updated rubric criteria
export const updateRubricCriteria = async (
  rubricCriteriaId: string,
  updateData: Partial<{
    name: string;
    description: string;
    weight: number;
    levels: {
      name: string;
      description: string;
      weight: number;
    }[];
  }>,
): Promise<{
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: {
    name: string;
    description: string;
    weight: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  assignmentQuestionId: string | null;
}> => {
  // Find the rubric criteria to make sure it exists
  const existingRubricCriteria = await prisma.rubricCriteria.findUnique({
    where: {
      id: rubricCriteriaId,
    },
    include: {
      rubricTemplate: true,
    },
  });

  if (!existingRubricCriteria) {
    throw new AppError("Rubric criteria not found", "NOT_FOUND", 404);
  }

  // Update the rubric criteria with only non-relational fields
  const updatedRubricCriteria = await prisma.rubricCriteria.update({
    where: {
      id: rubricCriteriaId,
    },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return {
    id: updatedRubricCriteria.id,
    name: updatedRubricCriteria.name,
    description: updatedRubricCriteria.description,
    weight: updatedRubricCriteria.weight,
    levels: (updatedRubricCriteria.levels as {
      name: string;
      description: string;
      weight: number;
    }[]) || [],
    createdAt: updatedRubricCriteria.createdAt,
    updatedAt: updatedRubricCriteria.updatedAt,
    assignmentQuestionId: updatedRubricCriteria.assignmentQuestionId,
  };
};