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
import FacultyPermissionsForm from "../faculty-permissions/FacultyPermissionsAccessFrom";
import lock from "/public/assets/icons/lock-key.svg";
import { useAuths } from "@/hooks/userContext";

export function FacultyPermissionsModal({ id, firstName, lastName }: { id: string, firstName?: string, lastName?: string }) {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  const handleOpen = () => {
    setOpen(!open);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton disabled={!editAccess} variant="icon" handleOpen={handleOpen} imageSrc={lock} tooltipContent="Faculty Permissions">
        </ActionButton>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] max-h-[85%] overflow-y-auto">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="mr-6 rounded-md">
          <h1 className="text-base font-bold leading-6 text-[#000000]">
            Faculty Permissions and Access to {firstName} {lastName}
          </h1>
          <div className="">
            <FacultyPermissionsForm setOpen={setOpen} id={id}/>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
