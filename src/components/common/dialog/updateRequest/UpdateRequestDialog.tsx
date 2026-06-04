/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CamelToTitle } from "@/utils/CaseConverter";
import { useState } from "react";
import UpdateRequestForm from "./UpdateRequestForm";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";

type ButtonType =
  | "outline"
  | "link"
  | "default"
  | "destructive"
  | "primary"
  | "success"
  | "update"
  | "tooltip"
  | "secondary"
  | "ghost"
  | null
  | undefined;

const UpdateRequestDialog = ({
  disabled = false,
  value,
  buttonType = "outline",
}: {
  disabled?: boolean;
  value: string;
  buttonType?: ButtonType;
}) => {
  const [open, setOpen] = useState(false);

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];
  const hasPostAndDeletePermission = getUserAccess(permissions) === "full-access";
  
    const isDisabled = disabled || !hasPostAndDeletePermission;

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <div
        className={`flex lg:justify-end lg:items-center ${
          buttonType == "outline" && "my-4 lg:mx-4"
        }`}
      >
        <Button
          disabled={isDisabled}
          onClick={handleOpen}
          variant="outline"
          className="rounded-full"
        >
          Update Request
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-y-auto max-h-[80vh] max-w-[750px]">
          <DialogHeader>
            <DialogTitle className="mb-5">{CamelToTitle(value)}</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>

          <UpdateRequestForm setIsOpenDialog={setOpen} value={value} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateRequestDialog;
