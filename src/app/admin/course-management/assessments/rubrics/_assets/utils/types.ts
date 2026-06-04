export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  levelName?: string;
  levelDescription?: string;
  createdAt: string;
  updatedAt: string;
  assignmentQuestionId: string;
}

export interface RubricTemplate {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rubricCriteria: RubricCriteria[];
}

export interface RubricTemplatesResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    rubricTemplates: RubricTemplate[];
  };
}

export interface RubricTemplateDetailResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    templateId: string;
    templateName: string;
    rubricCriteria: RubricCriteria[];
  };
}

