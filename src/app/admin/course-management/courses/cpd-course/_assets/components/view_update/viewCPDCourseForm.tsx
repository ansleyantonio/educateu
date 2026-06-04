/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { EditIcon } from "lucide-react";
import {
  CPDCourseSchema,
  CPDCourseType,
} from "../../schema/CPDCourseFormSchema";
import { CPDCourseDefaultValue } from "../../utils/CPDCourseDefaultValue";
import Form_field from "../formField/Form_field";
import ActionButton from "@/components/common/button/actionButton";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import { useAuths } from "@/hooks/userContext";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";

// Types
interface FormProps {
  setOpen?: (open: boolean) => void;
  course: any;
  isEdit: boolean;
  setIsEdit: (editView: boolean) => void;
  queryKeys?: string;
}

const ViewCPDCourseForm = ({
  course,
  isEdit,
  setIsEdit,
  setOpen,
  queryKeys,
}: FormProps) => {
  const { editAccess } = useAuths();
  const form = useForm<CPDCourseType>({
    resolver: zodResolver(CPDCourseSchema.updateCPDCourse),
    defaultValues: CPDCourseDefaultValue(course),
  });

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
    fetchPath: `courses/${course?.id}`,
    updatePath: `courses/update`,
    queryKey: queryKeys ?? "fetch-cpd-course-list",
    onSuccess: () => {
      handleClose();
    },
  });

  function onSubmit(values: CPDCourseType) {
    const body = { ...values, id: course?.id };
    safeUpdate(body);
  }

  const handleClose = () => {
    setOpen?.(false);
    setIsEdit?.(true);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Form_field isEdit={isEdit} form={form} />
          </div>

          {/* Submit button  */}
          <div className="flex gap-x-3 justify-end items-center">
            {isEdit ? (
              <ActionButton
                handleOpen={() => setIsEdit(false)}
                type="button"
                buttonContent="Edit"
                icon={<EditIcon />}
                disabled={!editAccess}
              />
            ) : (
              <>
                <ActionButton
                  type="button"
                  handleOpen={() => handleClose()}
                  buttonContent="Cancel"
                  variant="outline"
                />
                <ActionButton
                  type="submit"
                  handleOpen={() => form.handleSubmit(onSubmit, onFormError)()}
                  buttonContent="Update"
                  loadingContent="Updating"
                  isPending={isUpdating || isLoading}
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

export default ViewCPDCourseForm;
