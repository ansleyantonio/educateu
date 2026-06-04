/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import {
  AdvanceCourseSchema,
  IAdvanceCourseForm,
} from "../../../schemas/CreateAdvanceFormSchema";
import { AdvanceCourseDefaultValue } from "../../../utils/AdvanceCoursedefaultValue";
import Form_field from "../formField/Form_field";

const CreateAdvanceCourseForm = ({
  setOpen,
  courseType,
}: {
  setOpen: (data: boolean) => void;
  courseType: string;
}) => {
  const courseTypes =
    courseType == "DEGREE" ? "DEGREE_COURSE" : "DIPLOMA_COURSE";

  const form = useForm<IAdvanceCourseForm>({
    resolver: zodResolver(AdvanceCourseSchema.CreateAdvanceCourseFormSchema),
    defaultValues: AdvanceCourseDefaultValue({
      status: "UNPUBLISHED",
      courseType: courseTypes,
    }),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const queryClient = useQueryClient();

  // createNewSubAgentMutation
  const createAdvanceCourseMutation = useApiMutation({
    method: "POST",
    path: "courses/create",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [`fetch-${courseType.toLowerCase()}-course-list`],
      });
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceCourseForm) {
    createAdvanceCourseMutation.mutate(values);
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <Form_field form={form} />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <ActionButton
            type="button"
            handleOpen={() => setOpen(false)}
            variant="outline"
            buttonContent="Cancel"
          />

          <ActionButton
            isPending={createAdvanceCourseMutation?.isPending}
            icon={<PlusIcon />}
            loadingContent="Creating..."
            buttonContent="Create"
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateAdvanceCourseForm;
