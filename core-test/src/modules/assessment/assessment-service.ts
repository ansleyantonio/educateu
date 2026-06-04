import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";
import { generateUniqueCode } from "../../utils/miscUtils";
import { CreateAssessment, AssessmentCategory, AssessmentType, UpdateAssessment } from "./types";

// Creates a new assessment
//
// assessmentData - The assessment data to create
// Returns: The created assessment
export const createAssessment = async (assessmentData: CreateAssessment) => {
  // Handle assessment code - if not provided, generate one
  let assessmentCode = assessmentData.assessmentCode;
  if (!assessmentCode) {
    // Keep generating a new code until we find one that doesn't exist
    let uniqueCodeFound = false;
    while (!uniqueCodeFound) {
      assessmentCode = generateUniqueCode();
      const existingAssessment = await prisma.assessment.findFirst({
        where: {
          assessmentCode: assessmentCode,
        },
      });
      uniqueCodeFound = !existingAssessment;
    }
  } else {
    // Check if the provided assessment code already exists
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        assessmentCode: assessmentCode,
      },
    });

    if (existingAssessment) {
      throw new AppError("Assessment with this code already exists", "BAD_REQUEST", 400);
    }
  }

  // Prepare data for creation
  const createData: Prisma.AssessmentCreateInput = {
    nameOrTitle: assessmentData.nameOrTitle,
    assessmentCode: assessmentCode,
    assessmentCategory: assessmentData.assessmentCategory,
    assessmentType: assessmentData.assessmentType,
    questionSize: assessmentData.questionSize,
    descriptionOrInstructions: assessmentData.descriptionOrInstructions,
    status: "DRAFT", // Default status is DRAFT
    availableStartDate: assessmentData.availableStartDate,
    availableEndDate: assessmentData.availableEndDate,
    timeLimit: assessmentData.timeLimit,
    totalPointsOrWeight: assessmentData.totalPointsOrWeight,
    weight: assessmentData.weight,
    passingScore: assessmentData.passingScore,
    attempts: assessmentData.attempts,
    lateSubmissions: assessmentData.lateSubmissions,
    dueDate: assessmentData.dueDate,
  };

  // Add awardingBodyId if provided
  if (assessmentData.awardingBodyId) {
    createData.awardingBody = {
      connect: {
        id: assessmentData.awardingBodyId,
      },
    };
  }

  const assessment = await prisma.assessment.create({
    data: createData,
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
      weight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      awardingBody: {
        select: {
          id: true,
          name: true,
          code: true,
          abbreviation: true,
          status: true,
          intakePeriods: true,
        },
      },
    },
  });

  return { assessment };
};

// Gets assessments with optional filtering and pagination
//
// page - Page number for pagination
// pageSize - Number of items per page
// assessmentCategory - Optional category filter
// assessmentType - Optional type filter
// searchTerm - Optional search term for nameOrTitle
// Returns: Assessments with pagination info
export const getAssessments = async (
  page: number,
  pageSize: number,
  assessmentCode?: string,
  assessmentCategory?: AssessmentCategory,
  assessmentType?: AssessmentType,
  timeLimit?: number,
  totalPointsOrWeight?: number,
  searchTerm?: string,
) => {
  const { limit, offset } = getPagination(page, pageSize);

  const where: Prisma.AssessmentWhereInput = {
    AND: [
      ...(assessmentCode ? [{ assessmentCode }] : []),
      ...(assessmentCategory ? [{ assessmentCategory }] : []),
      ...(assessmentType ? [{ assessmentType }] : []),
      ...(timeLimit ? [{ timeLimit }] : []),
      ...(totalPointsOrWeight ? [{ totalPointsOrWeight }] : []),
      ...(searchTerm
        ? [
            {
              OR: [
                {
                  nameOrTitle: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  assessmentCode: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          ]
        : []),
    ],
  };

  const [assessments, count] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        nameOrTitle: true,
        assessmentCode: true,
        assessmentCategory: true,
        assessmentType: true,
        questionSize: true,
        descriptionOrInstructions: true,
        status: true,
        availableStartDate: true,
        availableEndDate: true,
        timeLimit: true,
        totalPointsOrWeight: true,
        weight: true,
        passingScore: true,
        attempts: true,
        lateSubmissions: true,
        dueDate: true,
        awardingBody: {
          select: {
            id: true,
            name: true,
            code: true,
            abbreviation: true,
            status: true,
            intakePeriods: true,
          },
        },
      },
    }),
    prisma.assessment.count({
      where,
    }),
  ]);

  const paginationData = {
    count: assessments.length,
    total: count,
    page: page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return { assessments, pagination: paginationData };
};

// Gets an assessment by ID
//
// id - The assessment ID
// Returns: The assessment with related data
export const getAssessmentById = async (id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      nameOrTitle: true,
      assessmentCode: true,
      assessmentCategory: true,
      assessmentType: true,
      questionSize: true,
      descriptionOrInstructions: true,
      status: true,
      availableStartDate: true,
      availableEndDate: true,
      timeLimit: true,
      totalPointsOrWeight: true,
      weight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      awardingBody: {
        select: {
          id: true,
          name: true,
          code: true,
          abbreviation: true,
          status: true,
          intakePeriods: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  return { assessment };
};

// Updates an assessment by ID
//
// id - The assessment ID to update
// updateData - The data to update
// Returns: The updated assessment
export const updateAssessment = async (id: string, updateData: Partial<UpdateAssessment>) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      assessmentCategory: true,
      assessmentCode: true,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Validate questionSize based on assessment category
  if (updateData.questionSize !== undefined) {
    if (assessment.assessmentCategory === "QUIZ" && (updateData.questionSize === null || updateData.questionSize < 0)) {
      throw new AppError(
        "questionSize is required for QUIZ assessments and must be a non-negative integer",
        "BAD_REQUEST",
        400,
      );
    }
    if (
      assessment.assessmentCategory === "ASSIGNMENT" &&
      updateData.questionSize !== null &&
      updateData.questionSize !== undefined
    ) {
      throw new AppError("questionSize must not be provided for ASSIGNMENT assessments", "BAD_REQUEST", 400);
    }
  }

  // Check if assessment code is being changed and if the new code already exists
  if (updateData.assessmentCode && updateData.assessmentCode !== assessment.assessmentCode) {
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        assessmentCode: updateData.assessmentCode,
        id: {
          not: id,
        },
      },
    });

    if (existingAssessment) {
      throw new AppError("Assessment with this code already exists", "BAD_REQUEST", 400);
    }
  }

  // Prepare update data
  const updateInput: Prisma.AssessmentUpdateInput = {
    nameOrTitle: updateData.nameOrTitle,
    assessmentCode: updateData.assessmentCode,
    questionSize: updateData.questionSize,
    descriptionOrInstructions: updateData.descriptionOrInstructions,
    status: updateData.status,
    availableStartDate: updateData.availableStartDate,
    availableEndDate: updateData.availableEndDate,
    timeLimit: updateData.timeLimit,
    totalPointsOrWeight: updateData.totalPointsOrWeight,
    weight: updateData.weight,
    passingScore: updateData.passingScore,
    attempts: updateData.attempts,
    lateSubmissions: updateData.lateSubmissions,
    dueDate: updateData.dueDate,
  };

  // Handle conditional awardingBodyId
  if (updateData.awardingBodyId !== undefined) {
    if (updateData.awardingBodyId) {
      updateInput.awardingBody = {
        connect: {
          id: updateData.awardingBodyId,
        },
      };
    } else {
      updateInput.awardingBody = {
        disconnect: true,
      };
    }
  }

  const updatedAssessment = await prisma.assessment.update({
    where: {
      id,
    },
    data: updateInput,
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
      weight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      questionSize: true,
      awardingBody: {
        select: {
          id: true,
          name: true,
          code: true,
          abbreviation: true,
          status: true,
          intakePeriods: true,
        },
      },
    },
  });

  return { assessment: updatedAssessment };
};

// Updates only the status of an assessment by ID with validation
//
// id - The assessment ID to update
// newStatus - The new status value
// Returns: The updated assessment
export const updateAssessmentStatus = async (id: string, newStatus: string) => {
  // Get the assessment with questions and criteria to validate total points
  const assessment = await prisma.assessment.findUnique({
    where: {
      id,
    },
    include: {
      quizQuestions: true,
      assignmentQuestions: {
        include: {
          rubricCriteria: true,
        },
      },
      awardingBody: true,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Validation: Check if totalPointsOrWeight matches the sum of all question points

  // Calculate sum of quiz question points if it's a QUIZ assessment
  let totalCalculatedPoints = 0;
  if (assessment.assessmentCategory === "QUIZ") {
    const quizQuestionPoints = assessment.quizQuestions.reduce((sum, question) => sum + (question.point || 0), 0);
    totalCalculatedPoints = quizQuestionPoints;
  }
  // Calculate sum of assignment question points and rubric criteria weights if it's an ASSIGNMENT assessment
  else if (assessment.assessmentCategory === "ASSIGNMENT") {
    for (const assignmentQuestion of assessment.assignmentQuestions) {
      // Add the assignment question point to the total
      totalCalculatedPoints += assignmentQuestion.point || 0;

      // For assignment questions, validate that assignment question point equals the sum of rubric criteria weights
      const rubricCriteriaWeightSum = assignmentQuestion.rubricCriteria.reduce(
        (sum, criteria) => sum + (criteria.weight || 0),
        0,
      );

      // Validation: assignment question point must equal sum of rubric criteria weights
      if (assignmentQuestion.point !== rubricCriteriaWeightSum) {
        throw new AppError(
          `Assignment question ID ${assignmentQuestion.id} point (${assignmentQuestion.point}) must equal the sum of its rubric criteria weights (${rubricCriteriaWeightSum})`,
          "BAD_REQUEST",
          400,
        );
      }
    }
  }

  // Validation: assessment's totalPointsOrWeight must equal the calculated total points
  if (assessment.totalPointsOrWeight !== totalCalculatedPoints) {
    throw new AppError(
      `Assessment total points (${assessment.totalPointsOrWeight}) must equal the sum of all associated question points (${totalCalculatedPoints})`,
      "BAD_REQUEST",
      400,
    );
  }

  // Validation: assessment with total points <= 0 cannot be published
  if (newStatus === "PUBLISHED" && assessment.totalPointsOrWeight <= 0) {
    throw new AppError(
      `Assessment with total points (${assessment.totalPointsOrWeight}) cannot be published with zero or negative points`,
      "BAD_REQUEST",
      400,
    );
  }

  // New validation: Check if any question has 0 points when publishing
  if (newStatus === "PUBLISHED") {
    if (assessment.assessmentCategory === "QUIZ") {
      const questionWithZeroPoints = assessment.quizQuestions.find((question) => (question.point || 0) <= 0);
      if (questionWithZeroPoints) {
        throw new AppError(
          `Cannot publish assessment: quiz question ID ${questionWithZeroPoints.id} has 0 or negative points`,
          "BAD_REQUEST",
          400,
        );
      }
    } else if (assessment.assessmentCategory === "ASSIGNMENT") {
      const questionWithZeroPoints = assessment.assignmentQuestions.find((question) => (question.point || 0) <= 0);
      if (questionWithZeroPoints) {
        throw new AppError(
          `Cannot publish assessment: assignment question ID ${questionWithZeroPoints.id} has 0 or negative points`,
          "BAD_REQUEST",
          400,
        );
      }
    }
  }

  // New validation: Check if all questions have proper data when publishing
  if (newStatus === "PUBLISHED") {
    if (assessment.assessmentCategory === "QUIZ") {
      // Validate that number of questions is not smaller than questionSize
      if (assessment.questionSize && assessment.quizQuestions.length < assessment.questionSize) {
        throw new AppError(
          `Cannot publish quiz assessment: number of questions (${assessment.quizQuestions.length}) is less than required questionSize (${assessment.questionSize})`,
          "BAD_REQUEST",
          400,
        );
      }
      for (const question of assessment.quizQuestions) {
        // Check if question has proper text
        if (!question.questionText || question.questionText.trim() === "") {
          throw new AppError(
            `Cannot publish assessment: quiz question ID ${question.id} is missing required question text`,
            "BAD_REQUEST",
            400,
          );
        }

        // Check if question has proper options and answers based on type
        if (question.type === "MULTIPLE_CHOICE" || question.type === "MULTIPLE_SELECT") {
          const options = Array.isArray(question.options) ? question.options : [];
          if (!options || options.length === 0) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required options`,
              "BAD_REQUEST",
              400,
            );
          }
          if (!question.answer) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required answer`,
              "BAD_REQUEST",
              400,
            );
          }
        } else if (question.type === "TRUE_FALSE") {
          if (question.answer === null || question.answer === undefined) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required answer`,
              "BAD_REQUEST",
              400,
            );
          }
        } else if (question.type === "FILL_BLANK") {
          if (
            !question.answer ||
            (typeof question.answer === "string" && question.answer.trim() === "") ||
            (Array.isArray(question.answer) && question.answer.length === 0)
          ) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required answer`,
              "BAD_REQUEST",
              400,
            );
          }
        } else if (question.type === "MATCHING") {
          const options = question.options as { leftSide?: unknown[]; rightSide?: unknown[] } | null | undefined;
          if (
            !options ||
            !options.leftSide ||
            !options.rightSide ||
            options.leftSide.length === 0 ||
            options.rightSide.length === 0
          ) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required options`,
              "BAD_REQUEST",
              400,
            );
          }
          if (!question.answer || (Array.isArray(question.answer) && question.answer.length === 0)) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required answer`,
              "BAD_REQUEST",
              400,
            );
          }
        } else if (question.type === "NUMERICAL_ENTRY") {
          const answerObj = question.answer as { correctValue?: number } | null | undefined;
          if (!answerObj || typeof answerObj !== "object" || answerObj.correctValue === undefined) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required answer`,
              "BAD_REQUEST",
              400,
            );
          }
        } else if (question.type === "ORDERING") {
          const options = Array.isArray(question.options) ? question.options : [];
          if (!options || options.length === 0) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required options`,
              "BAD_REQUEST",
              400,
            );
          }
          if (!question.answer || (Array.isArray(question.answer) && question.answer.length === 0)) {
            throw new AppError(
              `Cannot publish assessment: quiz question ID ${question.id} (${question.type}) is missing required answer`,
              "BAD_REQUEST",
              400,
            );
          }
        }
      }
    } else if (assessment.assessmentCategory === "ASSIGNMENT") {
      for (const question of assessment.assignmentQuestions) {
        // Check if assignment question has proper text
        if (!question.questionText || question.questionText.trim() === "") {
          throw new AppError(
            `Cannot publish assessment: assignment question ID ${question.id} is missing required question text`,
            "BAD_REQUEST",
            400,
          );
        }

        // Check if assignment question has a point value
        if (!question.point || question.point <= 0) {
          throw new AppError(
            `Cannot publish assessment: assignment question ID ${question.id} has 0 or negative points`,
            "BAD_REQUEST",
            400,
          );
        }
      }
    }
  }

  // Update only the status field
  const updatedAssessment = await prisma.assessment.update({
    where: {
      id,
    },
    data: {
      status: newStatus as "DRAFT" | "PUBLISHED",
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
      weight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      questionSize: true,
      awardingBody: {
        select: {
          id: true,
          name: true,
          code: true,
          abbreviation: true,
          status: true,
          intakePeriods: true,
        },
      },
    },
  });

  return { assessment: updatedAssessment };
};

// Deletes an assessment by ID
//
// id - The assessment ID to delete
// Returns: Success message
export const deleteAssessment = async (id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  await prisma.assessment.delete({
    where: {
      id,
    },
  });

  return { message: "Assessment deleted successfully" };
};

// Gets assessment preview with specific logic for quiz vs assignment
//
// assessmentId - The assessment ID to preview
// Returns: The assessment with selected questions for preview
export const getAssessmentPreview = async (assessmentId: string) => {
  // Get the assessment
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      quizQuestions: {
        select: {
          id: true,
          type: true,
          questionText: true,
          options: true,
          point: true,
          partialMark: true,
        },
      },
      assignmentQuestions: {
        select: {
          id: true,
          questionText: true,
          submissionType: true,
          point: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "ASSESSMENT_NOT_FOUND", 404);
  }

  if (assessment.assessmentCategory === "QUIZ") {
    if (assessment.questionSize === null || assessment.questionSize === undefined) {
      throw new AppError("Quiz assessment must have questionSize defined", "INVALID_QUESTION_SIZE", 400);
    }

    // For quiz assessments, verify that questionSize is not greater than total number of questions
    const totalQuestions = assessment.quizQuestions.length;
    if (assessment.questionSize > totalQuestions) {
      throw new AppError(
        `Quiz assessment has ${totalQuestions} total questions, which is less than questionSize of ${assessment.questionSize}`,
        "INVALID_QUESTION_SIZE",
        400,
      );
    }

    const questionSize = assessment.questionSize;
    const allQuestions = assessment.quizQuestions;

    // Define the type for quiz questions in preview
    type PreviewQuizQuestion = {
      id: string;
      type: string;
      questionText: string | null;
      options: unknown;
      point: number | null;
      partialMark: boolean | null;
    };

    // Group questions by type
    const questionsByType: Record<string, PreviewQuizQuestion[]> = {};
    for (const question of allQuestions) {
      if (!questionsByType[question.type]) {
        questionsByType[question.type] = [];
      }
      // Map the question to the preview format
      const previewQuestion: PreviewQuizQuestion = {
        id: question.id,
        type: question.type,
        questionText: question.questionText,
        options: question.options,
        point: question.point,
        partialMark: question.partialMark,
      };
      questionsByType[question.type].push(previewQuestion);
    }

    const uniqueTypes = Object.keys(questionsByType);
    if (uniqueTypes.length === 0) {
      // If there are no questions, return empty array
      return {
        assessment: {
          id: assessment.id,
          nameOrTitle: assessment.nameOrTitle,
          assessmentCategory: assessment.assessmentCategory,
          questionSize: assessment.questionSize,
        },
        questions: [],
      };
    }

    // Calculate how many questions to take from each type
    const questionsPerType = Math.floor(questionSize / uniqueTypes.length);
    const extraQuestions = questionSize % uniqueTypes.length;

    const selectedQuestions: PreviewQuizQuestion[] = [];

    // Take equal amount from each type (with possible extra for first few types)
    for (let i = 0; i < uniqueTypes.length; i++) {
      const type = uniqueTypes[i];
      const questionsOfType = questionsByType[type];

      // Shuffle questions of this type
      const shuffled = [...questionsOfType].sort(() => Math.random() - 0.5);

      // Take required number from this type (with possible extra for the first few types)
      const takeCount = questionsPerType + (i < extraQuestions ? 1 : 0);
      const selectedFromType = shuffled.slice(0, takeCount);

      // Remove answer-related information for preview
      const cleanedQuestions = selectedFromType.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        point: q.point,
        partialMark: q.partialMark,
      }));

      selectedQuestions.push(...cleanedQuestions);
    }

    // Shuffle the selected questions to randomize order
    const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    return {
      assessment: {
        id: assessment.id,
        nameOrTitle: assessment.nameOrTitle,
        assessmentCategory: assessment.assessmentCategory,
        questionSize: assessment.questionSize,
      },
      questions: shuffledQuestions,
    };
  } else if (assessment.assessmentCategory === "ASSIGNMENT") {
    // For assignments, return all questions as they are (without sensitive info)
    const cleanedQuestions = assessment.assignmentQuestions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      submissionType: q.submissionType,
      point: q.point,
    }));

    return {
      assessment: {
        id: assessment.id,
        nameOrTitle: assessment.nameOrTitle,
        assessmentCategory: assessment.assessmentCategory,
      },
      questions: cleanedQuestions,
    };
  } else {
    throw new AppError("Unknown assessment category", "INVALID_ASSESSMENT_CATEGORY", 400);
  }
};

// Updates only the lateSubmissions field of an assessment by ID
//
// id - The assessment ID to update
// lateSubmissions - The new value for lateSubmissions
// Returns: The updated assessment
export const updateAssessmentLateSubmissions = async (id: string, lateSubmissions: boolean) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      lateSubmissions: true,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  const updatedAssessment = await prisma.assessment.update({
    where: {
      id,
    },
    data: {
      lateSubmissions,
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
      weight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      questionSize: true,
      awardingBody: {
        select: {
          id: true,
          name: true,
          code: true,
          abbreviation: true,
          status: true,
          intakePeriods: true,
        },
      },
    },
  });

  return { assessment: updatedAssessment };
};

// Updates only the attempts field of an assessment by ID
//
// id - The assessment ID to update
// attempts - The new value for attempts (must be at least 1)
// Returns: The updated assessment
export const updateAssessmentAttempts = async (id: string, attempts: number) => {
  // Validate attempts is at least 1
  if (attempts < 1) {
    throw new AppError("Attempts must be at least 1", "BAD_REQUEST", 400);
  }

  const assessment = await prisma.assessment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      attempts: true,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  const updatedAssessment = await prisma.assessment.update({
    where: {
      id,
    },
    data: {
      attempts,
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
      weight: true,
      passingScore: true,
      attempts: true,
      lateSubmissions: true,
      dueDate: true,
      questionSize: true,
      awardingBody: {
        select: {
          id: true,
          name: true,
          code: true,
          abbreviation: true,
          status: true,
          intakePeriods: true,
        },
      },
    },
  });

  return { assessment: updatedAssessment };
};


// Validates that the sum of weights of all assessments in each module equals 100%
export const validateModuleAssessmentWeights = async (courseId: string) => {
  // Get all modules in the course with their assessments
  const courseModules = await prisma.courseModule.findMany({
    where: {
      courseId: courseId,
    },
    include: {
      cModule: {
        include: {
          moduleAssessments: {
            include: {
              assessment: true,
            },
          },
        },
      },
    },
  });

  for (const courseModule of courseModules) {
    const module = courseModule.cModule;
    const assessments = module.moduleAssessments.map(ma => ma.assessment);
    
    // Calculate the sum of weights for assessments in this module
    const totalWeight = assessments.reduce((sum, assessment) => sum + (assessment.weight || 0), 0);
    
    // If there are assessments in the module, validate that their weights sum to 100
    if (assessments.length > 0 && totalWeight !== 100) {
      throw new AppError(
        `Module "${module.title}" assessments must have a combined weight of 100%. Current total weight: ${totalWeight}%`,
        "BAD_REQUEST",
        400
      );
    }
  }
};
