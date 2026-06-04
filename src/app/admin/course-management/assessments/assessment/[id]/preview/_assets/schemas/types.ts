// Type definitions
export type QuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "fill_blank"
  | "fill_in_blank"
  | "matching"
  | "short_answer"
  | "essay"
  | "numerical_entry"
  | "ordering"
  | "file_upload";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MatchingOption {
  leftSide: QuestionOption[];
  rightSide: QuestionOption[];
}

export interface MatchingAnswer {
  leftSideId: string;
  rightSideId: string;
}

export interface NumericalAnswer {
  correctValue: number;
  tolerance: number;
}

// Base question interface
interface BaseQuestion {
  id: string;
  type: QuestionType;
  point: number;
  questionText: string;
}

// Specific question type interfaces
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: QuestionOption[];
  answer: string; // id of the correct option
}

export interface MultipleSelectQuestion extends BaseQuestion {
  type: "multiple_select";
  options: QuestionOption[];
  answer: string[]; // array of ids of correct options
  partialMark?: boolean;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  answer: boolean;
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: "fill_in_blank";
  answer: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  options: MatchingOption;
  answer: MatchingAnswer[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  placeholder?: string;
  maxLength?: number;
}

export interface EssayQuestion extends BaseQuestion {
  type: "essay";
  placeholder?: string;
  rubricCriteria?: string[];
  wordLimit?: number;
}

export interface NumericalEntryQuestion extends BaseQuestion {
  type: "numerical_entry";
  answer: NumericalAnswer;
}

export interface OrderingQuestion extends BaseQuestion {
  type: "ordering";
  options: QuestionOption[];
  answer: string[]; // array of option ids in correct order
}

export interface FileUploadQuestion extends BaseQuestion {
  type: "file_upload";
  maxFiles?: number;
  maxSizeMB?: number;
  fileTypes?: string[];
}

// Union type for all question types
export type Question =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | MatchingQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | NumericalEntryQuestion
  | OrderingQuestion
  | FileUploadQuestion;

// Type for the questions array
export type QuestionsArray = Question[];

// Assignment question structure from API (matches actual API response)
export interface AssignmentQuestionSubmissionType {
  type?: string; // e.g., "file-upload" (hyphenated, lowercase)
  maxFileSize?: number; // Size in MB
  acceptedTypes?: string[]; // e.g., ["pdf", "docx"]
}

export interface AssignmentQuestion {
  id: string;
  questionText: string;
  point: number;
  submissionType?: AssignmentQuestionSubmissionType;
  // Note: API doesn't return type field at top level, it's in submissionType.type
  // Other fields may be present for different question types but are not in the base API response
  rubricName?: string;
  rubricDescription?: string;
  options?: QuestionOption[] | MatchingOption;
  partialMark?: boolean;
  placeholder?: string;
  maxLength?: number;
  wordLimit?: number;
  rubricCriteria?: string[];
}

// Map API types to QuestionType format
// Handles both formats: "file-upload" (hyphenated) and "FILE_UPLOAD" (uppercase underscore)
export const mapApiTypeToQuestionType = (
  apiType: string | undefined
): QuestionType => {
  if (!apiType) return "file_upload"; // Default fallback

  // Normalize the input: convert to lowercase and handle hyphens/underscores
  const normalized = apiType.toLowerCase().replace(/-/g, "_");

  // Convert API type to QuestionType format
  const typeMap: Record<string, QuestionType> = {
    multiple_choice: "multiple_choice",
    multiple_select: "multiple_select",
    true_false: "true_false",
    fill_blank: "fill_in_blank",
    fill_in_blank: "fill_in_blank",
    matching: "matching",
    short_answer: "short_answer",
    essay: "essay",
    numerical_entry: "numerical_entry",
    ordering: "ordering",
    file_upload: "file_upload",
    // Handle uppercase variants
    MULTIPLE_CHOICE: "multiple_choice",
    MULTIPLE_SELECT: "multiple_select",
    TRUE_FALSE: "true_false",
    FILL_BLANK: "fill_blank",
    MATCHING: "matching",
    SHORT_ANSWER: "short_answer",
    ESSAY: "essay",
    NUMERICAL_ENTRY: "numerical_entry",
    ORDERING: "ordering",
    FILE_UPLOAD: "file_upload",
  };

  return typeMap[normalized] || typeMap[apiType.toUpperCase()] || "file_upload";
};
