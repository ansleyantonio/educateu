"use client";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateForm from "./create_form";

export function CreateSubAgent() {
  const auth = useAuths();
  const activityStatus = auth?.user?.activityStatus;
  const applicationCreateStatus = auth?.user?.applicationCreateStatus;

  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="primary"
          disabled={
            applicationCreateStatus === "disable" || activityStatus != "ACTIVE"
          }
        >
          {" "}
          <Plus className="mr-2 w-4 h-4" /> Create Sub Agents
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-h-[85vh] md:min-w-[75%] overflow-y-auto">
        <div className="rounded-md border border-1 border-[#EAEDF0]">
          <h1 className="py-4 px-4 text-base font-bold leading-6 text-[#000000]">
            Create Sub Agent
          </h1>
          <hr />
          <div className="p-6">
            <CreateForm setOpen={setOpen} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
