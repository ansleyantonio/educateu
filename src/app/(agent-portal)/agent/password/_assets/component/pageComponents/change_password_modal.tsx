"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import ChangePasswordForm from "./change_password_form";

export function ChangePassword() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-[#FFFFFF] shadow-md bg-[#013E5B] rounded-md px-4 py-2 flex items-center gap-x-2">
          Change Password
        </button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[50%]">
        {/* <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader> */}
        <div className="mt-6 border border-1 border-[#EAEDF0]  rounded-md mr-6">
          <h1 className="px-6 py-4 font-bold text-base leading-6 text-[#000000]">
            Change Password
          </h1>
          <hr />
          <div className="p-6">
            <ChangePasswordForm setOpen={setOpen} />
          </div>
        </div>

        {/* <DialogFooter>
          <Button type="button">Cancel</Button>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
