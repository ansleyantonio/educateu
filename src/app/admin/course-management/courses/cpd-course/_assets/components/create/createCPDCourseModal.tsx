"use client";
import { useState } from "react";
import CreateCPDCourseForm from "./CreateCPDCourseForm";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { PlusIcon } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import { useAuths } from "@/hooks/userContext";

export function CreateCPDCourseModal() {
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
          disabled={!editAccess}
          handleOpen={handleOpen}
          variant="primary"
          icon={<PlusIcon />}
          buttonContent="Create CPD Course"
          btnSize="lg"
        />
      }
      style="min-w-[60%] max-w-[80%]"
      title="Create CPD Course"
    >
      <CreateCPDCourseForm setOpen={setOpen} />
    </DialogWrapper>
  );
}
