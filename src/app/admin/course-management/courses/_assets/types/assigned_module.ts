export type IContent = {
  id: string;
  type: "video" | "image" | "pdf";
  paths: string[];
  title: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  description: string;
};

export type IAssignedLesson = {
  id: string;
  code: string;
  type: "DEGREE" | string; // extend if needed
  title: string;
  outcome: string;
  lessonContents: IContent[];
  createdAt: string;
  updatedAt: string;
  estimatedTimeToComplete: number;
};

export type IAssignedModuleLesson = {
  id: string;
  index: number;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  courseModuleId: string;
  lesson: IAssignedLesson;
};

export type CourseFaculty = {
  id: string;
  courseId: string;
  coursemoduleId: string;
  facultyId: string;
  facultyRole: "TEACHER" | "TEACHING_ASSISTANT" | string;
  createdAt: string;
  updatedAt: string;
};

export type AwardingBody = {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
};

export type IAssignedModule = {
  id: string;
  code: string;
  index: number;
  title: string;
  credit: number;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
  courseType: "ADVANCED_COURSE" | string;
  moduleType: "DIPLOMA" | "DEGREE" | string;
  description: string;
  awardingBodyId: string;
  awardingBody: AwardingBody;
  courseFaculty: CourseFaculty[];
  moduleLessons: IAssignedModuleLesson[];
  learningOutcome: string;
  forumOrDiscussionBoard: boolean;
  estimatedTimeToComplete: number;
};

export type IAssignedModulesResponse = {
  status: "success" | string;
  statusCode: number;
  message: string;
  data: {
    assignedModules: IAssignedModule[];
  };
};
