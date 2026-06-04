/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";

import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import ViewProfessionalModuleForm from "./viewProfessionalCertificateModuleForm";

export function ViewProfessionalCertificateModuleModal({
  data,
}: {
  data: any;
}) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const handleClose = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      title={`${!isEdit ? "Update" : "View"} Professional Certificate Course`}
      open={open}
      handleOpen={handleClose}
      style="min-w-[45%]"
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="View & Update"
          imageSrc={fileView}
          handleOpen={handleClose}
        />
      }
    >
      <div>
        <ViewProfessionalModuleForm
          module={data}
          setOpen={setOpen}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
        />
      </div>
    </DialogWrapper>
  );
}
