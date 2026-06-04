import { IPromotionalCodeFormSchema } from "../schemas/promotionCode";

export const PromotionalCodeDefaultValue = (
  defaultValues: Partial<IPromotionalCodeFormSchema> = {}
): IPromotionalCodeFormSchema => {
  return {
    codeName: defaultValues.codeName || "",
    discountType: defaultValues.discountType || "",
    status: defaultValues.status || "",
    discountValue: defaultValues.discountValue as number,
    NoExpirationDate: defaultValues.NoExpirationDate || false,
    startDate: defaultValues.startDate
      ? new Date(defaultValues.startDate)
      : undefined,

    endDate: defaultValues.endDate
      ? new Date(defaultValues.endDate)
      : undefined,
  };
};
