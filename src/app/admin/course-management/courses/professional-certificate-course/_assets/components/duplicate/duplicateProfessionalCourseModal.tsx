/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { CopyPlus } from "lucide-react";
import { useState } from "react";
import DuplicateProfessionalCourseForm from "./DuplicateProfessionalCourseForm";
import { useAuths } from "@/hooks/userContext";

interface DuplicateProfessionalCourseModalProps {
  existingModule: any;
}

export function DuplicateProfessionalCourseModal({
  existingModule,
}: DuplicateProfessionalCourseModalProps) {
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
        <DuplicateProfessionalCourseForm
          existingCourse={existingModule}
          setOpen={setOpen}
        />
      </div>
    </DialogWrapper>
  );
}
