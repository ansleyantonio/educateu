import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/paginationUtils";

// Gets all rubric templates with their rubric criteria
// page - Page number for pagination (default: 1)
// pageSize - Number of items per page (default: 10)
// Returns all rubric templates with pagination information
export const getRubricTemplates = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string
): Promise<{
  rubricTemplates: {
    id: string;
    name: string;
    rubricCriteriaOrder: unknown;
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
  }[];
  pagination: {
    count: number;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  } | null;
}> => {
  const { offset, limit } = getPagination(page, pageSize);

  // Build where clause with optional search term
  const whereClause: Prisma.RubricTemplateWhereInput = {};
  if (searchTerm) {
    whereClause.name = {
      contains: searchTerm,
      mode: "insensitive" as const,
    };
  }

  // Get rubric templates with pagination and optional search
  const [rubricTemplates, totalCount] = await Promise.all([
    prisma.rubricTemplate.findMany({
      skip: offset,
      take: limit,
      where: whereClause,
      include: {
        rubricCriteria: true,
      },
      orderBy: {
        createdAt: "desc", // Order by newest first
      },
    }),
    prisma.rubricTemplate.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const paginationData = {
    count: rubricTemplates.length,
    total: totalCount,
    page,
    perPage: limit,
    totalPages,
  };

  return {
    rubricTemplates: rubricTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      rubricCriteriaOrder: template.rubricCriteriaOrder,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      rubricCriteria: template.rubricCriteria.map((criteria) => ({
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
        assignmentQuestionId: criteria.assignmentQuestionId,
      })),
    })),
    pagination: paginationData,
  };
};

// Gets all rubric criteria for a specific rubric template with proper ordering
// templateId - ID of the rubric template
// Returns rubric template ID, name, and ordered rubric criteria
export const getRubricCriteriaForTemplate = async (
  templateId: string,
): Promise<{
  templateId: string;
  templateName: string;
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
  const template = await prisma.rubricTemplate.findUnique({
    where: {
      id: templateId,
    },
    include: {
      rubricCriteria: true,
    },
  });

  if (!template) {
    throw new AppError("Rubric template not found", "NOT_FOUND", 404);
  }

  // If there's an order defined, sort the rubric criteria according to it
  const orderedCriteria = [];
  if (template.rubricCriteriaOrder && Array.isArray(template.rubricCriteriaOrder)) {
    const orderMap = new Map<string, number>();
    (template.rubricCriteriaOrder as Array<{ rubricCriteriaId: string; index: number }>).forEach(
      (item: { rubricCriteriaId: string; index: number }) => {
        orderMap.set(item.rubricCriteriaId, item.index);
      },
    );

    // Sort the rubric criteria by the order index
    orderedCriteria.push(
      ...[...template.rubricCriteria].sort((a, b) => {
        const indexA = orderMap.get(a.id) !== undefined ? orderMap.get(a.id)! : Infinity;
        const indexB = orderMap.get(b.id) !== undefined ? orderMap.get(b.id)! : Infinity;
        return indexA - indexB;
      }),
    );
  } else {
    // If no order is defined, return in their natural order
    orderedCriteria.push(...template.rubricCriteria);
  }

  return {
    templateId: template.id,
    templateName: template.name,
    rubricCriteria: orderedCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: (criteria.levels as {
        name: string;
        description: string;
        weight: number;
      }[]) || [],
      createdAt: criteria.createdAt,
      updatedAt: criteria.updatedAt,
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  };
};

// Creates a new rubric template with optional rubric criteria
// templateData - Template data including name, description, and optional rubric criteria connections
// Returns created rubric template with associated rubric criteria
export const createRubricTemplate = async (
  templateData: {
    name: string;
    description?: string;
    rubricCriteriaConnections?: Array<{
      type: "existing" | "new";
      rubricCriteriaId?: string;
      index: number;
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
    }>;
  }
) => {
  // Create the rubric template first
  const createdTemplate = await prisma.rubricTemplate.create({
    data: {
      name: templateData.name,
    },
  });

  // If there are criteria to connect, process them
  if (templateData.rubricCriteriaConnections && templateData.rubricCriteriaConnections.length > 0) {
    // Create the order array based on the specified indices
    const orderArray: { rubricCriteriaId: string; index: number }[] = [];

    for (const connection of templateData.rubricCriteriaConnections) {
      if (connection.type === "existing") {
        // Verify the existing criteria exists
        const existingCriteria = await prisma.rubricCriteria.findUnique({
          where: {
            id: connection.rubricCriteriaId!,
          },
        });

        if (!existingCriteria) {
          throw new AppError(`Rubric criteria with ID ${connection.rubricCriteriaId} not found`, "NOT_FOUND", 404);
        }

        // Connect the existing criteria to the template
        await prisma.rubricCriteria.update({
          where: {
            id: connection.rubricCriteriaId!,
          },
          data: {
            rubricTemplate: {
              connect: {
                id: createdTemplate.id,
              },
            },
          },
        });

        orderArray.push({ rubricCriteriaId: connection.rubricCriteriaId!, index: connection.index });
      } else {
        // For new criteria, we have an issue because all rubric criteria must be associated with an assignment question
        // We'll need to create a temporary assignment question for template criteria
        // This is a limitation of the current schema design

        const templateRubricCriteria = await prisma.rubricCriteria.create({
          data: {
            name: connection.data!.name,
            description: connection.data!.description,
            weight: connection.data!.weight,
            levels: connection.data!.levels || [],
            rubricTemplate: {
              connect: {
                id: createdTemplate.id,
              },
            },
            // assignmentQuestion is optional, so we don't need to connect it for template criteria
          },
        });

        orderArray.push({ rubricCriteriaId: templateRubricCriteria.id, index: connection.index });
      }
    }

    // Sort the order array by index to ensure proper ordering
    orderArray.sort((a, b) => a.index - b.index);

    // Update the template with the proper order
    await prisma.rubricTemplate.update({
      where: {
        id: createdTemplate.id,
      },
      data: {
        rubricCriteriaOrder: orderArray,
      },
    });
  }

  // Return the complete template with its criteria
  const fullTemplate = await prisma.rubricTemplate.findUnique({
    where: {
      id: createdTemplate.id,
    },
    include: {
      rubricCriteria: true,
    },
  });

  if (!fullTemplate) {
    throw new AppError("Created template not found", "NOT_FOUND", 404);
  }

  return {
    id: fullTemplate.id,
    name: fullTemplate.name,
    rubricCriteriaOrder: fullTemplate.rubricCriteriaOrder,
    createdAt: fullTemplate.createdAt,
    updatedAt: fullTemplate.updatedAt,
    rubricCriteria: fullTemplate.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: (criteria.levels as {
        name: string;
        description: string;
        weight: number;
      }[]) || [],
      createdAt: criteria.createdAt,
      updatedAt: criteria.updatedAt,
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  };
};

// Updates the index of a rubric criteria within a rubric template
// rubricCriteriaId - The rubric criteria ID to update index for
// newIndex - The new index position
// Returns the updated rubric template with the new rubric criteria order
export const updateRubricCriteriaTemplateIndex = async (
  rubricCriteriaId: string,
  newIndex: number
): Promise<{
  id: string;
  name: string;
  rubricCriteriaOrder: unknown;
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
  // Get the rubric criteria to find its rubric template
  const rubricCriteria = await prisma.rubricCriteria.findUnique({
    where: {
      id: rubricCriteriaId,
    },
    include: {
      rubricTemplate: {
        include: {
          rubricCriteria: true,
        },
      },
    },
  });

  if (!rubricCriteria) {
    throw new AppError("Rubric criteria not found", "NOT_FOUND", 404);
  }

  if (!rubricCriteria.rubricTemplate) {
    throw new AppError("Associated rubric template not found", "NOT_FOUND", 404);
  }

  const template = rubricCriteria.rubricTemplate;

  // Get all existing rubric criteria for this template to determine max allowed index
  const allRubricCriteria = await prisma.rubricCriteria.findMany({
    where: {
      rubricTemplateId: template.id,
    },
  });

  // The new index should not be greater than the current number of rubric criteria minus 1
  const maxAllowedIndex = allRubricCriteria.length - 1;
  if (newIndex > maxAllowedIndex) {
    throw new AppError(`Index cannot be greater than ${maxAllowedIndex}`, "BAD_REQUEST", 400);
  }

  // Get current order from template or initialize
  let currentOrder: { rubricCriteriaId: string; index: number }[] = [];
  if (template.rubricCriteriaOrder && Array.isArray(template.rubricCriteriaOrder)) {
    currentOrder = template.rubricCriteriaOrder as { rubricCriteriaId: string; index: number }[];
  } else {
    // If no order is defined yet, create initial order based on existing rubric criteria
    currentOrder = allRubricCriteria.map((c, index) => ({
      rubricCriteriaId: c.id,
      index: index,
    }));
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

  // Update the template with the new order
  await prisma.rubricTemplate.update({
    where: {
      id: template.id,
    },
    data: {
      rubricCriteriaOrder: currentOrder,
    },
  });

  // Return the updated template
  const updatedTemplate = await prisma.rubricTemplate.findUnique({
    where: {
      id: template.id,
    },
    include: {
      rubricCriteria: true,
    },
  });

  if (!updatedTemplate) {
    throw new AppError("Updated template not found", "NOT_FOUND", 404);
  }

  return {
    id: updatedTemplate.id,
    name: updatedTemplate.name,
    rubricCriteriaOrder: updatedTemplate.rubricCriteriaOrder,
    createdAt: updatedTemplate.createdAt,
    updatedAt: updatedTemplate.updatedAt,
    rubricCriteria: updatedTemplate.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: (criteria.levels as {
        name: string;
        description: string;
        weight: number;
      }[]) || [],
      createdAt: criteria.createdAt,
      updatedAt: criteria.updatedAt,
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  };
};

// Deletes a rubric criteria by its ID
// Also updates the order of remaining rubric criteria in the rubric template
// rubricCriteriaId - ID of the rubric criteria to delete
// Returns deleted rubric criteria
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

  // If the rubric criteria is associated with a template, update the template's rubric criteria order
  if (existingRubricCriteria.rubricTemplate) {
    const template = existingRubricCriteria.rubricTemplate;

    // Get current order from template
    let currentOrder: { rubricCriteriaId: string; index: number }[] = [];
    if (template.rubricCriteriaOrder && Array.isArray(template.rubricCriteriaOrder)) {
      currentOrder = template.rubricCriteriaOrder as { rubricCriteriaId: string; index: number }[];
    }

    // Remove the rubric criteria from the order
    currentOrder = currentOrder.filter(item => item.rubricCriteriaId !== rubricCriteriaId);

    // Renumber all remaining items to have sequential indices starting from 0
    for (let i = 0; i < currentOrder.length; i++) {
      currentOrder[i].index = i;
    }

    // Update the template with the new order
    await prisma.rubricTemplate.update({
      where: {
        id: template.id,
      },
      data: {
        rubricCriteriaOrder: currentOrder,
      },
    });
  }

  // Delete the rubric criteria
  const deletedRubricCriteria = await prisma.rubricCriteria.delete({
    where: {
      id: rubricCriteriaId,
    },
  });

  return {
    id: deletedRubricCriteria.id,
    name: deletedRubricCriteria.name,
    description: deletedRubricCriteria.description,
    weight: deletedRubricCriteria.weight,
    levels: (deletedRubricCriteria.levels as {
      name: string;
      description: string;
      weight: number;
    }[]) || [],
    createdAt: deletedRubricCriteria.createdAt,
    updatedAt: deletedRubricCriteria.updatedAt,
    assignmentQuestionId: deletedRubricCriteria.assignmentQuestionId,
  };
};

// Adds rubric criteria to an existing rubric template with specified indices
// templateId - ID of the rubric template to add criteria to
// criteriaConnections - Array of criteria to add (existing or new) with index positions
// Returns updated rubric template with all criteria
export const addCriteriaToRubricTemplate = async (
  templateId: string,
  criteriaConnections: Array<{
    type: "existing" | "new";
    rubricCriteriaId?: string;
    index: number;
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
  }>
): Promise<{
  id: string;
  name: string;
  rubricCriteriaOrder: unknown;
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
  // First, verify the template exists
  const template = await prisma.rubricTemplate.findUnique({
    where: {
      id: templateId,
    },
  });

  if (!template) {
    throw new AppError("Rubric template not found", "NOT_FOUND", 404);
  }

  // Get existing order or initialize as empty array
  let currentOrder: { rubricCriteriaId: string; index: number }[] = [];
  if (template.rubricCriteriaOrder && Array.isArray(template.rubricCriteriaOrder)) {
    currentOrder = template.rubricCriteriaOrder as { rubricCriteriaId: string; index: number }[];
  }

  // Process each criteria to add
  for (const connection of criteriaConnections) {
    let criteriaId: string;

    if (connection.type === "existing") {
      // Verify the existing criteria exists
      const existingCriteria = await prisma.rubricCriteria.findUnique({
        where: {
          id: connection.rubricCriteriaId!,
        },
      });

      if (!existingCriteria) {
        throw new AppError(`Rubric criteria with ID ${connection.rubricCriteriaId} not found`, "NOT_FOUND", 404);
      }

      // Associate the existing criteria with the template
      await prisma.rubricCriteria.update({
        where: {
          id: connection.rubricCriteriaId!,
        },
        data: {
          rubricTemplate: {
            connect: {
              id: templateId,
            },
          },
        },
      });

      criteriaId = connection.rubricCriteriaId!;
    } else {
      const templateRubricCriteria = await prisma.rubricCriteria.create({
        data: {
          name: connection.data!.name,
          description: connection.data!.description,
          weight: connection.data!.weight,
          levels: connection.data!.levels || [],
          rubricTemplate: {
            connect: {
              id: templateId,
            },
          },
          // assignmentQuestion is optional, so we don't need to connect it for template criteria
        },
      });

      criteriaId = templateRubricCriteria.id;
    }

    // Add to order array with specified index
    currentOrder.push({
      rubricCriteriaId: criteriaId,
      index: connection.index,
    });
  }

  // Sort the order array by index to ensure proper ordering
  currentOrder.sort((a, b) => a.index - b.index);

  // Renumber all items to maintain sequential indices after insertion
  for (let i = 0; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the template with the new order
  await prisma.rubricTemplate.update({
    where: {
      id: templateId,
    },
    data: {
      rubricCriteriaOrder: currentOrder,
    },
  });

  // Return the updated template with its criteria
  const updatedTemplate = await prisma.rubricTemplate.findUnique({
    where: {
      id: templateId,
    },
    include: {
      rubricCriteria: true,
    },
  });

  if (!updatedTemplate) {
    throw new AppError("Updated template not found", "NOT_FOUND", 404);
  }

  return {
    id: updatedTemplate.id,
    name: updatedTemplate.name,
    rubricCriteriaOrder: updatedTemplate.rubricCriteriaOrder,
    createdAt: updatedTemplate.createdAt,
    updatedAt: updatedTemplate.updatedAt,
    rubricCriteria: updatedTemplate.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: (criteria.levels as {
        name: string;
        description: string;
        weight: number;
      }[]) || [],
      createdAt: criteria.createdAt,
      updatedAt: criteria.updatedAt,
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  };
};