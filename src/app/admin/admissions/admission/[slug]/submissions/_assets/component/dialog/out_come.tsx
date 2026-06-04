/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { OutComeForm } from "../outComeForm";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";

const OutCome = ({ id }: { id: string }) => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  return (
    <>
      <DialogWrapper
        triggerContent={
          <Button
            size="sm"
            onClick={() => setIsOpenDialog(true)}
            variant="outline"
            disabled={!hasPostAndDeletePermission}
          >
            Out Come
          </Button>
        }
        open={isOpenDialog}
        handleOpen={setIsOpenDialog}
        title="Out Come"
        style="min-w-[400px]"
      >
        <OutComeForm setIsOpenDialog={setIsOpenDialog} id={id} />
      </DialogWrapper>
    </>
  );
};

export default OutCome;
