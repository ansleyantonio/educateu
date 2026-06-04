/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  IProfessionalCertificateModuleForm,
  ProfessionalCertificateModuleSchema,
} from "../../schemas/moduleSchema";
import { ProfessionalCertificateModuleDefaultValue } from "../../utils/professional_certificate_moduleDefaultValue";
import Form_field from "../formField/form_field";
import { useAuths } from "@/hooks/userContext";
import OverrideWarningDialog from "@/components/common/dialog/OverrideWarningDialog/OverrideWarningDialog";
import ActionButton from "@/components/common/button/actionButton";
import { useSafeUpdate } from "@/app/hook/TanstackQueries/useSafeUpdate";

interface props {
  module: any;
  setOpen?: (data: boolean) => void;
  setIsEdit: (isEdit: boolean) => void;
  isEdit: boolean;
  queryKeys?: string;
}

const ViewProfessionalModuleForm = ({
  module,
  setOpen,
  setIsEdit,
  isEdit,
  queryKeys,
}: props) => {
  const { editAccess } = useAuths();

  const form = useForm<IProfessionalCertificateModuleForm>({
    resolver: zodResolver(ProfessionalCertificateModuleSchema.update),
    defaultValues: ProfessionalCertificateModuleDefaultValue(module),
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
    queryKey: queryKeys ?? "fetch-professional-module-list",
    onSuccess: () => {
      handleClose();
    },
  });
  //. Define a submit handler.
  function onSubmit(values: IProfessionalCertificateModuleForm) {
    const body = { ...values, id: module.id };
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
            <Form_field viewOnly={isEdit} form={form} />
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

export default ViewProfessionalModuleForm;
