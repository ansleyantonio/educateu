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
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";
import EditCourseFeeForm from "./EditCourseFeeForm";

export function EditCourseFinanceModal({
    data,
    customTrigger,
    moduleType
  }: {
    data?: any;
    customTrigger?: React.ReactNode;
    moduleType?: string;
  }) {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {customTrigger ?? (
              <ActionButton
                variant="icon"
                btnStyle="hover:border-blue-700"
                tooltipContent="Edit"
                imageSrc={fileEdit}
                handleOpen={() => setOpen(true)}
              />
            )}
          </DialogTrigger>
          <DialogContent className="w-full md:min-w-[65%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bold text-base text-black">
                Edit Course Finance Information
              </DialogTitle>
              <DialogDescription className="hidden"></DialogDescription>
            </DialogHeader>
    
            <div className="">
              <EditCourseFeeForm data={data} setOpen={setOpen} moduleType={moduleType}/>
            </div>
          </DialogContent>
        </Dialog>
      );
  }