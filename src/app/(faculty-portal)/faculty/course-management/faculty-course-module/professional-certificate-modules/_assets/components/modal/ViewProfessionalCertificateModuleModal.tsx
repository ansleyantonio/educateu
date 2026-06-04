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
import ViewProfessionalCertificateModuleFrom from "../view/ViewProfessionalCertificateModuleFrom";
import { Button } from "@/components/ui/custom_ui/button";

export function ViewProfessionalCertificateModuleModal({
  data,
}: {
  data: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="px-3 hover:border-blue-700 border-[#E1E5E7]"
        >
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> View Professional Certificate Module</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <ViewProfessionalCertificateModuleFrom
            data={data}
            setOpen={setOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
