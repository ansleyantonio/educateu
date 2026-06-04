"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import CreateProfCertificateModuleForm from "../create/CreateProfCertificateModuleForm";
import { useAuths } from "@/hooks/userContext";

export function CreateProfCertificateModuleModal() {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  return (
    <DialogWrapper
      open={open}
      handleOpen={() => setOpen(!open)}
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          btnSize="lg"
          handleOpen={() => setOpen(true)}
          buttonContent="Create Professional Certificate Module"
        />
      }
      title="Create Professional Certificate Module"
    >
      <div className="">
        <CreateProfCertificateModuleForm setOpen={setOpen} />
      </div>
    </DialogWrapper>
  );
}
