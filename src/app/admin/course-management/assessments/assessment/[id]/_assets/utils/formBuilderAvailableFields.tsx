import React from "react";

export interface AvailableField {
  type:
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "MATCHING"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "NUMERICAL_ENTRY"
  | "ORDERING"
  | "FILE_UPLOAD";
  label: string;
  category: "QUIZ" | "ASSIGNMENT";
  sublabel: string;
  icon: React.ReactNode;
  order: number;
}

export const AvailableFields: AvailableField[] = [
  {
    type: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    sublabel: "Single correct answer from multiple options",
    icon: <img src="/assets/icons/dot-circle.svg" alt="" style={{ width: "20px" }} />,
    order: 1,
    category: "QUIZ",
  },
  {
    type: "MULTIPLE_SELECT",
    label: "Multiple Select",
    sublabel: "Multiple correct answers from options",
    icon: <img src="/assets/icons/checkbox-multiple-marked.svg" alt="" style={{ width: "20px" }} />,
    order: 2,
    category: "QUIZ",
  },
  {
    type: "TRUE_FALSE",
    label: "True / False",
    sublabel: "Binary choice question",
    icon: <img src="/assets/icons/outline_list.svg" alt="" style={{ width: "20px" }} />,
    order: 3,
    category: "QUIZ",
  },
  {
    type: "FILL_BLANK",
    label: "Fill in the Blank",
    sublabel: "Complete missing text in a sentence",
    icon: <img src="/assets/icons/heading.svg" alt="" style={{ width: "20px" }} />,
    order: 4,
    category: "QUIZ",
  },
  {
    type: "MATCHING",
    label: "Matching",
    sublabel: "Match items from two columns",
    icon: <img src="/assets/icons/link-box.svg" alt="" style={{ width: "20px" }} />,
    order: 5,
    category: "QUIZ",
  },
  {
    type: "SHORT_ANSWER",
    label: "Short Answer / Free Text",
    sublabel: "2-3 sentence response",
    icon: <img src="/assets/icons/file-text-fill.svg" alt="" style={{ width: "20px" }} />,
    order: 6,
    category: "ASSIGNMENT",
  },
  {
    type: "ESSAY",
    label: "Essay / Long Answer",
    sublabel: "Extended written response",
    icon: <img src="/assets/icons/textbox-filled.svg" alt="" style={{ width: "20px" }} />,
    order: 7,
    category: "ASSIGNMENT",
  },
  {
    type: "NUMERICAL_ENTRY",
    label: "Numerical Entry",
    sublabel: "Number input with tolerance",
    icon: <img src="/assets/icons/number.svg" alt="" style={{ width: "20px" }} />,
    order: 8,
    category: "QUIZ",
  },
  {
    type: "ORDERING",
    label: "Ordering / Sequence",
    sublabel: "Arrange items in correct order",
    icon: <img src="/assets/icons/rearrange-fill.svg" alt="" style={{ width: "20px" }} />,
    order: 9,
    category: "QUIZ",
  },
  {
    type: "FILE_UPLOAD",
    label: "File Upload",
    sublabel: "Student uploads a file",
    icon: <img src="/assets/icons/symbols_image.svg" alt="" style={{ width: "20px" }} />,
    order: 10,
    category: "ASSIGNMENT",
  },
];
