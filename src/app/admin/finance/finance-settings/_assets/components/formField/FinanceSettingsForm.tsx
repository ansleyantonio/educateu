/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import onFormError from "@/utils/formError";
import { Edit2, Loader2 } from "lucide-react";

import ActionButton from "@/components/common/button/actionButton";
import { IFinanceSettingsForm, IFinanceSettingsSchema } from "../../schemas/financeSettingsSchema";
import Form_field from "./formField";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

const FinanceSettingsForm = ({
  setOpen,
  isEdit = false,
  setIsEdit,
  discountFee,
}: {
  setOpen?: (data: boolean) => void;
  setIsEdit?: (data: boolean) => void;
  isEdit?: boolean;
  discountFee?: any;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const queryClient = useQueryClient();
  
  const form = useForm<IFinanceSettingsForm>({
    resolver: zodResolver(IFinanceSettingsSchema.create),
    defaultValues: {
      // Discount fields
      discountName: discountFee?.discountName || "",
      discountType: discountFee?.discountType || undefined,
      discountValue: discountFee?.discountValue || undefined,
      
      // Template fields - updated to camelCase
      subjectEmail: discountFee?.subjectEmail || "",
      templateEmail: discountFee?.templateEmail || "",
      subjectPayment: discountFee?.subjectPayment || "",
      templatePayment: discountFee?.templatePayment || "",
      subjectReminder: discountFee?.subjectReminder || "",
      templateReminder: discountFee?.templateReminder || "",
      subjectInvoice: discountFee?.subjectInvoice || "",
      templateInvoice: discountFee?.templateInvoice || "",
      
      // Reminders
      autoReminder: discountFee?.autoReminder ?? false,
      frequency: discountFee?.frequency || undefined,
      
      // Filters
      sessionId: discountFee?.course?.sessionCourses[0]?.sessionId || "",
      courseId: discountFee?.courseId || "",
      paymentStatus: discountFee?.paymentStatus || undefined,
    },
  });

  const updateFinanceSettingsMutation = useApiMutation({
  path: `finance-settings/${discountFee?.id}`,
  method: "PATCH",
  onSuccess: (data) => {
    toast.success("Finance settings saved successfully!");
    form.reset();
    if (setOpen) setOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["fetch-discount-course-fee-list"],
    });
  },
  onError: (error) => {
    console.error("Error saving finance settings:", error);
    showToast("error", error || "Failed to update finance settings");
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

    updateFinanceSettingsMutation.mutate(transformedValues as unknown as IFinanceSettingsForm);
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
          {isEdit && (
                    <div className="flex gap-x-3 justify-end items-center">
                      <Button
                        onClick={() => setIsEdit?.(false)}
                        type="button"
                        variant="primary"
                      >
                        <Edit2 />
                        Edit
                      </Button>
                    </div>
                  )}
          {!isEdit && (
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
              disabled={updateFinanceSettingsMutation?.isPending}
              type="submit"
              btnStyle="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
              isPending={updateFinanceSettingsMutation?.isPending}
              buttonContent="Save Discount Settings"
              loadingContent="Saving..."
            />
          </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default FinanceSettingsForm;