/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { ILessonUpdateForm, LessonSchema } from "../../schemas/lessonSchema";
import {
  formatLessonData,
  LessonDefaultValue,
} from "../../utils/LessonDefaultValue";
import Form_field from "../formField/form_field";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";
import ActionButton from "@/components/common/button/actionButton";

interface UpdateLessonFromProps {
  setOpen: (value: boolean) => void;
  data: any;
}

const UpdateLessonFrom = ({ setOpen, data }: UpdateLessonFromProps) => {
  const nonEdit = data?.moduleLessons?.length > 0;

  const form = useForm<ILessonUpdateForm>({
    resolver: zodResolver(LessonSchema.update),
    defaultValues: LessonDefaultValue(formatLessonData(data)),
  });

  // Update mutation
  const {
    safeUpdate,
    confirmOverride,
    needsOverride,
    setNeedsOverride,
    isUpdating,
    updateData,
    isLoading,
  } = useSafeUpdate({
    fieldName: "lesson",
    fetchPath: `lessons/getById`,
    fetchFilter: { id: data.id },
    fetchMethod: "POST",
    updatePath: `lessons/update`,
    queryKey: "fetch-list-of-course-lessons",
    onSuccess: () => {
      setOpen(false);
    },
  });

  //. Define a submit handler.
  function onSubmit(values: ILessonUpdateForm) {
    // If nonEdit is true → delete awardingBodyId
    if (nonEdit) {
      delete values.awardingBodyId;
    }

    const body = { ...values, id: data.id };
    safeUpdate(body);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Form_field nonEdit={nonEdit} form={form} />
          </div>

          {/* login button  */}
          <div className="flex gap-x-3 justify-end items-center">
            <ActionButton
              handleOpen={() => setOpen(false)}
              buttonContent="Cancel"
              variant="outline"
              type="button"
            />
            <ActionButton
              isPending={isUpdating || isLoading}
              handleOpen={() => form.handleSubmit(onSubmit)}
              buttonContent="Update"
              loadingContent="Updating..."
              type="submit"
            />
          </div>
        </form>
      </Form>

      {/* Override Modal */}
      <OverrideWarningDialog
        confirmOverride={confirmOverride}
        needsOverride={needsOverride}
        setNeedsOverride={setNeedsOverride}
        isUpdating={isUpdating}
        updateData={updateData}
      />
    </>
  );
};

export default UpdateLessonFrom;
