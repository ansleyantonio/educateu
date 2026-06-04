/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import deleteIcon from "/public/assets/icons/delete.svg";
import { useState } from "react";

interface modalProps {
  data?: any;
}

export function DeleteCourseModal({ data }: modalProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DialogWrapper
      title="Delete Course"
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          handleOpen={() => setIsOpen(!isOpen)}
          imageSrc={deleteIcon}
          variant="icon"
          tooltipContent="Archive"
        />
      }
    >
      <div>
        <h3>
          Are you sure you want to{" "}
          <strong className="text-red-500"> delete</strong>{" "}
          <span className="font-serif font-bold text-black text-md">
            {data?.title}
          </span>
        </h3>
        <div className="flex gap-x-3 justify-end items-center mt-4">
          <ActionButton
            handleOpen={() => setIsOpen(!isOpen)}
            buttonContent="Cancel"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => setIsOpen(!isOpen)}
            buttonContent="Delete"
            variant="primary"
          />
        </div>
      </div>
    </DialogWrapper>
  );
}
