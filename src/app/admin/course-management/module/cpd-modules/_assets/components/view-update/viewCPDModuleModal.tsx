/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";

import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import ViewCPDModuleForm from "./viewCPDModuleForm";

export function ViewCPDModuleModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const handleClose = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      title={`${!isEdit ? "Update" : "View"} CPD Course`}
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
        <ViewCPDModuleForm
          module={data}
          setOpen={setOpen}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
        />
      </div>
    </DialogWrapper>
  );
}
