/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { CPDModuleSchema, I_CPD_ModuleForm } from "../../schemas/moduleSchema";
import { CPD_ModuleDefaultValue } from "../../utils/cpd_ModuleDefaultValue";
import Form_field from "../formField/form_field";
import ActionButton from "@/components/common/button/actionButton";
import { useRef } from "react";

interface props {
  module: any;
  setOpen?: (data: boolean) => void;
  setIsEdit: (isEdit: boolean) => void;
  isEdit: boolean;
  queryKeys?: string;
}

const ViewCPDModuleForm = ({
  module,
  setOpen,
  setIsEdit,
  isEdit,
  queryKeys,
}: props) => {
  const { editAccess } = useAuths();

  // Freeze default values so they don't reinitialize the form
  const defaultValuesRef = useRef(CPD_ModuleDefaultValue(module));
  const form = useForm<I_CPD_ModuleForm>({
    resolver: zodResolver(CPDModuleSchema.update),
    defaultValues: defaultValuesRef.current,
    shouldUnregister: false,
  });

  // const form = useForm<I_CPD_ModuleForm>({
  //   resolver: zodResolver(CPDModuleSchema.update),
  //   defaultValues: CPD_ModuleDefaultValue(module),
  //   shouldUnregister: false,
  // });

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
    queryKey: queryKeys ?? "fetch-cpd-module-list",
    onSuccess: () => {
      handleClose();
    },
  });

  //. Define a submit handler.
  function onSubmit(values: I_CPD_ModuleForm) {
    const body = { ...values, id: module.id };

    // updateProfessionalModuleMutation.mutate(body);
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Form_field viewOnly={isEdit} form={form} />
          </div>

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
    </>
  );
};

export default ViewCPDModuleForm;
