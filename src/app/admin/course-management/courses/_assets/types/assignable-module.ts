export type ModuleStatus = "ACTIVE" | "INACTIVE";
export type CourseType = "ADVANCED_COURSE" | string;
export type ModuleType = "DIPLOMA" | string;

export interface IAssignableModule {
  id: string;
  courseType: CourseType;
  moduleType: ModuleType;
  title: string;
  code: string;
  status: ModuleStatus;
  description: string;
  credit: number;
  estimatedTimeToComplete: number;
  learningOutcome: string;
  forumOrDiscussionBoard: boolean;
  awardingBodyId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface IAssignableModuleResponse {
  status: "success" | string;
  statusCode: number;
  message: string;
  data: {
    availableModules: IAssignableModule[];
  };
}
