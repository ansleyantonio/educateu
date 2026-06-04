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
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useState } from "react";
import UpdateRequestForm from "./UpdateRequestForm";

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
  value,
  buttonType = "outline",
}: {
  value: string;
  buttonType?: ButtonType;
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];
  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  return (
    <>
      <div
        className={`flex xl:justify-end xl:items-center ${
          buttonType == "outline" && "m-4"
        }`}
      >
        <Button
          type="button"
          onClick={handleOpen}
          size="sm"
          variant={buttonType}
          rounded="full"
          disabled={!hasPostAndDeletePermission}
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
