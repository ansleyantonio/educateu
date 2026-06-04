/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  CPDCourseSchema,
  CPDCourseType,
} from "../../schema/CPDCourseFormSchema";
import { CPDCourseDefaultValue } from "../../utils/CPDCourseDefaultValue";
import Form_field from "../formField/Form_field";

const DuplicateCPDCourseForm = ({
  setOpen,
  existingCourse,
}: {
  setOpen: (data: boolean) => void;
  existingCourse: any;
}) => {
  const data = { ...existingCourse };
  delete data.title;
  delete data.code;

  const queryClient = useQueryClient();

  const form = useForm<CPDCourseType>({
    resolver: zodResolver(CPDCourseSchema.createCPDCourse),
    defaultValues: CPDCourseDefaultValue(data),
  });

  // createNewSubAgentMutation
  const createNewCPDCourseMutation = useApiMutation({
    method: "POST",
    path: "courses/create",
    // token,

    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-cpd-course-list"],
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (error) => {
      showToast("error", error);
    },
  });
  //. Define a submit handler.
  function onSubmit(values: CPDCourseType) {
    delete values.code;
    createNewCPDCourseMutation.mutate({
      ...values,
      title: values.title.trim(),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Form_field form={form} />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <ActionButton
            handleOpen={() => setOpen(false)}
            type="button"
            variant="outline"
            buttonContent="Cancel"
          />
          <ActionButton
            isPending={createNewCPDCourseMutation.isPending}
            loadingContent="Duplicating..."
            type="submit"
            buttonContent="Duplicate"
          />
        </div>
      </form>
    </Form>
  );
};

export default DuplicateCPDCourseForm;
