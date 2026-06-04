/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import Form_field from "../formField/Form_field";
import {
  AdvanceCourseSchema,
  IAdvanceCourseForm,
} from "../../../schemas/CreateAdvanceFormSchema";
import { AdvanceCourseDefaultValue } from "../../../utils/AdvanceCoursedefaultValue";

interface DuplicateAdvanceCourseFormProps {
  setOpen: (data: boolean) => void;
  existingCourse: any;
}

const DuplicateAdvanceCourseForm = ({
  existingCourse,
  setOpen,
}: DuplicateAdvanceCourseFormProps) => {
  const data = { ...existingCourse };
  delete data.title;
  delete data.code;

  const form = useForm<IAdvanceCourseForm>({
    resolver: zodResolver(AdvanceCourseSchema.CreateAdvanceCourseFormSchema),
    defaultValues: AdvanceCourseDefaultValue({
      ...data,
      status: "UNPUBLISHED",
    }),
  });

  const queryClient = useQueryClient();

  // createNewSubAgentMutation
  const createAdvanceCourseMutation = useApiMutation({
    method: "POST",
    path: "courses/create",
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-degree-course-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-diploma-course-list"],
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error || "Something went wrong!");
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceCourseForm) {
    delete values.code;
    createAdvanceCourseMutation.mutate({
      ...values,
      title: values.title.trim(),
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Form_field form={form} />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <ActionButton
            variant="primary"
            buttonContent="Duplicate"
            handleOpen={() => setOpen(true)}
            isPending={createAdvanceCourseMutation?.isPending}
            loadingContent="Duplicating..."
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default DuplicateAdvanceCourseForm;
