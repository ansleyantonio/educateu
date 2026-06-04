/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import ViewAdvanceModuleFrom from "./ViewAdvanceModuleForm";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";

export function View_UpdateModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const handelOpen = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      title={`${!isEdit ? "Update" : "View"} Advance Module`}
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="View & Update"
          imageSrc={fileView}
          handleOpen={handelOpen}
        />
      }
      style="min-w-[45%]"
    >
      <div className="">
        <ViewAdvanceModuleFrom
          setOpen={setOpen}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
          module={data}
        />
      </div>
    </DialogWrapper>
  );
}
