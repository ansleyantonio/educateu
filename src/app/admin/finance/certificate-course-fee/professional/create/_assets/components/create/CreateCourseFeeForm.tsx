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
import Form_field from "../formField";
import onFormError from "@/utils/formError";
import { Edit2, Loader2 } from "lucide-react";
import { CourseFeeSchema, ICourseFeeForm } from "../../schemas/courseFeeSchema";
import ActionButton from "@/components/common/button/actionButton";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

const CreateCourseFeeForm = ({
  setOpen,
  isEdit = false,
  setIsEdit,
}: {
  setOpen: (data: boolean) => void;
  setIsEdit: (data: boolean) => void;
  isEdit?: boolean;
}) => {
  const auth = useAuths();
    const token = auth?.user?.token as string;
    const queryClient = useQueryClient();
    const router = useRouter();
  
    const form = useForm<ICourseFeeForm>({
      resolver: zodResolver(CourseFeeSchema.create),
      defaultValues: {
        courseId: "",
        overallCourseFee: 0,
        newCourseFee: undefined,
        scheduleType: "",
        scheduleFrequency: undefined,
        currencyType: "",
        promoCodeStatus: "ACTIVE",
        startDate: undefined,
        endDate: undefined,
        effectiveDate: undefined,
        // agreementStatus: false,
        // pricingTierId: "",
        // tieredPricing: [],
        promotionalCodes: [],
      },
    });
  
    const createNewCertificateCourseFeeMutation = useApiMutation({
  path: "certificate-course-fee/course-fees",
  method: "POST",
  onSuccess: (data) => {
    toast.success("Successfully created course fee!");
    form.reset();
    queryClient.invalidateQueries({
      queryKey: ["fetch-list-of-course-fee"],
    });
    router.push('/admin/finance/certificate-course-fee/professional');
  },
  onError: (error) => {
    console.log("error", error);
    showToast("error", error || "Failed to create course fee");
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
        // pricingTierId: values.pricingTierId || undefined,
        // tieredPricing:
        //   values.tieredPricing && values.tieredPricing.length > 0
        //     ? values.tieredPricing
        //         .filter(
        //           (tier) =>
        //             tier.tierName &&
        //             tier.tierName.trim() !== "" &&
        //             tier.price &&
        //             tier.discountType
        //         )
        //         .map((tier) => ({
        //           tierName: tier.tierName,
        //           price: Number(tier.price),
        //           discountType: tier.discountType,
        //         }))
        //     : [],
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
  
      createNewCertificateCourseFeeMutation.mutate(cleanedPayload);
    }
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <Form_field isEditMode={isEdit} form={form} />
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
                  disabled={createNewCertificateCourseFeeMutation.isPending}
                  isPending={createNewCertificateCourseFeeMutation.isPending}
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

export default CreateCourseFeeForm;
