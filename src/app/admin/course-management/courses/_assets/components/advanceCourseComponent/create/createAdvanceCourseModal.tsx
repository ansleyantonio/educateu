"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useAuths } from "@/hooks/userContext";
import CreateAdvanceCourseForm from "./CreateAdvanceCourseForm";

export function CreateAdvanceCourseModal({
  courseType,
}: {
  courseType: string;
}) {
  const [open, setOpen] = useState(false);
  const { editAccess } = useAuths();

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <DialogWrapper
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          btnSize="lg"
          handleOpen={handleOpen}
          variant="primary"
          icon={<PlusIcon />}
          buttonContent={`Create ${courseType.toLocaleLowerCase()} Course`}
        />
      }
      title={`Create ${courseType.toLowerCase()} Course`}
      style="min-h-[85%] min-w-[75%]"
    >
      <CreateAdvanceCourseForm courseType={courseType} setOpen={setOpen} />
    </DialogWrapper>
  );
}
