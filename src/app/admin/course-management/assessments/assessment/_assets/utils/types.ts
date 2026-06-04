export type AssessmentStatus = "DRAFT" | "PUBLISHED";

export type Assessment = {
  id: string;
  nameOrTitle: string;
  assessmentCode: string;
  assessmentCategory: AssessmentCategory;
  assessmentType: AssessmentType;
  questionSize: number;
  descriptionOrInstructions: string;
  status: AssessmentStatus;
  availableStartDate: string;
  availableEndDate: string;
  timeLimit: number;
  totalPointsOrWeight: number;
  passingScore?: number;
  attempts: number;
  lateSubmissions: boolean;
  dueDate?: string | null;
  awardingBodyId?: string | null;
  // Legacy fields for backward compatibility
  title?: string;
  code?: string;
  type?: string;
  point?: string;
  awardingBody: {
    id: string;
  };
};

export type AssessmentCategory = "QUIZ" | "ASSIGNMENT";
export type AssessmentType = "DEGREE" | "DIPLOMA" | "CPD" | "PROFESSIONAL";

export type CreateAssessmentValues = {
  id?: string;
  nameOrTitle: string;
  assessmentCode: string;
  assessmentCategory: AssessmentCategory;
  assessmentType: AssessmentType;
  questionSize: number;
  descriptionOrInstructions: string;
  availableStartDate: Date | undefined;
  availableEndDate: Date | undefined;
  timeLimit: number;
  timeType?: "minutes" | "hours";
  totalPointsOrWeight: number;
  attempts: number;
  lateSubmissions: boolean;
  passingScore?: number;
  dueDate?: Date;
  awardingBodyId?: string;
};

export type AwardingBodyStatus = "ACTIVE" | "INACTIVE";

export type AwardingBody = {
  id: string;
  name: string;
  code: string;
  abbreviation: string;
  status: AwardingBodyStatus;
  intakePeriods: string[];
  requiredDocuments: string[];
  createdAt: string;
  updatedAt: string;
};

export type AwardingBodiesResponse = {
  status: string;
  statusCode: number;
  message: string;
  data: {
    awardingBodies: AwardingBody[];
  };
};

export type CourseType = "CPD" | "Degree";
