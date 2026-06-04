/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CourseFinanceFormField from "../formField/CourseFinanceFormField";
import onFormError from "@/utils/formError";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import {
  CourseTypeFinanceFormSchema,
  UpdateCourseTypeFinanceFormType,
} from "../../schemas/CreateCourseTypeFinanceFormSchema";

// --- Default value formatter ---
// const formatCourseFinanceData = (data: any): UpdateCourseTypeFinanceFormType => ({
//   session: data.session || "",
//   course: data.courseName || "",
//   overallcoursefee: data.overallCourseFee || 0,
//   agreementStatus: data.agreementStatus ?? false,
//   semesters: data.semesters || [],
// });

const EditCourseFeeForm = ({
  setOpen,
  data,
  mode = "edit",
  moduleType,
}: {
  setOpen: any;
  data: any;
  mode?: "edit" | "view";
  moduleType?: string;
}) => {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      courseName: data.courseName,
      overallCourseFee: data.overallCourseFee,
      startDate: data.startDate,
      endDate: data.endDate,
      currencyType: data.currencyType,
      promoCodeStatus: data?.promoCodeStatus?.toUpperCase() || "",
      effectiveDate: data.startDate
    },
  });

  const updateEditCourseFeeMutation = useApiMutation({
    method: "PUT",
    path: `advanced-course-fee/course-fees/${data?.id}`,
    onSuccess: (data) => {
      showToast("success", data);
      setOpen(false);
      // handleOpen();
      const queryKey =
        moduleType === "diploma"
          ? ["fetch-diploma-module-list"]
          : ["fetch-degree-module-list"];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  const isUpdating = false;

  function onSubmit(values: any) {
    updateEditCourseFeeMutation.mutate(values);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <CourseFinanceFormField
              form={form}
              viewOnly={mode === "view" || mode === "edit"}
              editableField={mode === "edit" ? "overallCourseFee" : undefined}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-x-3 justify-end items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EditCourseFeeForm;
