/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import onFormError from "@/utils/formError";
import { Edit2 } from "lucide-react";
import { CourseFeeSchema, ICourseFeeForm } from "../../schemas/courseFeeSchema";
import Form_field from "./formField";

const ViewCourseFeeForm = ({
  setOpen,
  isEdit = false,
  setIsEdit,
  courseFee,
}: {
  setOpen: (data: boolean) => void;
  setIsEdit: (data: boolean) => void;
  isEdit?: boolean;
  courseFee: any;
}) => {
  console.log(courseFee, "Course Fee");
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const queryClient = useQueryClient();

  // Extract promotional code IDs from the API response
  const promotionalCodeIds =
    courseFee?.promotionalCodes?.map(
      (code: any) => code.promotionalCodeId || code.id
    ) || [];

  const form = useForm<ICourseFeeForm>({
    resolver: zodResolver(CourseFeeSchema.update),
    defaultValues: {
      courseId: courseFee?.courseId || "",
      newCourseFee: courseFee?.newCourseFee || undefined,
      overallCourseFee: courseFee?.overallCourseFee || undefined,
      // courseType: courseFee?.courseType || "CPD",
      scheduleType: courseFee?.scheduleType || "",
      scheduleFrequency: courseFee?.scheduleFrequency || undefined,
      currencyType: courseFee?.currencyType || "",
      promoCodeStatus: courseFee?.promoCodeStatus || "ACTIVE",
      startDate: courseFee?.startDate || undefined,
      endDate: courseFee?.endDate || undefined,
      effectiveDate: courseFee?.effectiveDate || undefined,
      // agreementStatus: courseFee?.agreementStatus ?? false,
      promotionalCodes: promotionalCodeIds, // Set as array of IDs
    },
  });

  const updateNewCertificateCourseFeeMutation = useApiMutation({
    path: `certificate-course-fee/course-fees/${courseFee?.id}`,
    method: "PUT",
    onSuccess: (data) => {
      toast.success("Successfully Updated course fee!");
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["fetch-certificate-course-fee-data"],
      });
      setOpen(false);
    },
    onError: (error) => {
      console.log("error", error);
      showToast("error", error || "Failed to update course fee");
    },
  });

  function transformCourseFeeForm(values: ICourseFeeForm) {
    // Parse overallCourseFee if it's a string with currency symbol
    const parseAmount = (value: any): number => {
      if (typeof value === "string") {
        return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
      }
      return Number(value) || 0;
    };

    return {
      courseId: values.courseId,
      overallCourseFee: parseAmount(values.overallCourseFee),
      newCourseFee: values.newCourseFee
        ? parseAmount(values.newCourseFee)
        : undefined,
      // courseType: values.courseType,
      scheduleType: values.scheduleType || undefined,
      scheduleFrequency: values.scheduleFrequency || undefined,
      currencyType: values.currencyType,
      promoCodeStatus: values.promoCodeStatus || "ACTIVE",
      startDate: values.startDate
        ? new Date(values.startDate).toISOString()
        : undefined,
      endDate: values.endDate
        ? new Date(values.endDate).toISOString()
        : undefined,
      effectiveDate: values.effectiveDate
        ? new Date(values.effectiveDate).toISOString()
        : undefined,
      // agreementStatus: values.agreementStatus,
      promotionalCodes:
        values.promotionalCodes && values.promotionalCodes.length > 0
          ? values.promotionalCodes
          : [],
    };
  }

  function onSubmit(values: ICourseFeeForm) {
    // Transform the data to API format
    const transformedValues = transformCourseFeeForm(values);

    // Remove empty fields after transformation
    const cleanedPayload = RemoveEmptyFields(transformedValues);
    console.log(cleanedPayload);

    updateNewCertificateCourseFeeMutation.mutate(cleanedPayload);
  }
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <Form_field
            isEditMode={isEdit}
            form={form}
            existingPromoCodes={courseFee?.promotionalCodes || []}
          />
        </div>

        {/* login button  */}
        {isEdit && (
          <div className="flex gap-x-3 justify-end items-center">
            <Button
              onClick={() => setIsEdit(false)}
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
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            {/* Submit button */}
            <div className="flex gap-x-3 justify-end items-center">
              <ActionButton
                variant="primary"
                type="submit"
                disabled={updateNewCertificateCourseFeeMutation.isPending}
                isPending={updateNewCertificateCourseFeeMutation.isPending}
                loadingContent="Saving..."
                buttonContent="Save Course Fee"
              />
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default ViewCourseFeeForm;
