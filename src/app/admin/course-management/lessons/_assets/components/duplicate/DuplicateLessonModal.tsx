/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useAuths } from "@/hooks/userContext";
import { CopyPlus } from "lucide-react";
import { useState } from "react";
import DuplicateLessonForm from "./duplicateLessonForm";

interface DuplicateCPDModuleModalProps {
  existingModule: any;
}

export function DuplicateLessonModal({
  existingModule,
}: DuplicateCPDModuleModalProps) {
  const [open, setOpen] = useState(false);
  const { editAccess } = useAuths();
  const handelOpen = () => {
    setOpen(!open);
  };

  return (
    <DialogWrapper
      title="Duplicate Lesson"
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
          variant="icon"
          handleOpen={handelOpen}
          icon={<CopyPlus />}
          tooltipContent="Duplicate Lesson"
          disabled={!editAccess}
        />
      }
      style="min-w-[45%]"
    >
      <div>
        <DuplicateLessonForm
          existingModule={existingModule}
          setOpen={setOpen}
        />
      </div>
    </DialogWrapper>
  );
}
