/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  CPDCourseSchema,
  CPDCourseType,
} from "../../schema/CPDCourseFormSchema";
import { CPDCourseDefaultValue } from "../../utils/CPDCourseDefaultValue";
import Form_field from "../formField/Form_field";
import ActionButton from "@/components/common/button/actionButton";

const CreateCPDCourseForm = ({
  setOpen,
}: {
  setOpen: (data: boolean) => void;
}) => {
  // const auth = useAuths();
  // const token = auth?.user?.token as string;
  const queryClient = useQueryClient();

  const form = useForm<CPDCourseType>({
    resolver: zodResolver(CPDCourseSchema.createCPDCourse),
    defaultValues: CPDCourseDefaultValue(),
  });

  // createNewSubAgentMutation
  const createNewCPDCourseMutation = useApiMutation({
    method: "POST",
    path: "courses/create",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false); // close modal
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
    const newCPDCourse = RemoveEmptyFields(values);

    createNewCPDCourseMutation.mutate(values);
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
          <ActionButton
            type="button"
            variant="outline"
            buttonContent="Cancel"
            handleOpen={() => setOpen(false)}
          />
          <ActionButton
            variant="primary"
            buttonContent="Create"
            handleOpen={() => form.handleSubmit(onSubmit)}
            isPending={createNewCPDCourseMutation?.isPending}
            loadingContent="Creating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default CreateCPDCourseForm;
