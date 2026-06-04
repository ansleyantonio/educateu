/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  FormValueType,
  ProfessionalCourse,
} from "../../schema/professionalFormSchema";
import { ProfessionalCourseDefaultValue } from "../../utils/professionalCourseDefaultValue";
import Form_field from "../formField/Form_field";
import { useAuths } from "@/hooks/userContext";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";

interface props {
  course: any;
  setOpen?: (data: boolean) => void;
  setIsEdit: (isEdit: boolean) => void;
  isEdit: boolean;
  queryKeys?: string;
}

const ViewProfessionalCourseForm = ({
  course,
  setOpen,
  setIsEdit,
  isEdit,
  queryKeys,
}: props) => {
  const { editAccess } = useAuths();
  const form = useForm<FormValueType>({
    resolver: zodResolver(ProfessionalCourse.updateFormSchema),
    defaultValues: ProfessionalCourseDefaultValue(course),
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
    fieldName: "course",
    fetchPath: `courses/${course.id}`,
    updatePath: `courses/update`,
    queryKey: queryKeys ?? "fetch-professional-course-list",
    onSuccess: () => {
      handleClose();
    },
  });

  //. Define a submit handler.
  function onSubmit(values: FormValueType) {
    const body = { ...values, id: course.id };
    safeUpdate(body);
  }
  const handleClose = () => {
    setOpen?.(false);
    setIsEdit?.(true);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Form_field isEdit={isEdit} form={form} />
          </div>

          {/* Submit button  */}
          <div className="flex gap-x-3 justify-end items-center">
            {isEdit ? (
              <ActionButton
                handleOpen={() => setIsEdit(false)}
                buttonContent="Edit"
                icon={<EditIcon />}
                type="button"
                disabled={!editAccess}
              />
            ) : (
              <>
                <ActionButton
                  handleOpen={() => handleClose()}
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
              </>
            )}
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

export default ViewProfessionalCourseForm;
