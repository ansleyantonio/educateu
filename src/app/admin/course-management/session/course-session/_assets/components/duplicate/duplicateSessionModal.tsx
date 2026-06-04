/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { CopyPlus } from "lucide-react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import DuplicateSessionForm from "./DuplicateSessionForm";
import { useAuths } from "@/hooks/userContext";

export function DuplicateSession({ sessionData }: any) {
  const [open, setOpen] = useState(false);
  const { editAccess } = useAuths();

  const { ...existingSession } = sessionData;
  delete existingSession.name;

  return (
    <DialogWrapper
      title="Duplicate Session"
      open={open}
      handleOpen={() => setOpen(!open)}
      style="min-w-[65%] lg:min-w-[55%]"
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Duplicate Session"
          icon={<CopyPlus />}
          handleOpen={() => setOpen(!open)}
        />
      }
    >
      <div>
        <div>
          <DuplicateSessionForm
            sessionData={existingSession}
            setOpen={setOpen}
          />
        </div>
      </div>
    </DialogWrapper>
  );
}
