/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import ViewAdvanceCourseForm from "./viewAdvanceCourseForm";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";

interface IViewAdvanceCourse {
  course: any;
}

const ViewAdvanceCourse = ({ course }: IViewAdvanceCourse) => {
  const [open, setOpen] = useState(false);
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
      title={`${!isEdit ? "Update" : "View"} ${course?.courseType
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char: string) => char.toUpperCase())}`}
      open={open}
      handleOpen={handelOpen}
      style="min-w-[65%]"
    >
      <div>
        <ViewAdvanceCourseForm
          course={course}
          isEdit={isEdit}
          setOpen={setOpen}
          setIsEdit={setIsEdit}
        />
      </div>
    </DialogWrapper>
  );
};
export default ViewAdvanceCourse;
