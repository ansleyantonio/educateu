"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import CreateAdvanceModuleForm from "../create/createAdvanceModuleForm";

export function CreateAdvanceModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-[#FFFFFF] bg-[#013E5B] rounded-md px-4 py-2 flex items-center gap-x-2">
          Create Advanced Module
        </button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> Create Advance Module</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <CreateAdvanceModuleForm setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
