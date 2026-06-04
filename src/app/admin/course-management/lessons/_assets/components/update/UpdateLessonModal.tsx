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
import UpdateLessonFrom from "./UpdateLessonFrom";
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";

export function UpdateLessonModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Edit"
          imageSrc={fileEdit}
          handleOpen={() => setOpen(true)}
        />
        {/* <div className="transition-all duration-300 ease-in-out hover:border-blue-700 active:scale-95  cursor-pointer  border border-[#E1E5E7] rounded-lg px-3 py-2 ">
          <Image src={fileEdit} alt="eye" width={17} height={17} />
        </div> */}
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] h-[85%] overflow-y-auto">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="rounded-md mr-6">
          <h1 className="py-4 font-bold text-base leading-6 text-[#000000]">
            Update Lesson
          </h1>
          <div className="">
            <UpdateLessonFrom data={data} setOpen={setOpen} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
