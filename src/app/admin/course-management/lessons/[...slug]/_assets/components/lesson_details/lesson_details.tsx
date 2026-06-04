/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { EditIcon } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  ILessonUpdateForm,
  LessonSchema,
} from "../../../../_assets/schemas/lessonSchema";
import Form_field from "../../../../_assets/components/formField/form_field";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";
import { LessonDefaultValue } from "../../../../_assets/utils/LessonDefaultValue";
import { zodResolver } from "@hookform/resolvers/zod";

const LessonDetailsTab = ({ data }: { data: any }) => {
  const [isEdit, setIsEdit] = useState(true);
  const nonEdit = data?.moduleLessons?.length > 0;
  const form = useForm<ILessonUpdateForm>({
    resolver: zodResolver(LessonSchema.update),
    defaultValues: LessonDefaultValue(data),
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
    fetchPath: "lessons/getById",
    fetchFilter: { id: data?.id },
    fetchMethod: "POST",
    updatePath: `lessons/update`,
    queryKey: "fetch-lesson-details",
    onSuccess: () => {
      //setOpen(false);
    },
  });

  //. Define a submit handler.
  function onSubmit(values: ILessonUpdateForm) {
    // If nonEdit is true → delete awardingBodyId
    if (nonEdit) {
      delete values.awardingBodyId;
    }

    const body = { ...values, id: data?.id };
    safeUpdate(body);
  }

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Form_field nonEdit={nonEdit} viewOnly={isEdit} form={form} />
          </div>

          {/* login button  */}

          <div className="flex gap-x-3 justify-end items-center">
            {isEdit ? (
              <ActionButton
                buttonContent="Edit"
                handleOpen={() => {
                  setIsEdit(false);
                }}
                icon={<EditIcon />}
                type="button"
              />
            ) : (
              <>
                <ActionButton
                  buttonContent="Cancel"
                  variant="outline"
                  handleOpen={() => {
                    setIsEdit(true);
                  }}
                  type="button"
                />

                <ActionButton
                  isPending={isUpdating || isLoading}
                  buttonContent="Update"
                  handleOpen={() => {}}
                  loadingContent="Updating..."
                />
              </>
            )}
          </div>
        </form>
      </FormProvider>
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

export default LessonDetailsTab;
