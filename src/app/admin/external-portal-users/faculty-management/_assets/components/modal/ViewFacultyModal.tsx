/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/custom_ui/button";
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
import ViewFacultyFrom from "../view/ViewLessonFrom";

export function ViewFacultyModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hover:border-blue-700 border-[#E1E5E7]"
        >
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] h-[74%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> View Faculty </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <ViewFacultyFrom data={data} setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
