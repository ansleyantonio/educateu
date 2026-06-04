import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { Assessment } from "../../../../_assets/utils/types";
import {
  AssignmentQuestion,
  FileUploadQuestion,
  mapApiTypeToQuestionType,
  Question,
  QuestionsArray,
} from "../schemas/types";

interface UsePreviewAssessmentDataReturn {
  questions: QuestionsArray;
  assessment: Assessment | undefined;
  isLoading: boolean;
  isAssessmentLoading: boolean;
  refetch: () => void;
  refetchAssessment: () => void;
  totalPoints: number;
}

// Transform assignment question to match Question type structure
// Note: API doesn't return answer fields, so we create questions without answers
const transformAssignmentQuestion = (aq: AssignmentQuestion): Question => {
  // Determine the question type from submissionType.type (API structure)
  const questionType = mapApiTypeToQuestionType(aq.submissionType?.type);

  // Base question properties
  const baseQuestion = {
    id: aq.id,
    type: questionType,
    point: aq.point || 0,
    questionText: aq.questionText || "",
  };

  // Handle each question type with its specific fields (without answer)
  switch (questionType) {
    case "file_upload":
      return {
        ...baseQuestion,
        maxFiles: 1, // Default to 1 file if not specified
        maxSizeMB: aq.submissionType?.maxFileSize,
        fileTypes: aq.submissionType?.acceptedTypes,
      } as FileUploadQuestion;

    case "multiple_choice":
      return {
        ...baseQuestion,
        options: Array.isArray(aq.options) ? aq.options : [],
        answer: "", // Empty answer since API doesn't return it
      } as Question;

    case "multiple_select":
      return {
        ...baseQuestion,
        options: Array.isArray(aq.options) ? aq.options : [],
        answer: [], // Empty answer since API doesn't return it
        partialMark: aq.partialMark,
      } as Question;

    case "true_false":
      return {
        ...baseQuestion,
        answer: false, // Default answer since API doesn't return it
      } as Question;

    case "fill_in_blank":
      return {
        ...baseQuestion,
        answer: "", // Empty answer since API doesn't return it
      } as Question;

    case "matching":
      return {
        ...baseQuestion,
        options:
          aq.options &&
          typeof aq.options === "object" &&
          !Array.isArray(aq.options)
            ? aq.options
            : { leftSide: [], rightSide: [] },
        answer: [], // Empty answer since API doesn't return it
      } as Question;

    case "short_answer":
      return {
        ...baseQuestion,
        placeholder: aq.placeholder,
        maxLength: aq.maxLength,
      } as Question;

    case "essay":
      return {
        ...baseQuestion,
        placeholder: aq.placeholder,
        rubricCriteria: aq.rubricCriteria,
        wordLimit: aq.wordLimit,
      } as Question;

    case "numerical_entry":
      return {
        ...baseQuestion,
        answer: { correctValue: 0, tolerance: 0 }, // Default answer since API doesn't return it
      } as Question;

    case "ordering":
      return {
        ...baseQuestion,
        options: Array.isArray(aq.options) ? aq.options : [],
        answer: [], // Empty answer since API doesn't return it
      } as Question;

    default:
      // Fallback to file_upload if type is unknown
      return {
        ...baseQuestion,
        type: "file_upload",
        maxFiles: 1, // Default to 1 file if not specified
        maxSizeMB: aq.submissionType?.maxFileSize,
        fileTypes: aq.submissionType?.acceptedTypes,
      } as FileUploadQuestion;
  }
};

export const usePreviewAssessmentData = (
  id: string,
  assessmentCategory: "QUIZ" | "ASSIGNMENT" | null
): UsePreviewAssessmentDataReturn => {
  // Determine the correct endpoint based on assessment category
  const questionEndpoint =
    assessmentCategory === "ASSIGNMENT"
      ? `assessments/${id}/assignment-questions`
      : `assessments/${id}/quiz-questions`;

  const queryKey =
    assessmentCategory === "ASSIGNMENT"
      ? `fetch-list-of-assignment-questions-${id}`
      : `fetch-list-of-quiz-questions-${id}`;

  // Enable both queries when id and assessmentCategory are available
  // This ensures they fetch in parallel
  const isEnabled = !!id && !!assessmentCategory;

  // Fetch questions and assessment in parallel
  const {
    data: questionData,
    isLoading,
    refetch,
  } = useFetchData({
    path: questionEndpoint,
    method: "GET",
    queryKey: queryKey,
    enabled: isEnabled,
  });

  const {
    data: assessmentData,
    isLoading: isAssessmentLoading,
    refetch: refetchAssessment,
  } = useFetchData({
    path: `assessments/${id}`,
    method: "GET",
    queryKey: `fetch-single-assessment-${id}`,
    enabled: isEnabled, // Enable with same condition to ensure parallel fetching
  });

  // Handle different response structures for QUIZ vs ASSIGNMENT
  let questions: QuestionsArray = [];

  if (assessmentCategory === "ASSIGNMENT") {
    // Transform assignment questions to match Question type
    const assignmentQuestions = questionData?.data?.assignmentQuestions || [];
    questions = assignmentQuestions.map(transformAssignmentQuestion);
  } else {
    // Quiz questions already match the Question type structure
    questions = (questionData?.data?.quizQuestions || []) as QuestionsArray;
  }

  const assessment = assessmentData?.data?.assessment as Assessment | undefined;

  const totalPoints = questions.reduce(
    (sum: number, q: Question) => sum + (q.point || 0),
    0
  );

  return {
    questions,
    assessment,
    isLoading,
    isAssessmentLoading,
    refetch,
    refetchAssessment,
    totalPoints,
  };
};
