/* eslint-disable no-unused-vars */
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
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ILessonForm, LessonSchema } from "../../schemas/lessonSchema";
import { LessonDefaultValue } from "../../utils/LessonDefaultValue";
import Form_field from "../formField/form_field";

interface CreateLessonFormProps {
  setOpen: (data: boolean) => void;
  persistedFormData?: ILessonForm;
  onFormDataChange?: (data: ILessonForm) => void;
  onFormReset?: () => void;
}

const CreateLessonForm = ({
  setOpen,
  persistedFormData,
  onFormDataChange,
  onFormReset,
}: CreateLessonFormProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const formDataRef = useRef<ILessonForm>();

  const form = useForm<ILessonForm>({
    resolver: zodResolver(LessonSchema.create),
    defaultValues: persistedFormData || LessonDefaultValue(),
  });

  // Watch for form changes and persist them
  // const watchedValues = form.watch();

  // useEffect(() => {
  //   // Only persist if form has been touched/modified
  //   if (form.formState.isDirty) {
  //     formDataRef.current = watchedValues;
  //     onFormDataChange?.(watchedValues);
  //   }
  // }, [watchedValues, form.formState.isDirty, onFormDataChange]);

  // // Reset form values when persistedFormData changes
  // useEffect(() => {
  //   if (persistedFormData) {
  //     form.reset(persistedFormData);
  //   }
  // }, [persistedFormData, form]);

  const createNewLessonMutation = useApiMutation({
    method: "POST",
    path: "lessons/create",
    onSuccess: (data) => {
      setOpen(false);
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-list-of-course-lessons"],
      });
      // Reset persisted form data after successful submission
      onFormReset?.();
    },
  });

  function onSubmit(values: ILessonForm) {
    createNewLessonMutation.mutate(values);
  }

  const handleCancel = () => {
    // Keep the current form state persisted when canceling
    if (form.formState.isDirty && formDataRef.current) {
      onFormDataChange?.(formDataRef.current);
    }
    setOpen(false);
  };

  const handleReset = () => {
    form.reset(LessonDefaultValue());
    onFormReset?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <Form_field form={form} setUploading={setUploading} />

        {/* Action buttons */}
        <div className="flex gap-x-3 justify-between items-center">
          <div>
            {/* Optional reset button */}
            {form.formState.isDirty && (
              <Button
                onClick={handleReset}
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                Reset Form
              </Button>
            )}
          </div>

          <div className="flex gap-x-3">
            <Button onClick={handleCancel} type="button" variant="outline">
              Cancel
            </Button>
            <ActionButton
              isPending={createNewLessonMutation?.isPending}
              handleOpen={() => form.handleSubmit(onSubmit)}
              buttonContent="Create"
              loadingContent="Creating..."
              type="submit"
              disabled={uploading}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CreateLessonForm;
