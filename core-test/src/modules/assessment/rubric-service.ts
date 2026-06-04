import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";

// Connects rubric criteria to an assignment question, either creating new ones or connecting existing ones
export const connectRubricCriteriaToAssignmentQuestion = async (
  assignmentQuestionId: string,
  rubricCriteriaConnections: Array<{
    type: "existing" | "new";
    rubricCriteriaId?: string;
    data?: {
      name: string;
      description: string;
      weight: number;
      levels?: {
        name: string;
        description: string;
        weight: number;
      }[];
    };
    index: number;
  }>,
  rubricName?: string,
  rubricDescription?: string,
) => {
  // Check if assignment question exists
  const assignmentQuestion = await prisma.assignmentQuestion.findUnique({
    where: {
      id: assignmentQuestionId,
    },
    include: {
      assessment: true,
    },
  });

  if (!assignmentQuestion) {
    throw new AppError("Assignment question not found", "NOT_FOUND", 404);
  }

  // Check if rubricName and rubricDescription are empty, and if so, require them from the user
  const needsRubricDetails =
    !assignmentQuestion.rubricName ||
    assignmentQuestion.rubricName.trim() === "" ||
    !assignmentQuestion.rubricDescription ||
    assignmentQuestion.rubricDescription.trim() === "";

  if (needsRubricDetails) {
    if (!rubricName || !rubricDescription) {
      throw new AppError(
        "Rubric name and description are required when setting rubric criteria for the first time",
        "BAD_REQUEST",
        400,
      );
    }
  }

  // Prepare to update the assignment question with rubric details if provided
  const updateData: {
    rubricName?: string;
    rubricDescription?: string;
  } = {};
  if (rubricName) {
    updateData.rubricName = rubricName;
  }
  if (rubricDescription) {
    updateData.rubricDescription = rubricDescription;
  }

  const processedRubricCriteriaList = [];

  // Process each rubric criteria connection (either existing or new)
  // This will create a NEW order based on the array provided by the user
  const newOrder: { rubricCriteriaId: string; index: number }[] = [];

  // Calculate total weight of all rubric criteria being added/updated
  let totalRubricWeight = 0;
  for (const connection of rubricCriteriaConnections) {
    if (connection.type === "existing" && connection.rubricCriteriaId) {
      // For existing criteria, get the weight from database
      const existingCriteria = await prisma.rubricCriteria.findUnique({
        where: { id: connection.rubricCriteriaId },
      });

      if (!existingCriteria) {
        throw new AppError(`Rubric criteria with ID ${connection.rubricCriteriaId} not found`, "NOT_FOUND", 404);
      }

      totalRubricWeight += existingCriteria.weight;
    } else if (connection.type === "new" && connection.data) {
      // For new criteria, use the weight from the data
      totalRubricWeight += connection.data.weight;
    }
  }

  // Validate that the total rubric weight doesn't exceed the assignment question's point value
  if (assignmentQuestion.point !== null && assignmentQuestion.point !== undefined && totalRubricWeight > assignmentQuestion.point) {
    throw new AppError(
      `Total rubric criteria weight (${totalRubricWeight}) exceeds assignment question point value (${assignmentQuestion.point})`,
      "BAD_REQUEST",
      400
    );
  }

  for (let i = 0; i < rubricCriteriaConnections.length; i++) {
    const connection = rubricCriteriaConnections[i];

    let rubricCriteriaId: string;
    let rubricCriteria: {
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
    };

    if (connection.type === "existing") {
      // For existing rubric criteria, check if it exists and validate
      const existingCriteria = await prisma.rubricCriteria.findUnique({
        where: {
          id: connection.rubricCriteriaId!,
        },
      });

      if (!existingCriteria) {
        throw new AppError(`Rubric criteria with ID ${connection.rubricCriteriaId} not found`, "NOT_FOUND", 404);
      }

      // Update the assignmentQuestionId to connect to this assignment question
      const updatedCriteria = await prisma.rubricCriteria.update({
        where: {
          id: connection.rubricCriteriaId!,
        },
        data: {
          assignmentQuestion: {
            connect: {
              id: assignmentQuestionId,
            },
          },
        },
      });

      rubricCriteriaId = connection.rubricCriteriaId!;
      rubricCriteria = {
        id: updatedCriteria.id,
        name: updatedCriteria.name,
        description: updatedCriteria.description,
        weight: updatedCriteria.weight,
        levels: (Array.isArray(updatedCriteria.levels) ? updatedCriteria.levels : []) as { name: string; description: string; weight: number; }[],
        createdAt: updatedCriteria.createdAt,
        updatedAt: updatedCriteria.updatedAt,
        assignmentQuestionId: updatedCriteria.assignmentQuestionId,
      };
    } else if (connection.type === "new") {
      // For new rubric criteria, create it
      const createdCriteria = await prisma.rubricCriteria.create({
        data: {
          name: connection.data!.name,
          description: connection.data!.description,
          weight: connection.data!.weight,
          levels: connection.data!.levels || [],
          assignmentQuestion: {
            connect: {
              id: assignmentQuestionId,
            },
          },
          // Note: rubric template is optional and will be null for assignment-based criteria
        },
      });

      rubricCriteriaId = createdCriteria.id;
      rubricCriteria = {
        id: createdCriteria.id,
        name: createdCriteria.name,
        description: createdCriteria.description,
        weight: createdCriteria.weight,
        levels: (Array.isArray(createdCriteria.levels) ? createdCriteria.levels : []) as { name: string; description: string; weight: number; }[],
        createdAt: createdCriteria.createdAt,
        updatedAt: createdCriteria.updatedAt,
        assignmentQuestionId: createdCriteria.assignmentQuestionId,
      };
    } else {
      throw new AppError("Invalid connection type. Must be 'existing' or 'new'", "BAD_REQUEST", 400);
    }

    // Add to the NEW order at the specified index position
    const newOrderItem = {
      rubricCriteriaId: rubricCriteriaId,
      index: connection.index,
    };

    newOrder.push(newOrderItem);
    processedRubricCriteriaList.push(rubricCriteria);
  }

  // Sort the newOrder to ensure proper ordering by index
  newOrder.sort((a, b) => a.index - b.index);

  // Renumber everything to have sequential indices starting from 0
  for (let j = 0; j < newOrder.length; j++) {
    newOrder[j].index = j;
  }

  // Update the assignment question with the new order and rubric details
  await prisma.assignmentQuestion.update({
    where: {
      id: assignmentQuestionId,
    },
    data: {
      ...updateData,
      rubricCriteriaOrder: newOrder,
    },
  });

  return processedRubricCriteriaList;
};

// Get all rubric criteria for an assignment question with order information
//
// This function retrieves all rubric criteria associated with an assignment question
// and returns them in the order specified in the assignment question's rubricCriteriaOrder field.
//
// assignmentQuestionId - The ID of the assignment question
// Returns: The assignment question with sorted rubric criteria
export const getRubricCriteriaForAssignmentQuestion = async (assignmentQuestionId: string) => {
  // Get the assignment question with rubric criteria
  const assignmentQuestion = await prisma.assignmentQuestion.findUnique({
    where: {
      id: assignmentQuestionId,
    },
    include: {
      rubricCriteria: true,
      assessment: true,
    },
  });

  if (!assignmentQuestion) {
    throw new AppError("Assignment question not found", "NOT_FOUND", 404);
  }

  if (!assignmentQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  // Get the rubric criteria in the correct order based on rubricCriteriaOrder
  const orderedCriteria = [];

  // If there's an order defined in rubricCriteriaOrder, use it to sort
  if (assignmentQuestion.rubricCriteriaOrder && Array.isArray(assignmentQuestion.rubricCriteriaOrder)) {
    const orderMap = new Map<string, number>();
    (assignmentQuestion.rubricCriteriaOrder as Array<{ rubricCriteriaId: string; index: number }>).forEach(
      (item: { rubricCriteriaId: string; index: number }) => {
        orderMap.set(item.rubricCriteriaId, item.index);
      },
    );

    // Sort the rubric criteria by the order index
    const sortedCriteria = [...assignmentQuestion.rubricCriteria].sort((a, b) => {
      const indexA = orderMap.get(a.id) !== undefined ? orderMap.get(a.id)! : Infinity;
      const indexB = orderMap.get(b.id) !== undefined ? orderMap.get(b.id)! : Infinity;
      return indexA - indexB;
    });

    orderedCriteria.push(...sortedCriteria);
  } else {
    // If no order is defined, return in their natural order
    orderedCriteria.push(...assignmentQuestion.rubricCriteria);
  }

  return {
    assignmentQuestionId: assignmentQuestion.id,
    rubricName: assignmentQuestion.rubricName,
    rubricDescription: assignmentQuestion.rubricDescription,
    rubricCriteria: orderedCriteria,
  };
};

// Deletes a rubric criteria by its ID and updates the order of remaining criteria
// Validates that the rubric criteria exists
//
// rubricCriteriaId - ID of the rubric criteria to delete
// Returns: Deleted rubric criteria
export const deleteRubricCriteria = async (
  rubricCriteriaId: string,
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
  // Find the rubric criteria to delete
  const rubricCriteria = await prisma.rubricCriteria.findUnique({
    where: {
      id: rubricCriteriaId,
    },
    include: {
      assignmentQuestion: true,
    },
  });

  if (!rubricCriteria) {
    throw new AppError("Rubric criteria not found", "NOT_FOUND", 404);
  }

  // If this rubric criteria is associated with an assignment question, work with it
  if (rubricCriteria.assignmentQuestionId && !rubricCriteria.assignmentQuestion) {
    throw new AppError("Associated assignment question not found", "NOT_FOUND", 404);
  }

  const assignmentQuestion = rubricCriteria.assignmentQuestion;

  // Get the current order
  let currentOrder: { rubricCriteriaId: string; index: number }[] = [];
  if (
    assignmentQuestion &&
    assignmentQuestion.rubricCriteriaOrder &&
    Array.isArray(assignmentQuestion.rubricCriteriaOrder)
  ) {
    currentOrder = [...(assignmentQuestion.rubricCriteriaOrder as { rubricCriteriaId: string; index: number }[])];
  }

  // Remove the rubric criteria from the order array
  currentOrder = currentOrder.filter((item) => item.rubricCriteriaId !== rubricCriteriaId);

  // Renumber all remaining items to have sequential indices starting from 0
  for (let i = 0; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the assignment question with the new order
  if (assignmentQuestion) {
    await prisma.assignmentQuestion.update({
      where: {
        id: assignmentQuestion.id,
      },
      data: {
        rubricCriteriaOrder: currentOrder,
      },
    });
  }

  // Now delete the rubric criteria
  await prisma.rubricCriteria.delete({
    where: {
      id: rubricCriteriaId,
    },
  });

  return {
    id: rubricCriteria.id,
    name: rubricCriteria.name,
    description: rubricCriteria.description,
    weight: rubricCriteria.weight,
    levels: Array.isArray(rubricCriteria.levels) 
      ? (rubricCriteria.levels as {
          name: string;
          description: string;
          weight: number;
        }[]) 
      : [],
    createdAt: rubricCriteria.createdAt,
    updatedAt: rubricCriteria.updatedAt,
    assignmentQuestionId: rubricCriteria.assignmentQuestionId,
  };
};

// Creates a rubric template from an assignment question
// Uses the rubric criteria of that assignment question and the order from that assignment question
//
// assignmentQuestionId - ID of the assignment question to use as source
// templateName - Name for the new rubric template
// Returns: Created rubric template with its criteria
export const createRubricTemplateFromAssignmentQuestion = async (
  assignmentQuestionId: string,
  templateName: string,
): Promise<{
  id: string;
  name: string;
  rubricCriteriaOrder: unknown; // Using unknown instead of any for JSON value
  createdAt: Date;
  updatedAt: Date;
  rubricCriteria: {
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
  }[];
}> => {
  // Get the assignment question with its rubric criteria
  const assignmentQuestion = await prisma.assignmentQuestion.findUnique({
    where: {
      id: assignmentQuestionId,
    },
    include: {
      rubricCriteria: true,
      assessment: true,
    },
  });

  if (!assignmentQuestion) {
    throw new AppError("Assignment question not found", "NOT_FOUND", 404);
  }

  if (!assignmentQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  // If there are no rubric criteria for this assignment question, we can't create a template
  if (assignmentQuestion.rubricCriteria.length === 0) {
    throw new AppError("Assignment question has no rubric criteria to create a template from", "BAD_REQUEST", 400);
  }

  // Create a new rubric template
  const newRubricTemplate = await prisma.rubricTemplate.create({
    data: {
      name: templateName,
    },
  });

  // Use the existing order from the assignment question for the new template
  const rubricCriteriaOrder = assignmentQuestion.rubricCriteriaOrder;

  // Create copies of the rubric criteria for the new template,
  // linking them to the same assignment question but also to the template
  for (const criteria of assignmentQuestion.rubricCriteria) {
    await prisma.rubricCriteria.create({
      data: {
        name: criteria.name,
        description: criteria.description,
        weight: criteria.weight,
        levels: criteria.levels as unknown as Prisma.JsonObject,
        assignmentQuestionId: criteria.assignmentQuestionId, // Link to the original assignment question
        rubricTemplateId: newRubricTemplate.id,
      },
    });
  }

  // Get the created rubric template with rubric criteria
  const updatedRubricTemplate = await prisma.rubricTemplate.findUnique({
    where: {
      id: newRubricTemplate.id,
    },
    include: {
      rubricCriteria: true,
    },
  });

  if (!updatedRubricTemplate) {
    throw new AppError("Failed to create rubric template", "INTERNAL_SERVER_ERROR", 500);
  }

  return {
    id: updatedRubricTemplate.id,
    name: updatedRubricTemplate.name,
    rubricCriteriaOrder: updatedRubricTemplate.rubricCriteriaOrder,
    createdAt: updatedRubricTemplate.createdAt,
    updatedAt: updatedRubricTemplate.updatedAt,
    rubricCriteria: updatedRubricTemplate.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: Array.isArray(criteria.levels) 
        ? (criteria.levels as {
            name: string;
            description: string;
            weight: number;
          }[]) 
        : [],
      createdAt: criteria.createdAt,
      updatedAt: criteria.updatedAt,
      assignmentQuestionId: criteria.assignmentQuestionId, // Note: This links to assignment question per current schema
    })),
  };
};

// Updates a rubric criteria by its ID with only non-relational fields.
// Validates that the rubric criteria exists.
//
// rubricCriteriaId - ID of the rubric criteria to update
// updateData - Fields to update (non-relational fields only)
// Returns: Updated rubric criteria
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
      assignmentQuestion: true,
    },
  });

  if (!existingRubricCriteria) {
    throw new AppError("Rubric criteria not found", "NOT_FOUND", 404);
  }

  // assignmentQuestion is now optional, so we only check if it exists
  if (existingRubricCriteria.assignmentQuestionId && !existingRubricCriteria.assignmentQuestion) {
    throw new AppError("Associated assignment question not found", "NOT_FOUND", 404);
  }

  // If updating the weight, validate that the total rubric weight doesn't exceed the assignment question's point value
  if (updateData.weight !== undefined && existingRubricCriteria.assignmentQuestion) {
    // Get all rubric criteria for this assignment question
    const allRubricCriteria = await prisma.rubricCriteria.findMany({
      where: {
        assignmentQuestionId: existingRubricCriteria.assignmentQuestionId,
      },
    });

    // Calculate the total weight of all rubric criteria except the one being updated
    const totalOtherWeights = allRubricCriteria.reduce((sum, criteria) => {
      if (criteria.id !== rubricCriteriaId) {
        return sum + criteria.weight;
      }
      return sum;
    }, 0);

    // Add the new weight for this criteria
    const newTotalWeight = totalOtherWeights + updateData.weight;

    // Check if the assignment question has a point value (it should) and if the new total exceeds it
    if (existingRubricCriteria.assignmentQuestion.point !== null &&
        existingRubricCriteria.assignmentQuestion.point !== undefined &&
        newTotalWeight > existingRubricCriteria.assignmentQuestion.point) {
      throw new AppError(
        `Updating this rubric criteria's weight to ${updateData.weight} would exceed the assignment question's point value. Current total of other criteria: ${totalOtherWeights}, Question max: ${existingRubricCriteria.assignmentQuestion.point}`,
        "BAD_REQUEST",
        400
      );
    }
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
    levels: Array.isArray(updatedRubricCriteria.levels) 
      ? (updatedRubricCriteria.levels as {
          name: string;
          description: string;
          weight: number;
        }[]) 
      : [],
    createdAt: updatedRubricCriteria.createdAt,
    updatedAt: updatedRubricCriteria.updatedAt,
    assignmentQuestionId: updatedRubricCriteria.assignmentQuestionId,
  };
};

// Updates the index of a rubric criteria within an assignment question
//
// rubricCriteriaId - The rubric criteria ID to update index for
// newIndex - The new index position
// Returns: The updated assignment question with the new rubric criteria order
export const updateRubricCriteriaIndex = async (rubricCriteriaId: string, newIndex: number) => {
  // Get the rubric criteria to find its assignment question
  const rubricCriteria = await prisma.rubricCriteria.findUnique({
    where: {
      id: rubricCriteriaId,
    },
    include: {
      assignmentQuestion: {
        include: {
          rubricCriteria: true,
        },
      },
    },
  });

  if (!rubricCriteria) {
    throw new AppError("Rubric criteria not found", "NOT_FOUND", 404);
  }

  // If this rubric criteria is associated with an assignment question, work with it
  if (rubricCriteria.assignmentQuestionId && !rubricCriteria.assignmentQuestion) {
    throw new AppError("Associated assignment question not found", "NOT_FOUND", 404);
  }

  const assignmentQuestion = rubricCriteria.assignmentQuestion;

  // Get all existing rubric criteria for this assignment question to determine max allowed index
  // Only proceed if assignmentQuestion exists
  if (!assignmentQuestion) {
    throw new AppError(
      "Cannot update index - rubric criteria is not associated with an assignment question",
      "BAD_REQUEST",
      400,
    );
  }

  const allRubricCriteria = await prisma.rubricCriteria.findMany({
    where: {
      assignmentQuestionId: assignmentQuestion.id,
    },
  });

  // The new index should not be greater than the current number of rubric criteria minus 1
  const maxAllowedIndex = allRubricCriteria.length - 1;
  if (newIndex > maxAllowedIndex) {
    throw new AppError(`Index cannot be greater than ${maxAllowedIndex}`, "BAD_REQUEST", 400);
  }

  // Get current order from assignment question or initialize
  let currentOrder: { rubricCriteriaId: string; index: number }[] = [];
  if (
    assignmentQuestion &&
    assignmentQuestion.rubricCriteriaOrder &&
    Array.isArray(assignmentQuestion.rubricCriteriaOrder)
  ) {
    currentOrder = [...(assignmentQuestion.rubricCriteriaOrder as { rubricCriteriaId: string; index: number }[])];
  } else {
    // If no order is defined yet, create initial order based on existing rubric criteria
    currentOrder = allRubricCriteria.map((c, index) => ({
      rubricCriteriaId: c.id,
      index: index,
    }));
  }

  // Make sure all rubric criteria from the assignment question are in the order list
  const allRubricCriteriaIds = new Set(allRubricCriteria.map((c) => c.id));
  const existingOrderIds = new Set(currentOrder.map((item) => item.rubricCriteriaId));

  // Add any missing rubric criteria to the order list
  for (const criteria of allRubricCriteria) {
    if (!existingOrderIds.has(criteria.id)) {
      currentOrder.push({
        rubricCriteriaId: criteria.id,
        index: currentOrder.length, // Add at the end
      });
    }
  }

  // Find the current index of the rubric criteria to be moved
  const currentIndex = currentOrder.findIndex((item) => item.rubricCriteriaId === rubricCriteriaId);
  if (currentIndex === -1) {
    throw new AppError("Rubric criteria not found in order list", "NOT_FOUND", 404);
  }

  // Remove the rubric criteria from its current position
  const [movedItem] = currentOrder.splice(currentIndex, 1);
  movedItem.index = newIndex; // Update its index

  // Insert the rubric criteria at the new position
  currentOrder.splice(newIndex, 0, movedItem);

  // Renumber all items to have sequential indices starting from 0
  for (let i = 0; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the assignment question with the new order
  if (assignmentQuestion) {
    await prisma.assignmentQuestion.update({
      where: {
        id: assignmentQuestion.id,
      },
      data: {
        rubricCriteriaOrder: currentOrder,
      },
    });
  }

  // Return the updated assignment question with the re-ordered rubric criteria
  const updatedAssignmentQuestion = await prisma.assignmentQuestion.findUnique({
    where: {
      id: assignmentQuestion.id,
    },
    include: {
      rubricCriteria: true,
    },
  });

  // Apply the order to the rubric criteria
  const orderMap = new Map<string, number>();
  if (updatedAssignmentQuestion?.rubricCriteriaOrder && Array.isArray(updatedAssignmentQuestion.rubricCriteriaOrder)) {
    (updatedAssignmentQuestion.rubricCriteriaOrder as Array<{ rubricCriteriaId: string; index: number }>).forEach(
      (item: { rubricCriteriaId: string; index: number }) => {
        orderMap.set(item.rubricCriteriaId, item.index);
      },
    );
  }

  // Sort the rubric criteria by the order index
  const orderedCriteria = [...(updatedAssignmentQuestion?.rubricCriteria || [])].sort((a, b) => {
    const indexA = orderMap.get(a.id) !== undefined ? orderMap.get(a.id)! : Infinity;
    const indexB = orderMap.get(b.id) !== undefined ? orderMap.get(b.id)! : Infinity;
    return indexA - indexB;
  });

  return {
    assignmentQuestion: {
      id: updatedAssignmentQuestion!.id,
      assessmentId: updatedAssignmentQuestion!.assessmentId,
      questionText: updatedAssignmentQuestion!.questionText,
      submissionType: updatedAssignmentQuestion!.submissionType,
      point: updatedAssignmentQuestion!.point,
      createdAt: updatedAssignmentQuestion!.createdAt,
      updatedAt: updatedAssignmentQuestion!.updatedAt,
      rubricName: updatedAssignmentQuestion!.rubricName,
      rubricDescription: updatedAssignmentQuestion!.rubricDescription,
      rubricCriteriaOrder: updatedAssignmentQuestion!.rubricCriteriaOrder,
      rubricCriteria: orderedCriteria,
    },
  };
};