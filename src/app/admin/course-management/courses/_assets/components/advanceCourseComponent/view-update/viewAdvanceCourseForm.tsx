/* eslint-disable @typescript-eslint/no-explicit-any */

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import onFormError from "@/utils/formError";
import { EditIcon } from "lucide-react";
import Form_field from "../formField/Form_field";
import { useAuths } from "@/hooks/userContext";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import ActionButton from "@/components/common/button/actionButton";
import {
  AdvanceCourseSchema,
  IAdvanceCourseForm,
} from "../../../schemas/CreateAdvanceFormSchema";
import { AdvanceCourseDefaultValue } from "../../../utils/AdvanceCoursedefaultValue";

interface IViewAdvanceCourse {
  queryKeys?: string;
  course: any;
  setOpen?: (data: boolean) => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

const ViewAdvanceCourseForm = ({
  queryKeys,
  isEdit,
  setOpen,
  course,
  setIsEdit,
}: IViewAdvanceCourse) => {
  const { editAccess } = useAuths();

  const modulesPerCourses = course?.courseModules.length;

  const form = useForm<IAdvanceCourseForm>({
    resolver: zodResolver(AdvanceCourseSchema.UpdateAdvanceCourseFormSchema),
    defaultValues: AdvanceCourseDefaultValue(course),
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
    queryKey:
      (queryKeys ?? course?.courseType == "DEGREE_COURSE")
        ? "fetch-degree-course-list"
        : "fetch-diploma-course-list",
    onSuccess: () => {
      handelClose();
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceCourseForm) {
    const body = { ...values, id: course?.id };
    safeUpdate(body);
  }

  const handelClose = () => {
    setOpen?.(false);
    setIsEdit(true);
  };

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Form_field
              isEdit={isEdit}
              form={form}
              modulesPerCourses={modulesPerCourses}
            />
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
                  handleOpen={() => handelClose()}
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

export default ViewAdvanceCourseForm;
