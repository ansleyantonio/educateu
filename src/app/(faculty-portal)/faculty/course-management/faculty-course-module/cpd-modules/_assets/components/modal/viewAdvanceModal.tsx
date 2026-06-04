/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useState } from "react";
import ViewCPD_ModuleFrom from "../view/ViewCPD_ModuleForm";

export function ViewCPD_Modal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="transition-all duration-300 ease-in-out hover:border-blue-700 active:scale-95  cursor-pointer  border border-[#E1E5E7] rounded-lg px-3 py-2 ">
          <Eye />
        </div>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> View CPD Module</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <ViewCPD_ModuleFrom data={data} setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
