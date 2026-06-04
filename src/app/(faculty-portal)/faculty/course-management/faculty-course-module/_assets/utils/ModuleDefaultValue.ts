import { IFilterModuleForm } from "../schemas/moduleSchema";

export const ModuleDefaultValue = (
  defaultValues: Partial<IFilterModuleForm> = {}
): IFilterModuleForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    moduleType: defaultValues.moduleType || "",
    credit: defaultValues.credit!,
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete!,
  };
};
