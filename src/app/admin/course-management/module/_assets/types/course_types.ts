export interface Milestone {
  id: string;
  title: string;
  details: string;
  duration: string;
  modules: Module[];
  isSelected?: boolean;
}

export interface Module {
  id: string;
  title: string;
  details: string;
  duration: string;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  title: string;
  link: string;
  duration: string;
}

export interface IContent {
  id: string;
  title: string;
  description: string;
  type: "video" | "image" | "pdf" | "text" | string;
  paths: string[];
  lessonId: string;
}
