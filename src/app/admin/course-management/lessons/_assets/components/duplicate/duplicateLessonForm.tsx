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
import { ILessonForm, LessonSchema } from "../../schemas/lessonSchema";
import {
  formatLessonData,
  LessonDefaultValue,
} from "../../utils/LessonDefaultValue";
import Form_field from "../formField/form_field";

const DuplicateLessonForm = ({
  existingModule,
  setOpen,
}: {
  setOpen: (data: boolean) => void;
  existingModule: any;
}) => {
  const data = { ...existingModule };
  delete data.code;
  delete data.title;

  const queryClient = useQueryClient();
  const form = useForm<ILessonForm>({
    resolver: zodResolver(LessonSchema.create),
    defaultValues: LessonDefaultValue(formatLessonData(data)),
  });

  // createNewSubAgentMutation
  const createNewLessonMutation = useApiMutation({
    method: "POST",
    path: "lessons/create",
    onSuccess: (data) => {
      setOpen(false);
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-list-of-course-lessons"],
      });
    },
  });

  //. Define a submit handler.
  function onSubmit(values: ILessonForm) {
    createNewLessonMutation.mutate(values);
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
            buttonContent="Duplicate"
            handleOpen={() => {}}
            isPending={createNewLessonMutation.isPending}
            loadingContent="Duplicating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default DuplicateLessonForm;
