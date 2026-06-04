/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import ViewProfessionalCourseForm from "./viewProfessionalCourseForm";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";

export function ViewProfessionalCourse({ course }: { course: any }) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const handleClose = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      title={`${!isEdit ? "Update" : "View"} Professional Certificate Course`}
      open={open}
      handleOpen={handleClose}
      style="min-w-[65%]"
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="View & Update"
          imageSrc={fileView}
          handleOpen={handleClose}
        />
      }
    >
      <div>
        <ViewProfessionalCourseForm
          course={course}
          setOpen={setOpen}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
        />
      </div>
    </DialogWrapper>
  );
}
