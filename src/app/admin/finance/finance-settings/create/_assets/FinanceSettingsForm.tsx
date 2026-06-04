/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Form_field from "./formField/formField";
import { IFinanceSettingsForm, IFinanceSettingsSchema } from "./schemas/financeSettingsSchema";

const FinanceSettingsForm = ({
  setOpen,
  isEdit = false,
  setIsEdit,
}: {
  setOpen?: (data: boolean) => void;
  setIsEdit?: (data: boolean) => void;
  isEdit?: boolean;
}) => {
  const queryClient = useQueryClient();
  
  const form = useForm<IFinanceSettingsForm>({
    resolver: zodResolver(IFinanceSettingsSchema.create),
    defaultValues: {
      // Discount fields
      discountName: "",
      discountType: undefined,
      discountValue: undefined,
      
      // Template fields - updated to camelCase
      subjectEmail: "",
      templateEmail: "",
      subjectPayment: "",
      templatePayment: "",
      subjectReminder: "",
      templateReminder: "",
      subjectInvoice: "",
      templateInvoice: "",
      
      // Reminders
      autoReminder: false,
      frequency: undefined,
      
      // Filters
      sessionId: "",
      courseId: "",
      paymentStatus: undefined,
    },
  });

  const createFinanceSettingsMutation = useApiMutation({
  path: "finance-settings/create",
  method: "POST",
  onSuccess: (data) => {
    toast.success("Finance settings saved successfully!");
    form.reset();
    if (setOpen) setOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["fetch-finance-settings"],
    });
  },
  onError: (error) => {
    console.error("Error saving finance settings:", error);
    showToast("error", error || "Failed to save finance settings");
  },
});

  function transformFinanceSettingsForm(values: IFinanceSettingsForm) {
    return {
      discountName: values.discountName,
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      subjectEmail: values.subjectEmail ?? "",
      templateEmail: values.templateEmail ?? "",
      subjectPayment: values.subjectPayment ?? "",
      templatePayment: values.templatePayment ?? "",
      subjectReminder: values.subjectReminder ?? "",
      templateReminder: values.templateReminder ?? "",
      subjectInvoice: values.subjectInvoice ?? "",
      templateInvoice: values.templateInvoice ?? "",
      autoReminder: values.autoReminder,
      frequency: values.frequency ?? "",
      sessionId: values.sessionId ?? "",
      courseId: values.courseId ?? "",
      paymentStatus: values.paymentStatus ?? "",
    };
  }

  function onSubmit(values: IFinanceSettingsForm) {
    // Clean empty fields
    const cleanedValues = RemoveEmptyFields(values);

    // Transform to API format
    const transformedValues = transformFinanceSettingsForm(cleanedValues as IFinanceSettingsForm);

    console.log("Transformed finance settings payload:", transformedValues);

    createFinanceSettingsMutation.mutate(transformedValues as unknown as IFinanceSettingsForm);
  }

  return (
    <div className="w-full overflow-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Form_field isEditMode={isEdit} form={form} />
          </div>

          <div className="flex gap-x-3 justify-end items-center">
            {setOpen && (
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            )}
            <ActionButton
              disabled={createFinanceSettingsMutation?.isPending}
              type="submit"
              btnStyle="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
              isPending={createFinanceSettingsMutation?.isPending}
              buttonContent="Save Discount Settings"
              loadingContent="Saving..."
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FinanceSettingsForm;