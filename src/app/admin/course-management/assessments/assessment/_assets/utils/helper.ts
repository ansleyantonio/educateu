import { UseFormReturn } from "react-hook-form";
import { Assessment, CreateAssessmentValues } from "./types";

// Helper function to convert Assessment (with string dates) to CreateAssessmentValues (with Date objects)
export const convertAssessmentToFormValues = (
  assessment: Assessment | (Omit<Assessment, "id"> & { id?: string })
): CreateAssessmentValues => {

  return {
    id: assessment.id,
    nameOrTitle: assessment.nameOrTitle,
    assessmentCode: assessment.assessmentCode,
    questionSize: assessment?.questionSize ?? undefined,
    assessmentCategory: assessment.assessmentCategory,
    assessmentType: assessment.assessmentType,
    descriptionOrInstructions: assessment.descriptionOrInstructions,
    availableStartDate: assessment.availableStartDate
      ? new Date(assessment.availableStartDate)
      : undefined,
    availableEndDate: assessment.availableEndDate
      ? new Date(assessment.availableEndDate)
      : undefined,
    timeType: "minutes",
    timeLimit: assessment.timeLimit,
    totalPointsOrWeight: assessment.totalPointsOrWeight,
    attempts: assessment.attempts,
    lateSubmissions: assessment.lateSubmissions,
    passingScore: assessment.passingScore ?? undefined,
    dueDate: assessment.dueDate ? new Date(assessment.dueDate) : undefined,
    awardingBodyId: assessment?.awardingBody?.id ?? undefined,
  };
};

// Move defaultValues outside component to prevent recreation on each render
export const getDefaultValues = (): CreateAssessmentValues => ({
  nameOrTitle: "",
  assessmentCode: "",
  assessmentCategory: "QUIZ",
  assessmentType: "DEGREE",
  descriptionOrInstructions: "",
  availableStartDate: undefined,
  availableEndDate: undefined,
  timeType: "minutes",
  timeLimit: 60,
  totalPointsOrWeight: 100,
  attempts: 1,
  lateSubmissions: false,
  passingScore: undefined,
  dueDate: undefined,
  awardingBodyId: undefined,
  questionSize: 20,
});

export const isDetailsFormValid = async ({
  form,
}: {
  form: UseFormReturn<CreateAssessmentValues | Assessment>;
}) => {
  // Validate only the fields in the details form
  const baseFields = [
    "nameOrTitle",
    "assessmentCategory",
    "assessmentType",
    "descriptionOrInstructions",
  ] as const;

  const assessmentType = form.watch("assessmentType");
  const assessmentCategory = form.watch("assessmentCategory");
  const requiresAwardingBody =
    assessmentType === "DEGREE" || assessmentType === "DIPLOMA";

  const fieldsToValidate = requiresAwardingBody
    ? ([...baseFields, "awardingBodyId"] as const)
    : baseFields;

  const isValid = await form.trigger(
    assessmentCategory === "QUIZ"
      ? [...fieldsToValidate, "questionSize"]
      : fieldsToValidate
  );

  return isValid;
};
