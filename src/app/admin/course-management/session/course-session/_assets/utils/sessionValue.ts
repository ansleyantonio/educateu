import { ISessionForm } from "../schemas/CreateSessionFormSchema";

export type IIntakePeriod =
  | "january-april"
  | "may-august"
  | "september-december";

export const SessionDefaultValue = (
  defaultValues: Partial<ISessionForm> = {},
) => {
  return {
    name: defaultValues.name || "",
    intakePeriod: defaultValues.intakePeriod as IIntakePeriod,
    year: defaultValues.year!,
    startDate: defaultValues.startDate
      ? new Date(defaultValues.startDate)
      : undefined,
    endDate: defaultValues.endDate
      ? new Date(defaultValues.endDate)
      : undefined,

    status: defaultValues.status,
    courseIds: defaultValues.courseIds || [],
  };
};
