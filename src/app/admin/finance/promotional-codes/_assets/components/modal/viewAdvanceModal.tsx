/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
// import ViewAdvanceModuleFrom from "../view/ViewAdvanceModuleForm";
import ViewAndEditPromotionalCodeFrom from "../view/ViewAdvanceModuleForm";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";

export function ViewAModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const handelOpen = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      title={`${!isEdit ? "Update" : "View"} Promotional Code`}
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
      style="min-w-[75%]"
    >
      <div className="">
        <ViewAndEditPromotionalCodeFrom
          handleOpen={handelOpen}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
          data={data}
        />
      </div>
    </DialogWrapper>
  );
}
