/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import ViewLessonFrom from "../formField/ViewLessonFrom";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";

export function ViewLessonModal({
  data,
  customTrigger,
}: {
  data: any;
  customTrigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="View Lesson"
          imageSrc={fileView}
          handleOpen={() => setOpen(true)}
        /> */}
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
      <DialogContent className="w-full md:min-w-[75%] h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> View Lesson Module</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <ViewLessonFrom data={data} setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
