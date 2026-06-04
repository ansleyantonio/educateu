/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { ILessonForm, LessonSchema } from "../../schemas/lessonSchema";
import Form_field from "../formField";
import onFormError from "@/utils/formError";
import { Edit2, Loader2 } from "lucide-react";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

const CreateCourseFeeForm = ({
  setOpen,
  isEdit = false,
  setIsEdit,
}: {
  setOpen: (data: boolean) => void;
  setIsEdit: (data: boolean) => void;
  isEdit?: boolean;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const queryClient = useQueryClient();
  const form = useForm<ILessonForm>({
    resolver: zodResolver(LessonSchema.create),
    // defaultValues: LessonDefaultValue(),
    defaultValues: {
      lessonTitle: "",
      lessonCode: "",
      lessonType: "",
      estimatedTimeToComplete: 0,
      faculty: "",
      lessonDescription: "",
      learningOutcome: "",
      contents: [
        {
          title: "",
          description: "",
          type: "",
          paths: [],
        },
      ],
    },
  });

  // createNewSubAgentMutation
 const updateCourseFeeMutation = useApiMutation({
  path: "lessons/create",
  method: "POST",
  onSuccess: (data) => {
    toast.success("Successfully created lesson!"); // Changed from "user" to "lesson"
    setOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["fetch-list-of-course-lessons"],
    });
  },
  onError: (error) => {
    console.log("error", error);
    showToast("error", error || "Failed to create lesson");
  },
});

  function transformLessonForm(values: ILessonForm) {
    // console.log("VALUES in transofr", values)
    return {
      title: values.lessonTitle,
      code: values.lessonCode,
      type: values.lessonType,
      estimatedTimeToComplete: Number(values.estimatedTimeToComplete),
      outcome: values.learningOutcome ?? "",
      contents: values.contents.map((content) => ({
        title: content.title,
        description: content.description,
        type: content.type,
        paths: content.paths,
      })),
    };
  }

  function onSubmit(values: ILessonForm) {
    // First clean empty fields from raw form values
    const cleanedValues = RemoveEmptyFields(values);

    // Then transform the cleaned data to API format
    const transformedValues = transformLessonForm(cleanedValues as ILessonForm);

    // console.log("Transformed lesson payload:", transformedValues);

    updateCourseFeeMutation.mutate(transformedValues as unknown as ILessonForm);
  }
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <Form_field isEditMode={isEdit} form={form} />
        </div>

        {/* login button  */}
        {isEdit && (
          <div className="flex gap-x-3 justify-end items-center">
            <Button
              onClick={() => setIsEdit(false)}
              type="button"
              variant="primary"
            >
              <Edit2 />
              Edit
            </Button>
          </div>
        )}

        {!isEdit && (
          <div className="flex gap-x-3 justify-end items-center">
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={updateCourseFeeMutation?.isPending}
              type="submit"
              className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
            >
              {updateCourseFeeMutation?.isPending && (
                <Loader2 className="animate-spin" />
              )}
              {updateCourseFeeMutation?.isPending
                ? "Updating..."
                : "Update"}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default CreateCourseFeeForm;
