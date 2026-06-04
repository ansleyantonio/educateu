import { IFilterSessionForm } from "../schemas/FilterSessionSchema";

export type IIntakePeriod =
  | "january-april"
  | "may-august"
  | "september-december";

export const SessionFilterDefaultValue = (
  defaultValues: Partial<IFilterSessionForm> = {},
) => {
  return {
    intakePeriod: defaultValues.intakePeriod as IIntakePeriod,
    year: defaultValues.year!,
    startDate: defaultValues.startDate
      ? new Date(defaultValues.startDate)
      : undefined,
    endDate: defaultValues.endDate
      ? new Date(defaultValues.endDate)
      : undefined,

    status: defaultValues.status!,
  };
};
