/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CourseTypeFinanceFormSchema,
  CreateCourseTypeFinanceFormType,
} from "../../schemas/CreateCourseTypeFinanceFormSchema";
import ActionButton from "@/components/common/button/actionButton";
import onFormError from "@/utils/formError";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import Form_field from "../formField/formField";
import { useRouter } from "next/navigation";

const CreateCourseTypeFinanceForm = ({
  moduleType,
  isEdit,
}: {
  moduleType: string;
  isEdit: boolean;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<CreateCourseTypeFinanceFormType>({
    resolver: zodResolver(CourseTypeFinanceFormSchema.create),
    defaultValues: {
      session: "",
      course: "",
      overallcoursefee: 0,
      agreementStatus: false,
      semesters: []
    },
  });

  const createCourseFeeMutation = useApiMutation({
    method: "POST",
    path: "advanced-course-fee/course-fees/degree-structure",
    onSuccess: () => {
      showToast("success", "Form submitted Successfully!");
      queryClient.invalidateQueries({
        queryKey: [
          `fetch-list-of-${moduleType}-course-fee`,
        ],
      });
      form.reset();
      router.push(`/admin/finance/advanced-course-fee/${moduleType}`);
    },
  });

  function onSubmit(values: CreateCourseTypeFinanceFormType) {
    const payload = {
      sessionCourseId: values.sessionCourseId,
      overallcoursefee: values.overallcoursefee,
      agreementStatus: values.agreementStatus,
      semesters: values.semesters,
    };
    createCourseFeeMutation.mutate(payload);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-6"
      >
        <Form_field form={form} viewOnly={isEdit} moduleType={moduleType} />
        <div className="flex justify-end gap-3">
          <ActionButton
            type="button"
            handleOpen={() => {
              router.push(`/admin/finance/advanced-course-fee/${moduleType}`);
              form.reset();
            }}
            buttonContent="Cancel"
            variant="outline"
          />
          {form.watch("semesters")?.length > 0 && (
            <ActionButton
              handleOpen={() => form.handleSubmit(onSubmit, onFormError)}
              buttonContent="Save Course Fee >"
              loadingContent="Saving..."
            />
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateCourseTypeFinanceForm;
