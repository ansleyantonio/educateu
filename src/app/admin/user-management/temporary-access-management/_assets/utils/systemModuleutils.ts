import type { FormSchema } from "../types/systemModule";

export const handleDashboardChange = (
  index: number,
  checked: boolean,
  setValue: (name: string, value: boolean) => void,
) => {
  ["GET", "POST", "DELETE"].forEach((permission) =>
    setValue(`modules.${index}.${permission}`, checked),
  );
};

export const prepareSubmitData = (values: FormSchema) => {
  return values.modules.reduce(
    (acc: Record<string, { permission: string[] }>, module) => {
      acc[module.name.toLowerCase()] = {
        permission: ["GET", "POST", "DELETE"].filter(
          (p) => module[p as keyof typeof module],
        ),
      };
      return acc;
    },
    {},
  );
};
