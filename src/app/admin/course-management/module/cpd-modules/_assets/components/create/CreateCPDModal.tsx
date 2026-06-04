"use client";

import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreateCPD_ModuleForm from "../create/createCPDModuleForm";
import { useAuths } from "@/hooks/userContext";

export function CreateCPDModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const {editAccess} = useAuths()

  return (
    <DialogWrapper
      title="Create CPD Module"
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          btnSize="lg"
          buttonContent="Create CPD Module"
          handleOpen={handleOpen}
          icon={<PlusIcon />}
          disabled={!editAccess}
        />
      }
    >
      <div className="">
        <CreateCPD_ModuleForm setOpen={setOpen} />
      </div>
    </DialogWrapper>
  );
}
