/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import ActionButton from "@/components/common/button/actionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import Form_field from "../formField/formField";
import ViewCourseFeeForm from "./ViewCourseFeeForm";

export function ViewCourseFinanceModal({
  data,
  customTrigger,
}: {
  data?: any;
  customTrigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger ?? (
          <ActionButton
            variant="icon"
            btnStyle="hover:border-blue-700"
            tooltipContent="Preview"
            imageSrc={fileView}
            handleOpen={() => setOpen(true)}
          />
        )}
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[65%] h-[50%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-base text-black">
            View Course Finance Information
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <ViewCourseFeeForm data={data} setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
