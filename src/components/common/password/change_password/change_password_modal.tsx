"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import ChangePasswordForm from "./change_password_form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ChangePassword() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex gap-x-2 items-center py-2 px-4 rounded-md shadow-md text-[#FFFFFF] bg-[#013E5B]">
          Change Password
        </button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[50%]">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="mt-6 mr-6 rounded-md border border-1 border-[#EAEDF0]">
          <h1 className="py-4 px-6 text-base font-bold leading-6 text-[#000000]">
            Change Password
          </h1>
          <hr />
          <div className="p-6">
            <ChangePasswordForm setOpen={setOpen} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
