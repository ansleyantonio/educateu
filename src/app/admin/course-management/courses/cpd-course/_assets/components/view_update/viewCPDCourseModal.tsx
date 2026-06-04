/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import ViewCPDCourseForm from "./viewCPDCourseForm";
import ActionButton from "@/components/common/button/actionButton";

export function ViewCPDCourse({ data }: any) {
  const [open, setOpen] = useState(false);

  // if false then view mode
  const [isEdit, setIsEdit] = useState(true);

  const handelOpen = () => {
    setOpen(!open);
    setIsEdit(true);
  };
  return (
    <DialogWrapper
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="View & Update"
          imageSrc={fileView}
          handleOpen={handelOpen}
        />
      }
      style="max-w-[75%]"
      title={`${isEdit ? "View" : "Update"} CPD Course`}
      open={open}
      handleOpen={handelOpen}
    >
      <div>
        <ViewCPDCourseForm
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          course={data}
          setOpen={setOpen}
        />
      </div>
    </DialogWrapper>
  );
}
