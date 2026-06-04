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
import AssignCourseFrom from "../assign-course/AssignCourseFrom";
import file from "/public/assets/icons/file-view.svg";
import { useAuths } from "@/hooks/userContext";

export function AssignCourseModal({
  id,
  firstName,
  lastName,
}: {
  id: string;
  firstName?: string;
  lastName?: string;
}) {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  
  const handleOpen = () => {
    setOpen(!open);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton disabled={!editAccess} variant="icon" handleOpen={handleOpen} imageSrc={file} tooltipContent="Assign Course"/>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[80%] min-h-[85%] lg:min-h-[65%] max-h-[85%] overflow-y-auto">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="mr-6 rounded-md">
          <h1 className="py-4 text-base font-bold leading-6 text-[#000000]">
            Assign Course to {firstName} {lastName}
          </h1>
          <div className="">
            <AssignCourseFrom setOpen={setOpen} id={id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
