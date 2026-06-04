/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { FormMessage } from "@/components/ui/custom_ui/form";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  CourseFeeSchema,
  ICourseFeeForm,
} from "../../_assets/schemas/courseFeeSchema";
import Form_field from "./_assets/components/formField";

const CreateCertificateCourseFee = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<ICourseFeeForm>({
    resolver: zodResolver(CourseFeeSchema.create),
    defaultValues: {
      courseId: "",
      overallCourseFee: 0,
      newCourseFee: undefined,
      // courseType: "CPD_COURSE",
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
      queryKey: ["fetch-professional-certificate-course-fee-data"],
    });
    router.push("/admin/finance/certificate-course-fee/professional");
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
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Certificate Course Fee",
        },
        {
          title: "Professional Course Fee",
          href: "/admin/finance/certificate-course-fee/professional",
        },
        { title: "Create Professional Course Fee" },
      ]}
    >
      <div>
        <div className="p-4 rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onFormError)}
              className="space-y-4"
            >
              <Form_field form={form} />

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
            </form>
            <FormMessage />
          </Form>
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default CreateCertificateCourseFee;