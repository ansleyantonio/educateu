/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SubAgent } from "../../interface/subAgentRegister";
import UpdateForm from "./update_form";

export function UpdateSubAgent({
  setOpen,
  open,
  subAgent,
}: {
  setOpen: (value: boolean) => void;
  open: boolean;
  subAgent: SubAgent;
}) {
  console.log("subAgent", subAgent);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full md:min-w-[85%] overflow-auto">
        <div className="mt-6 mr-6 rounded-md border border-1 border-[#EAEDF0]">
          <h1 className="py-4 px-6 text-base font-bold leading-6 text-[#000000]">
            Update Sub Agent
          </h1>
          <hr />
          <div className="p-6">
            <UpdateForm subAgent={subAgent} setOpen={setOpen} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
