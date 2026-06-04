import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";

// Type for quiz question creation (required fields including index)
type QuizQuestionInput = {
  type:
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_SELECT"
    | "FILL_BLANK"
    | "TRUE_FALSE"
    | "MATCHING"
    | "NUMERICAL_ENTRY"
    | "ORDERING";
  index: number;
};

// Validate quiz question data based on question type
const validateQuizQuestionData = (
  questionType: string,
  updateData: Partial<{
    questionText: string;
    point: number;
    options: unknown;
    answer: unknown;
  }>,
) => {
  // Only validate if options or answer are being updated
  if (updateData.options === undefined && updateData.answer === undefined) {
    return;
  }

  switch (questionType) {
    case "MULTIPLE_CHOICE":
      if (updateData.answer !== undefined) {
        if (typeof updateData.answer !== "string" && typeof updateData.answer !== "number") {
          throw new AppError(
            "For MULTIPLE_CHOICE, answer must be a string (option ID) or number (option index)",
            "BAD_REQUEST",
            400,
          );
        }
      }

      if (updateData.options !== undefined) {
        if (!Array.isArray(updateData.options)) {
          throw new AppError("For MULTIPLE_CHOICE, options must be an array", "BAD_REQUEST", 400);
        }
        // Validate that options don't contain isCorrect properties
        for (const option of updateData.options) {
          if (typeof option === "object" && option !== null && "isCorrect" in option) {
            throw new AppError(
              "For MULTIPLE_CHOICE, options should not contain isCorrect property - correctness is determined by the answer field",
              "BAD_REQUEST",
              400,
            );
          }
        }
      }
      break;

    case "MULTIPLE_SELECT":
      if (updateData.answer !== undefined) {
        if (!Array.isArray(updateData.answer)) {
          throw new AppError(
            "For MULTIPLE_SELECT, answer must be an array of selected option IDs or indices",
            "BAD_REQUEST",
            400,
          );
        }
        // Ensure all elements in answer array are strings or numbers
        for (const item of updateData.answer) {
          if (typeof item !== "string" && typeof item !== "number") {
            throw new AppError(
              "For MULTIPLE_SELECT, each answer item must be a string (option ID) or number (option index)",
              "BAD_REQUEST",
              400,
            );
          }
        }
      }

      if (updateData.options !== undefined) {
        if (!Array.isArray(updateData.options)) {
          throw new AppError("For MULTIPLE_SELECT, options must be an array", "BAD_REQUEST", 400);
        }
        // Validate that options don't contain isCorrect properties
        for (const option of updateData.options) {
          if (typeof option === "object" && option !== null && "isCorrect" in option) {
            throw new AppError(
              "For MULTIPLE_SELECT, options should not contain isCorrect property - correctness is determined by the answer field",
              "BAD_REQUEST",
              400,
            );
          }
        }
      }
      break;

    case "TRUE_FALSE":
      if (updateData.answer !== undefined) {
        if (typeof updateData.answer !== "boolean") {
          throw new AppError("For TRUE_FALSE, answer must be a boolean value", "BAD_REQUEST", 400);
        }
      }
      break;

    case "FILL_BLANK":
      if (updateData.answer !== undefined) {
        if (typeof updateData.answer !== "string" && !Array.isArray(updateData.answer)) {
          throw new AppError(
            "For FILL_BLANK, answer must be a string or array of acceptable answers",
            "BAD_REQUEST",
            400,
          );
        }
        // If it's an array, ensure all elements are strings
        if (Array.isArray(updateData.answer)) {
          for (const item of updateData.answer) {
            if (typeof item !== "string") {
              throw new AppError(
                "For FILL_BLANK, if answer is an array, all elements must be strings",
                "BAD_REQUEST",
                400,
              );
            }
          }
        }
      }
      break;

    case "MATCHING":
      if (updateData.answer !== undefined) {
        if (!Array.isArray(updateData.answer)) {
          throw new AppError("For MATCHING, answer must be an array of matching pairs", "BAD_REQUEST", 400);
        }
        // Validate each matching pair
        for (const pair of updateData.answer) {
          if (typeof pair !== "object" || pair === null || !("leftSideId" in pair) || !("rightSideId" in pair)) {
            throw new AppError(
              "For MATCHING, each answer item must be an object with leftSideId and rightSideId properties",
              "BAD_REQUEST",
              400,
            );
          }
          if (
            typeof (pair as { leftSideId: unknown; rightSideId: unknown }).leftSideId !== "string" ||
            typeof (pair as { leftSideId: unknown; rightSideId: unknown }).rightSideId !== "string"
          ) {
            throw new AppError("For MATCHING, leftSideId and rightSideId must be strings", "BAD_REQUEST", 400);
          }
        }
      }

      if (updateData.options !== undefined) {
        // Check if options is an object with leftSide and rightSide properties
        if (typeof updateData.options !== 'object' || updateData.options === null ||
            !('leftSide' in updateData.options) || !('rightSide' in updateData.options)) {
          throw new AppError("For MATCHING, options must be an object with leftSide and rightSide arrays", "BAD_REQUEST", 400);
        }

        const optionsObj = updateData.options as {
          leftSide?: unknown;
          rightSide?: unknown;
        };

        if (!Array.isArray(optionsObj.leftSide) || !Array.isArray(optionsObj.rightSide)) {
          throw new AppError("For MATCHING, both leftSide and rightSide must be arrays", "BAD_REQUEST", 400);
        }

        // Validate leftSide items
        for (const item of optionsObj.leftSide as unknown[]) {
          if (typeof item !== 'object' || item === null ||
              typeof (item as { id: unknown; text: unknown }).id !== 'string' ||
              typeof (item as { id: unknown; text: unknown }).text !== 'string') {
            throw new AppError("For MATCHING, each leftSide item must have string id and text properties", "BAD_REQUEST", 400);
          }
        }

        // Validate rightSide items
        for (const item of optionsObj.rightSide as unknown[]) {
          if (typeof item !== 'object' || item === null ||
              typeof (item as { id: unknown; text: unknown }).id !== 'string' ||
              typeof (item as { id: unknown; text: unknown }).text !== 'string') {
            throw new AppError("For MATCHING, each rightSide item must have string id and text properties", "BAD_REQUEST", 400);
          }
        }
      }
      break;

    case "NUMERICAL_ENTRY":
      if (updateData.answer !== undefined) {
        if (typeof updateData.answer !== "object" || updateData.answer === null) {
          throw new AppError("For NUMERICAL_ENTRY, answer must be an object with correctValue", "BAD_REQUEST", 400);
        }
        // Type guard to safely access properties
        if (
          !("correctValue" in updateData.answer) ||
          typeof (updateData.answer as Record<string, unknown>).correctValue !== "number"
        ) {
          throw new AppError("For NUMERICAL_ENTRY, answer must include correctValue as a number", "BAD_REQUEST", 400);
        }
        if (
          "tolerance" in updateData.answer &&
          typeof (updateData.answer as Record<string, unknown>).tolerance !== "number"
        ) {
          throw new AppError("For NUMERICAL_ENTRY, tolerance must be a number if provided", "BAD_REQUEST", 400);
        }
      }
      break;

    case "ORDERING":
      if (updateData.answer !== undefined) {
        if (!Array.isArray(updateData.answer)) {
          throw new AppError("For ORDERING, answer must be an array defining the correct order", "BAD_REQUEST", 400);
        }
        // Ensure all elements in answer array are strings or numbers
        for (const item of updateData.answer) {
          if (typeof item !== "string" && typeof item !== "number") {
            throw new AppError(
              "For ORDERING, each answer item must be a string (item ID) or number (item index)",
              "BAD_REQUEST",
              400,
            );
          }
        }
      }

      if (updateData.options !== undefined) {
        if (!Array.isArray(updateData.options)) {
          throw new AppError("For ORDERING, options must be an array of items to order", "BAD_REQUEST", 400);
        }
        // Validate option structure
        for (const item of updateData.options) {
          if (typeof item !== "object" || item === null) {
            throw new AppError("For ORDERING, each option must be an object", "BAD_REQUEST", 400);
          }
        }
      }
      break;

    default:
      throw new AppError(`Unknown question type: ${questionType}`, "BAD_REQUEST", 400);
  }
};

// Creates a new quiz question for an assessment
//
// quizQuestionData - The quiz question data to create
// assessmentId - The assessment ID to associate the question with
// Returns: The created quiz question
export const createQuizQuestion = async (quizQuestionData: QuizQuestionInput, assessmentId: string) => {
  // Check if assessment exists
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Check that the assessment category is "QUIZ"
  if (String(assessment.assessmentCategory) !== "QUIZ") {
    throw new AppError("Quiz questions can only be created for assessments with category QUIZ", "BAD_REQUEST", 400);
  }

  // Get existing quiz questions for this assessment to determine max allowed index
  const existingQuizQuestions = await prisma.quizQuestion.findMany({
    where: {
      assessmentId: assessmentId,
    },
    orderBy: {
      createdAt: "asc", // Order by creation time to get the current sequence
    },
  });

  // The index should not be greater than the current number of quiz questions
  const maxAllowedIndex = existingQuizQuestions.length;
  if (quizQuestionData.index > maxAllowedIndex) {
    throw new AppError(`Index cannot be greater than ${maxAllowedIndex}`, "BAD_REQUEST", 400);
  }

  // Create the quiz question
  const quizQuestion = await prisma.quizQuestion.create({
    data: {
      type: quizQuestionData.type,
      assessment: {
        connect: {
          id: assessmentId,
        },
      },
    },
    include: {
      assessment: true,
    },
  });

  // Update the quizQuestionsOrder field in the assessment
  // Get current quiz questions order or initialize as empty array
  let currentOrder: { quizQuestionId: string; index: number }[] = [];
  if (assessment.quizQuestionsOrder && Array.isArray(assessment.quizQuestionsOrder)) {
    currentOrder = assessment.quizQuestionsOrder as { quizQuestionId: string; index: number }[];
  }

  // Insert the new quiz question at the specified index
  const newOrderItem = { quizQuestionId: quizQuestion.id, index: quizQuestionData.index };

  // Insert at the specified index
  currentOrder.splice(quizQuestionData.index, 0, newOrderItem);

  // Update indices of items that come after the insertion point
  for (let i = quizQuestionData.index + 1; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the assessment with the new order
  await prisma.assessment.update({
    where: {
      id: assessmentId,
    },
    data: {
      quizQuestionsOrder: currentOrder,
    },
  });

  // Return the updated assessment to include the new quizQuestionOrder
  const updatedAssessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
    include: {
      awardingBody: true,
    },
  });

  // Update the quiz question to include the updated assessment with the new quizQuestionOrder
  const updatedQuizQuestion = await prisma.quizQuestion.findUnique({
    where: {
      id: quizQuestion.id,
    },
    select: {
      id: true,
      type: true,
      questionText: true,
      point: true,
      options: true,
      answer: true,
    },
  });

  return { quizQuestion: updatedQuizQuestion! };
};

// Updates a quiz question by ID
//
// quizQuestionId - The quiz question ID to update
// updateData - The data to update (only optional fields)
// Returns: The updated quiz question
export const updateQuizQuestion = async (
  quizQuestionId: string,
  updateData: Partial<{
    questionText: string;
    point: number;
    options: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    answer: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    partialMark: boolean;
  }>,
) => {
  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: {
      id: quizQuestionId,
    },
    include: {
      assessment: true,
    },
  });

  if (!quizQuestion) {
    throw new AppError("Quiz question not found", "NOT_FOUND", 404);
  }

  // Verify that the assessment exists to ensure the quiz question is valid
  if (!quizQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  // Validate the update data based on question type
  validateQuizQuestionData(quizQuestion.type, updateData);

  // Special validation for MULTI_SELECT questions: partialMark field is required
  if (quizQuestion.type === "MULTIPLE_SELECT" && updateData.partialMark === undefined) {
    throw new AppError("partialMark field is required for MULTI_SELECT questions", "BAD_REQUEST", 400);
  }

  // Check if we're updating the point value
  if (updateData.point !== undefined) {
    // Get all quiz questions for this assessment to calculate the total points
    const allQuizQuestions = await prisma.quizQuestion.findMany({
      where: {
        assessmentId: quizQuestion.assessment.id,
      },
    });

    // Calculate the total points of all quiz questions except the one being updated
    const totalOtherPoints = allQuizQuestions.reduce((sum, question) => {
      if (question.id !== quizQuestionId) {
        return sum + (question.point || 0);
      }
      return sum;
    }, 0);

    // Add the new point value for this question
    const newTotalPoints = totalOtherPoints + updateData.point;

    // Check if the new total exceeds the assessment's total points
    if (newTotalPoints > quizQuestion.assessment.totalPointsOrWeight) {
      throw new AppError(
        `Updating this quiz question's point to ${updateData.point} would exceed the assessment's total points. Current total of other questions: ${totalOtherPoints}, Assessment max: ${quizQuestion.assessment.totalPointsOrWeight}`,
        "BAD_REQUEST",
        400
      );
    }
  }

  // Prepare update data (only include provided optional fields)
  const updateInput: Prisma.QuizQuestionUpdateInput = {};

  if (updateData.questionText !== undefined) updateInput.questionText = updateData.questionText;
  if (updateData.point !== undefined) updateInput.point = updateData.point;
  if (updateData.options !== undefined) updateInput.options = updateData.options;
  if (updateData.answer !== undefined) updateInput.answer = updateData.answer;
  if (updateData.partialMark !== undefined) updateInput.partialMark = updateData.partialMark;

  const updatedQuizQuestion = await prisma.quizQuestion.update({
    where: {
      id: quizQuestionId,
    },
    data: updateInput,
    select: {
      id: true,
      type: true,
      questionText: true,
      point: true,
      options: true,
      answer: true,
      partialMark: true, // Include the partialMark field in the response
    },
  });

  return { quizQuestion: updatedQuizQuestion };
};

// Updates the index of a quiz question within an assessment
//
// quizQuestionId - The quiz question ID to update index for
// newIndex - The new index position
// Returns: The updated assessment with the new quiz question order
export const updateQuizQuestionIndex = async (quizQuestionId: string, newIndex: number) => {
  // Get the quiz question to find its assessment
  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: {
      id: quizQuestionId,
    },
    include: {
      assessment: true,
    },
  });

  if (!quizQuestion) {
    throw new AppError("Quiz question not found", "NOT_FOUND", 404);
  }

  if (!quizQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  const assessment = quizQuestion.assessment;

  // Get all existing quiz questions for this assessment to determine max allowed index
  const allQuizQuestions = await prisma.quizQuestion.findMany({
    where: {
      assessmentId: assessment.id,
    },
  });

  // The new index should not be greater than the current number of quiz questions minus 1
  const maxAllowedIndex = allQuizQuestions.length - 1;
  if (newIndex > maxAllowedIndex) {
    throw new AppError(`Index cannot be greater than ${maxAllowedIndex}`, "BAD_REQUEST", 400);
  }

  // Get current order from assessment or initialize
  let currentOrder: { quizQuestionId: string; index: number }[] = [];
  if (assessment.quizQuestionsOrder && Array.isArray(assessment.quizQuestionsOrder)) {
    currentOrder = assessment.quizQuestionsOrder as { quizQuestionId: string; index: number }[];
  } else {
    // If no order is defined yet, create initial order based on existing quiz questions
    currentOrder = allQuizQuestions.map((q, index) => ({
      quizQuestionId: q.id,
      index: index,
    }));
  }

  // Find the current index of the quiz question to be moved
  const currentIndex = currentOrder.findIndex((item) => item.quizQuestionId === quizQuestionId);
  if (currentIndex === -1) {
    throw new AppError("Quiz question not found in order list", "NOT_FOUND", 404);
  }

  // Remove the quiz question from its current position
  const [movedItem] = currentOrder.splice(currentIndex, 1);
  movedItem.index = newIndex; // Update its index

  // Insert the quiz question at the new position
  currentOrder.splice(newIndex, 0, movedItem);

  // Renumber all items to have sequential indices starting from 0
  for (let i = 0; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the assessment with the new order
  await prisma.assessment.update({
    where: {
      id: assessment.id,
    },
    data: {
      quizQuestionsOrder: currentOrder,
    },
  });

  // Return the updated assessment
  const updatedAssessment = await prisma.assessment.findUnique({
    where: {
      id: assessment.id,
    },
    select: {
      id: true,
      nameOrTitle: true,
      assessmentCode: true,
      assessmentCategory: true,
      assessmentType: true,
      descriptionOrInstructions: true,
      status: true,
      availableStartDate: true,
      availableEndDate: true,
      timeLimit: true,
      totalPointsOrWeight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      quizQuestionsOrder: true,
    },
  });

  return { assessment: updatedAssessment! };
};

// Gets all quiz questions for an assessment with pagination
//
// assessmentId - The assessment ID
// page - Page number for pagination
// pageSize - Number of items per page
// Returns: Quiz questions with pagination info
export const getQuizQuestions = async (assessmentId: string, page: number, pageSize: number) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Get all quiz questions for the assessment
  const allQuizQuestions = await prisma.quizQuestion.findMany({
    where: {
      assessmentId: assessmentId,
    },
    select: {
      id: true,
      type: true,
      questionText: true,
      point: true,
      options: true,
      answer: true,
      partialMark: true, // Include the partialMark field in the response
    },
  });

  // Get the current order from assessment
  let currentOrder: { quizQuestionId: string; index: number }[] = [];
  if (assessment.quizQuestionsOrder && Array.isArray(assessment.quizQuestionsOrder)) {
    currentOrder = assessment.quizQuestionsOrder as { quizQuestionId: string; index: number }[];
  } else {
    // If no order is defined yet, create initial order based on existing quiz questions
    currentOrder = allQuizQuestions.map((q, index) => ({
      quizQuestionId: q.id,
      index: index,
    }));
  }

  // Sort quiz questions according to the specified order
  const orderedQuizQuestions = [...allQuizQuestions].sort((a, b) => {
    const orderA = currentOrder.find((item) => item.quizQuestionId === a.id)?.index ?? Number.MAX_SAFE_INTEGER;
    const orderB = currentOrder.find((item) => item.quizQuestionId === b.id)?.index ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  // Apply pagination to the ordered list
  const { limit, offset } = getPagination(page, pageSize);

  const paginatedQuizQuestions = orderedQuizQuestions.slice(offset, offset + limit);
  const count = orderedQuizQuestions.length;

  const paginationData = {
    count: paginatedQuizQuestions.length,
    total: count,
    page: page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return { quizQuestions: paginatedQuizQuestions, pagination: paginationData };
};

// Gets a specific quiz question by ID
//
// quizQuestionId - The quiz question ID
// Returns: The quiz question
export const getQuizQuestionById = async (quizQuestionId: string) => {
  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: {
      id: quizQuestionId,
    },
    select: {
      id: true,
      type: true,
      questionText: true,
      point: true,
      options: true,
      answer: true,
      partialMark: true, // Include the partialMark field in the response
      assessment: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!quizQuestion) {
    throw new AppError("Quiz question not found", "NOT_FOUND", 404);
  }

  // Verify that the associated assessment exists
  if (!quizQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  return { quizQuestion };
};

// Deletes a quiz question by ID
//
// quizQuestionId - The quiz question ID to delete
// Returns: Success message
export const deleteQuizQuestion = async (quizQuestionId: string) => {
  const quizQuestion = await prisma.quizQuestion.findUnique({
    where: {
      id: quizQuestionId,
    },
    include: {
      assessment: true,
    },
  });

  if (!quizQuestion) {
    throw new AppError("Quiz question not found", "NOT_FOUND", 404);
  }

  if (!quizQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  const assessment = quizQuestion.assessment;

  // Delete the quiz question
  await prisma.quizQuestion.delete({
    where: {
      id: quizQuestionId,
    },
  });

  // Update the quizQuestionsOrder to remove the deleted question and reindex remaining questions
  let currentOrder: { quizQuestionId: string; index: number }[] = [];
  if (assessment.quizQuestionsOrder && Array.isArray(assessment.quizQuestionsOrder)) {
    currentOrder = assessment.quizQuestionsOrder as { quizQuestionId: string; index: number }[];
  }

  // Remove the deleted quiz question from the order
  currentOrder = currentOrder.filter((item) => item.quizQuestionId !== quizQuestionId);

  // Renumber the remaining items to have sequential indices starting from 0
  for (let i = 0; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the assessment with the new order
  await prisma.assessment.update({
    where: {
      id: assessment.id,
    },
    data: {
      quizQuestionsOrder: currentOrder,
    },
  });

  return { message: "Quiz question deleted successfully" };
};
