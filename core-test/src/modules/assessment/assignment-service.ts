/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";
import { CourseSnapshot } from "../student-roaster/types";

// Creates a new assignment question for an assessment
//
// assignmentQuestionData - The assignment question data to create
// assessmentId - The assessment ID to associate the question with
// Returns: The created assignment question
export const createAssignmentQuestion = async (
  assignmentQuestionData: {
    index: number;
  },
  assessmentId: string,
) => {
  // Check if assessment exists
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Check that the assessment category is "ASSIGNMENT"
  if (String(assessment.assessmentCategory) !== "ASSIGNMENT") {
    throw new AppError(
      "Assignment questions can only be created for assessments with category ASSIGNMENT",
      "BAD_REQUEST",
      400,
    );
  }

  // Get existing assignment questions for this assessment to determine max allowed index
  const existingAssignmentQuestions = await prisma.assignmentQuestion.findMany({
    where: {
      assessmentId: assessmentId,
    },
    orderBy: {
      createdAt: "asc", // Order by creation time to get the current sequence
    },
  });

  // The index should not be greater than the current number of assignment questions
  const maxAllowedIndex = existingAssignmentQuestions.length;
  if (assignmentQuestionData.index > maxAllowedIndex) {
    throw new AppError(`Index cannot be greater than ${maxAllowedIndex}`, "BAD_REQUEST", 400);
  }

  // Create the assignment question
  const assignmentQuestion = await prisma.assignmentQuestion.create({
    data: {
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

  // Update the assignmentQuestionOrder field in the assessment
  // Get current assignment questions order or initialize as empty array
  let currentOrder: { assignmentQuestionId: string; index: number }[] = [];
  if (assessment.assignmentQuestionsOrder && Array.isArray(assessment.assignmentQuestionsOrder)) {
    currentOrder = assessment.assignmentQuestionsOrder as { assignmentQuestionId: string; index: number }[];
  }

  // Insert the new assignment question at the specified index
  const newOrderItem = { assignmentQuestionId: assignmentQuestion.id, index: assignmentQuestionData.index };

  // Insert at the specified index
  currentOrder.splice(assignmentQuestionData.index, 0, newOrderItem);

  // Update indices of items that come after the insertion point
  for (let i = assignmentQuestionData.index + 1; i < currentOrder.length; i++) {
    currentOrder[i].index = i;
  }

  // Update the assessment with the new order
  await prisma.assessment.update({
    where: {
      id: assessmentId,
    },
    data: {
      assignmentQuestionsOrder: currentOrder,
    },
  });

  // Return the updated assignment question
  const updatedAssignmentQuestion = await prisma.assignmentQuestion.findUnique({
    where: {
      id: assignmentQuestion.id,
    },
    select: {
      id: true,
      questionText: true,
      submissionType: true,
      point: true,
      rubricName: true,
      rubricDescription: true,
      assessment: {
        select: {
          id: true,
        },
      },
    },
  });

  return { assignmentQuestion: updatedAssignmentQuestion! };
};

// Updates an assignment question by ID
//
// assignmentQuestionId - The assignment question ID to update
// updateData - The data to update (only optional fields)
// Returns: The updated assignment question
export const updateAssignmentQuestion = async (
  assignmentQuestionId: string,
  updateData: Partial<{
    questionText?: string;
    submissionType?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    point?: number;
    rubricName?: string;
    rubricDescription?: string;
  }>,
) => {
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

  if (!assignmentQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  // Check if we're updating the point value
  if (updateData.point !== undefined) {
    // Get all assignment questions for this assessment to calculate the total points
    const allAssignmentQuestions = await prisma.assignmentQuestion.findMany({
      where: {
        assessmentId: assignmentQuestion.assessment.id,
      },
    });

    // Calculate the total points of all assignment questions except the one being updated
    const totalOtherPoints = allAssignmentQuestions.reduce((sum, question) => {
      if (question.id !== assignmentQuestionId) {
        return sum + (question.point || 0);
      }
      return sum;
    }, 0);

    // Add the new point value for this question
    const newTotalPoints = totalOtherPoints + updateData.point;

    // Check if the new total exceeds the assessment's total points
    if (newTotalPoints > assignmentQuestion.assessment.totalPointsOrWeight) {
      throw new AppError(
        `Updating this assignment question's point to ${updateData.point} would exceed the assessment's total points. Current total of other questions: ${totalOtherPoints}, Assessment max: ${assignmentQuestion.assessment.totalPointsOrWeight}`,
        "BAD_REQUEST",
        400,
      );
    }
  }

  // Prepare update data (only include provided optional fields)
  const updateInput: Prisma.AssignmentQuestionUpdateInput = {};

  if (updateData.questionText !== undefined) updateInput.questionText = updateData.questionText;
  if (updateData.submissionType !== undefined) updateInput.submissionType = updateData.submissionType;
  if (updateData.point !== undefined) updateInput.point = updateData.point;
  if (updateData.rubricName !== undefined) updateInput.rubricName = updateData.rubricName;
  if (updateData.rubricDescription !== undefined) updateInput.rubricDescription = updateData.rubricDescription;

  const updatedAssignmentQuestion = await prisma.assignmentQuestion.update({
    where: {
      id: assignmentQuestionId,
    },
    data: updateInput,
    select: {
      id: true,
      questionText: true,
      submissionType: true,
      point: true,
      rubricName: true,
      rubricDescription: true,
      assessment: {
        select: {
          id: true,
        },
      },
    },
  });

  return { assignmentQuestion: updatedAssignmentQuestion };
};

// Updates the index of an assignment question within an assessment
//
// assignmentQuestionId - The assignment question ID to update index for
// newIndex - The new index position
// Returns: The updated assessment with the new assignment question order
export const updateAssignmentQuestionIndex = async (assignmentQuestionId: string, newIndex: number) => {
  // Get the assignment question to find its assessment
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

  if (!assignmentQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  const assessment = assignmentQuestion.assessment;

  // Get all existing assignment questions for this assessment to determine max allowed index
  const allAssignmentQuestions = await prisma.assignmentQuestion.findMany({
    where: {
      assessmentId: assessment.id,
    },
  });

  // The new index should not be greater than the current number of assignment questions minus 1
  const maxAllowedIndex = allAssignmentQuestions.length - 1;
  if (newIndex > maxAllowedIndex) {
    throw new AppError(`Index cannot be greater than ${maxAllowedIndex}`, "BAD_REQUEST", 400);
  }

  // Get current order from assessment or initialize
  let currentOrder: { assignmentQuestionId: string; index: number }[] = [];
  if (assessment.assignmentQuestionsOrder && Array.isArray(assessment.assignmentQuestionsOrder)) {
    currentOrder = assessment.assignmentQuestionsOrder as { assignmentQuestionId: string; index: number }[];
  } else {
    // If no order is defined yet, create initial order based on existing assignment questions
    currentOrder = allAssignmentQuestions.map((q, index) => ({
      assignmentQuestionId: q.id,
      index: index,
    }));
  }

  // Find the current index of the assignment question to be moved
  const currentIndex = currentOrder.findIndex((item) => item.assignmentQuestionId === assignmentQuestionId);
  if (currentIndex === -1) {
    throw new AppError("Assignment question not found in order list", "NOT_FOUND", 404);
  }

  // Remove the assignment question from its current position
  const [movedItem] = currentOrder.splice(currentIndex, 1);
  movedItem.index = newIndex; // Update its index

  // Insert the assignment question at the new position
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
      assignmentQuestionsOrder: currentOrder,
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
      assignmentQuestionsOrder: true,
    },
  });

  return { assessment: updatedAssessment! };
};

// Gets all assignment questions for an assessment with pagination
//
// assessmentId - The assessment ID
// page - Page number for pagination
// pageSize - Number of items per page
// Returns: Assignment questions with pagination info
export const getAssignmentQuestions = async (assessmentId: string, page: number, pageSize: number) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Get all assignment questions for the assessment
  const allAssignmentQuestions = await prisma.assignmentQuestion.findMany({
    where: {
      assessmentId: assessmentId,
    },
    select: {
      id: true,
      questionText: true,
      submissionType: true,
      point: true,
      rubricName: true,
      rubricDescription: true,
    },
  });

  // Get the current order from assessment
  let currentOrder: { assignmentQuestionId: string; index: number }[] = [];
  if (assessment.assignmentQuestionsOrder && Array.isArray(assessment.assignmentQuestionsOrder)) {
    currentOrder = assessment.assignmentQuestionsOrder as { assignmentQuestionId: string; index: number }[];
  } else {
    // If no order is defined yet, create initial order based on existing assignment questions
    currentOrder = allAssignmentQuestions.map((q, index) => ({
      assignmentQuestionId: q.id,
      index: index,
    }));
  }

  // Sort assignment questions according to the specified order
  const orderedAssignmentQuestions = [...allAssignmentQuestions].sort((a, b) => {
    const orderA = currentOrder.find((item) => item.assignmentQuestionId === a.id)?.index ?? Number.MAX_SAFE_INTEGER;
    const orderB = currentOrder.find((item) => item.assignmentQuestionId === b.id)?.index ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  // Apply pagination to the ordered list
  const { limit, offset } = getPagination(page, pageSize);

  const paginatedAssignmentQuestions = orderedAssignmentQuestions.slice(offset, offset + limit);
  const count = orderedAssignmentQuestions.length;

  const paginationData = {
    count: paginatedAssignmentQuestions.length,
    total: count,
    page: page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return { assignmentQuestions: paginatedAssignmentQuestions, pagination: paginationData };
};

// Gets a specific assignment question by ID
//
// assignmentQuestionId - The assignment question ID
// Returns: The assignment question
export const getAssignmentQuestionById = async (assignmentQuestionId: string) => {
  const assignmentQuestion = await prisma.assignmentQuestion.findUnique({
    where: {
      id: assignmentQuestionId,
    },
    select: {
      id: true,
      questionText: true,
      submissionType: true,
      point: true,
      rubricName: true,
      rubricDescription: true,
      assessment: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!assignmentQuestion) {
    throw new AppError("Assignment question not found", "NOT_FOUND", 404);
  }

  if (!assignmentQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  return { assignmentQuestion };
};

// Deletes an assignment question by ID
//
// assignmentQuestionId - The assignment question ID to delete
// Returns: Success message
export const deleteAssignmentQuestion = async (assignmentQuestionId: string) => {
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

  if (!assignmentQuestion.assessment) {
    throw new AppError("Associated assessment not found", "NOT_FOUND", 404);
  }

  const assessment = assignmentQuestion.assessment;

  // Delete the assignment question
  await prisma.assignmentQuestion.delete({
    where: {
      id: assignmentQuestionId,
    },
  });

  // Update the assignmentQuestionsOrder to remove the deleted question and reindex remaining questions
  let currentOrder: { assignmentQuestionId: string; index: number }[] = [];
  if (assessment.assignmentQuestionsOrder && Array.isArray(assessment.assignmentQuestionsOrder)) {
    currentOrder = assessment.assignmentQuestionsOrder as { assignmentQuestionId: string; index: number }[];
  }

  // Remove the deleted assignment question from the order
  currentOrder = currentOrder.filter((item) => item.assignmentQuestionId !== assignmentQuestionId);

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
      assignmentQuestionsOrder: currentOrder,
    },
  });

  return { message: "Assignment question deleted successfully" };
};

// Get all assessments by moduleId
export const getAssessmentsByModuleIdService = async (studentId: string, moduleId: string) => {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: { studentId },
    select: {
      sessionCourse: {
        select: {
          courseSnapshot: true,
        },
      },
    },
  });

  if (!studentCourse?.sessionCourse?.courseSnapshot) {
    throw new Error("Student course not found");
  }

  const snapshot = studentCourse.sessionCourse.courseSnapshot as Prisma.JsonValue;
  const courseSnapshot = (typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot) as CourseSnapshot;

  // Find the module
  const module = courseSnapshot.modules?.find((m) => m.id === moduleId);
  if (!module) {
    return []; // Module not found, return empty array
  }

  // Extract assessments - using nameOrTitle instead of name/title
  return (module.moduleAssessments || [])
    .filter((ma) => ma.assessment?.id)
    .map((ma) => ({
      id: ma.assessment!.id,
      name: ma.assessment!.nameOrTitle,
      moduleId: module.id,
      moduleName: module.title,
    }));
};
