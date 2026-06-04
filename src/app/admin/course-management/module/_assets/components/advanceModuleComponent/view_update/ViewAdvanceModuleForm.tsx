/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import ActionButton from "@/components/common/button/actionButton";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";
import { useAuths } from "@/hooks/userContext";
import onFormError from "@/utils/formError";
import { EditIcon } from "lucide-react";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../../schemas/module/advanceModuleSchema";
import { AdvanceModuleDefaultValue } from "../../../utils/ModuleDefaultValue";
import Form_field from "../formField/Module_form_field";

const ViewAdvanceModuleFrom = ({
  setIsEdit,
  isEdit,
  module,
  setOpen,
  queryKeys,
}: {
  setIsEdit: (value: boolean) => void;
  isEdit: boolean;
  module: any;
  setOpen?: (value: boolean) => void;
  queryKeys?: string;
}) => {
  const nonEdit = module?.CourseModule?.length > 0;
  const type = (module?.moduleType).toLowerCase();
  const { editAccess } = useAuths();

  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.update),
    defaultValues: AdvanceModuleDefaultValue(module),
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
    fieldName: "courseModule",
    fetchPath: `course-modules/${module.id}`,
    updatePath: `course-modules/update`,
    queryKey: queryKeys ?? `fetch-${type}-module-list`,
    onSuccess: () => {
      handleClose();
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceModuleForm) {
    const body = { ...values, id: module?.id };
    safeUpdate(body);
  }

  const handleClose = () => {
    setOpen?.(false);
    setIsEdit?.(true);
  };

  return (
    <>
      {/* Override Modal */}
      <OverrideWarningDialog
        confirmOverride={confirmOverride}
        needsOverride={needsOverride}
        setNeedsOverride={setNeedsOverride}
        isUpdating={isUpdating}
        updateData={updateData}
      />
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Form_field
              viewOnly={isEdit}
              form={form}
              disableAwardingBody={nonEdit}
            />
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
      </FormProvider>
    </>
  );
};

export default ViewAdvanceModuleFrom;
