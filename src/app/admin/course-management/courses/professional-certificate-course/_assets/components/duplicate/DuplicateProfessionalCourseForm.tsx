/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  FormValueType,
  ProfessionalCourse,
} from "../../schema/professionalFormSchema";
import { ProfessionalCourseDefaultValue } from "../../utils/professionalCourseDefaultValue";
import Form_field from "../formField/Form_field";

const DuplicateProfessionalCourseForm = ({
  existingCourse,
  setOpen,
}: {
  setOpen: (data: boolean) => void;
  existingCourse: any;
}) => {
  const queryClient = useQueryClient();
  const data = { ...existingCourse };
  delete data.title;
  delete data.code;

  const form = useForm<FormValueType>({
    resolver: zodResolver(ProfessionalCourse.CreateFormSchema),
    defaultValues: ProfessionalCourseDefaultValue(data),
  });

  // createNewSubAgentMutation
  const createProfessionalCourseMutation = useApiMutation({
    method: "POST",
    path: "courses/create",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-professional-course-list"],
      });
    },
    onError: (error: any) => {
      showToast("error", error);
    },
  });

  //. Define a submit handler.
  function onSubmit(values: FormValueType) {
    delete values.code;
    createProfessionalCourseMutation.mutate({
      ...values,
      title: values.title.trim(),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
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
            isPending={createProfessionalCourseMutation?.isPending}
            loadingContent="Duplicating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default DuplicateProfessionalCourseForm;
