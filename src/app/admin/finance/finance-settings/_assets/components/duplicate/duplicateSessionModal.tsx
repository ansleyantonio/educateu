/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import { CopyPlus, Edit } from "lucide-react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import DuplicateSessionForm from "./DuplicateSessionForm";

export function DuplicateSession({ data }: any) {
  const [open, setOpen] = useState(false);
  return (
    <DialogWrapper
      title="Duplicate Session"
      open={open}
      handleOpen={() => setOpen(!open)}
      style="min-w-[65%]"
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Duplicate Session"
          icon={<CopyPlus />}
          handleOpen={() => setOpen(!open)}
        />
      }
    >
      <div className="mr-6 rounded-md">
        <div>
          <DuplicateSessionForm data={data} setOpen={setOpen} />
        </div>
      </div>
    </DialogWrapper>
  );
}
