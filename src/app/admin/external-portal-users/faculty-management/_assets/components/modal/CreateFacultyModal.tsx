"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateFacultyForm from "../create/CreateFacultyForm";
import { useAuths } from "@/hooks/userContext";

export function CreateFacultyModal() {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  const handelOpen = () => {
    setOpen(!open);
  };
  return (
    <>
      <DialogWrapper
        handleOpen={handelOpen}
        open={open}
        title="Add Faculty"
        triggerContent={
          <ActionButton
            handleOpen={handelOpen}
            buttonContent="Add Faculty"
            icon={<Plus />}
            variant={"primary"}
            // tooltipContent="Add Faculty"
            disabled={!editAccess}
          />
        }
        style="w-[90%] md:w-[45%]"
      >
        <CreateFacultyForm setOpen={setOpen} />
      </DialogWrapper>
      {/* <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex gap-x-2 items-center py-2 px-4 capitalize rounded-md text-[#FFFFFF] bg-[#013E5B]">
            <Plus /> add faculty
          </button>
        </DialogTrigger>
        <DialogContent className="w-full md:max-w-[65%]  max:h-[85%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle> Create faculty </DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>

          <div className="">
            <CreateFacultyForm setOpen={setOpen} />
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
}
