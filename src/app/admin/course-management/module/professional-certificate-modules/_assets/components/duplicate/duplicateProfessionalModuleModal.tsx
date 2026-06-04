/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { CopyPlus } from "lucide-react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import DuplicateProfessionalModuleForm from "./DuplicateProfessionalModuleForm";
import { useAuths } from "@/hooks/userContext";

interface DuplicateProfessionalCertificateModalProps {
  existingModule: any;
}

export function DuplicateProfessionalCertificateModal({
  existingModule,
}: DuplicateProfessionalCertificateModalProps) {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  const handelOpen = () => {
    setOpen(!open);
  };

  return (
    <DialogWrapper
      title="Duplicate Professional Certificate"
      open={open}
      handleOpen={handelOpen}
      style="min-w-[45%]"
      triggerContent={
        <ActionButton
          variant="icon"
          handleOpen={handelOpen}
          icon={<CopyPlus />}
          tooltipContent="Duplicate Professional Certificate"
          disabled={!editAccess}
        />
      }
    >
      <div>
        <DuplicateProfessionalModuleForm
          existingModule={existingModule}
          setOpen={setOpen}
        />
      </div>
    </DialogWrapper>
  );
}
