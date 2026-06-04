"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreatePromotionalCodeForm from "../create/createPromotionalCodeForm";

export function CreatePromotionalCodeModal() {
  const [open, setOpen] = useState(false);
  return (
    <DialogWrapper
      open={open}
      handleOpen={setOpen}
      triggerContent={
        <ActionButton
          btnSize="lg"
          handleOpen={() => setOpen(true)}
          icon={<PlusIcon />}
          buttonContent={`Create Promotional Code`}
        />
      }
      title={`Create Promotional Code`}
      style="min-w-[60%]"
    >
      <div className="">
        <CreatePromotionalCodeForm setOpen={setOpen} />
      </div>
    </DialogWrapper>
  );
}
