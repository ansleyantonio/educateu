/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { CopyPlus } from "lucide-react";
import { useState } from "react";
import DuplicateCPDModuleForm from "./duplicateCPDModuleForm";
import { useAuths } from "@/hooks/userContext";

interface DuplicateCPDModuleModalProps {
  existingModule: any;
}

export function DuplicateCPDModuleModal({
  existingModule,
}: DuplicateCPDModuleModalProps) {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  const handelOpen = () => {
    setOpen(!open);
  };

  return (
    <DialogWrapper
      title="Duplicate CPD Module"
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
          variant="icon"
          handleOpen={handelOpen}
          icon={<CopyPlus />}
          tooltipContent="Duplicate Module"
          disabled={!editAccess}
        />
      }
      style="min-w-[45%]"
    >
      <div>
        <DuplicateCPDModuleForm
          existingModule={existingModule}
          setOpen={setOpen}
        />
      </div>
    </DialogWrapper>
  );
}
