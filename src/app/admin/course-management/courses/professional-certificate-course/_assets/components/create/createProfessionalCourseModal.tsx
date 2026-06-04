"use client";

import { useState } from "react";
import CreateProfessionalCourseForm from "./CreateProfessionalCourseForm";
import { PlusIcon } from "lucide-react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import { useAuths } from "@/hooks/userContext";

export function CreateProfessionalCourseModal() {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  const handelOpen = () => {
    setOpen(!open);
  };

  return (
    <DialogWrapper
      title="Create Professional Certificate"
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
        disabled={!editAccess}
          handleOpen={handelOpen}
          btnSize="lg"
          buttonContent=" Create Professional Course"
          icon={<PlusIcon />}
        />
      }
    >
      <div>
        <CreateProfessionalCourseForm setOpen={setOpen} />
      </div>
    </DialogWrapper>
  );
}
