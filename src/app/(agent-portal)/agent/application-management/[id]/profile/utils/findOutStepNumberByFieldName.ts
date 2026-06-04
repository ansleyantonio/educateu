import { z } from "zod";
import { new_application } from "../../../create/[id]/_assets/interface/application/new_application";

type FieldName = keyof z.infer<typeof new_application.CreateFromSchema>;

const stepDate = [
  "personal_information",
  "academic_background",
  "course_selection",
  "personal_statement",
  "disability_and_accessibility",
  "next_of_kin",
  "fund",
  "references_fromSchema",
  "criminal_background",
  "supporting_documents",
];
export const findOutStepNumberByFieldName = (fieldName: FieldName) => {
  const stepNumber = stepDate.findIndex((key: string) => key == fieldName);
  return stepNumber + 1;
};

export default findOutStepNumberByFieldName;
