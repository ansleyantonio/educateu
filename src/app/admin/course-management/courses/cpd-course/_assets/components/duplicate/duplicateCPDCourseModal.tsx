/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { CopyPlus } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import DuplicateCPDCourseForm from "./DuplicateCPDCourseForm";
import { useAuths } from "@/hooks/userContext";

export function DuplicateCPDCourseModal({
  existingCourse,
}: {
  existingCourse: any;
}) {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()

  const handleOpen = () => {
    setOpen(!open);
  };
  return (
    <DialogWrapper
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          handleOpen={handleOpen}
          variant="icon"
          icon={<CopyPlus />}
          tooltipContent="Duplicate CPD Module"
          disabled={!editAccess}
        />
      }
      style="min-w-[60%] max-w-[80%]"
      title="Duplicate CPD Course"
    >
      <DuplicateCPDCourseForm
        setOpen={setOpen}
        existingCourse={existingCourse}
      />
    </DialogWrapper>
  );
}
