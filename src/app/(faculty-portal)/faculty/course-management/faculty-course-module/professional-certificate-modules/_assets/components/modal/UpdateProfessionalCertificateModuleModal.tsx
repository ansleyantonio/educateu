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
import Image from "next/image";
import { useState } from "react";
import UpdateProfessionalCertificateModuleFrom from "../update/UpdateProfessionalCertificateModuleFrom";
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";
import { Button } from "@/components/ui/custom_ui/button";

export function UpdateProfessionalCertificateModuleModal({
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
          className="hover:border-blue-700 border-[#E1E5E7]"
        >
          <Image src={fileEdit} alt="Edit" width={18} height={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] h-[85%] overflow-y-auto">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="mr-6 rounded-md">
          <h1 className="py-4 text-base font-bold leading-6 text-[#000000]">
            Update Professional Certificate Module
          </h1>
          <div className="">
            <UpdateProfessionalCertificateModuleFrom
              data={data}
              setOpen={setOpen}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
