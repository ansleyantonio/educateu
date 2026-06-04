"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreateModuleForm from "../create/createModuleForm";
import { useAuths } from "@/hooks/userContext";

export function CreateModuleModal({ moduleType }: { moduleType: string }) {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  return (
    <DialogWrapper
      open={open}
      handleOpen={setOpen}
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          btnSize="lg"
          handleOpen={() => setOpen(true)}
          icon={<PlusIcon />}
          buttonContent={`Create ${moduleType} Module`}
        />
      }
      title={`Create ${moduleType} Module`}
      style="min-w-[60%]"
    >
      <div className="">
        <CreateModuleForm moduleType={moduleType} setOpen={setOpen} />
      </div>
    </DialogWrapper>
  );
}
