/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import CreateCourseFeeForm from "../create/CreateCourseFeeForm";
import Form_field from "../formField/formField";
import FinanceSettingsForm from "../formField/FinanceSettingsForm";


interface IViewAdvanceCourse {
  discountFee: any;
}

const ViewFinanceModal = ({ discountFee }: IViewAdvanceCourse) => {
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
      title={`${!isEdit ? "Update" : "View"} Finance Settings`}
      open={open}
      handleOpen={handelOpen}
      style="min-w-[65%]"
    >
      <div>
        <FinanceSettingsForm setOpen={setOpen} setIsEdit={setIsEdit} isEdit={isEdit} discountFee={discountFee}/>
      </div>
    </DialogWrapper>
  );
};
export default ViewFinanceModal;
