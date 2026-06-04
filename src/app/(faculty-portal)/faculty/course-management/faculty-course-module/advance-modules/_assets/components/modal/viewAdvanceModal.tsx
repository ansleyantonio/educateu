/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Eye } from "lucide-react";
import { useState } from "react";
import ViewAdvanceModuleFrom from "../view/ViewAdvanceModuleForm";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";

export function ViewAdvanceModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const handelOpen = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="View Module"
          icon={<Eye />}
          handleOpen={handelOpen}
        />
      }
      title="View Advance Module"
    >
      <div>
        <ViewAdvanceModuleFrom isEdit={isEdit} data={data} setOpen={setOpen} />
      </div>
    </DialogWrapper>
  );
}
