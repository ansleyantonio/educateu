/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../../schemas/module/advanceModuleSchema";
import { AdvanceModuleDefaultValue } from "../../../utils/ModuleDefaultValue";
import Form_field from "../formField/Module_form_field";

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

  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.create),
    defaultValues: AdvanceModuleDefaultValue(data),
  });
  const queryClient = useQueryClient();

  // createNewSubAgentMutation
  const createAdvanceCourseMutation = useApiMutation({
    method: "POST",
    path: "course-modules/create",
    onSuccess: (data) => {
      showToast("success", data); // form.reset();
      queryClient.invalidateQueries({
        queryKey: ["fetch-degree-module-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-diploma-module-list"],
      });
      setOpen(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceModuleForm) {
    createAdvanceCourseMutation.mutate(values);
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
