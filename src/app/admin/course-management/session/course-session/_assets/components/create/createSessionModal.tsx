"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useAuths } from "@/hooks/userContext";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreateSessionForm from "./CreateSessionForm";
// import CreateSessionForm from "./formField/CreateSessionForm";

export function CreateSession({
  setSearchText,
}: {
  setSearchText: (data: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };
  const { editAccess } = useAuths();
  return (
    <DialogWrapper
      title="Create Session"
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          btnSize="lg"
          handleOpen={handleOpen}
          variant="primary"
          icon={<PlusIcon />}
          buttonContent="Create Session"
        />
      }
      style="min-w-[60%] max-w-[80%]"
    >
      <CreateSessionForm setOpen={setOpen} setSearchText={setSearchText} />
    </DialogWrapper>
  );
}
