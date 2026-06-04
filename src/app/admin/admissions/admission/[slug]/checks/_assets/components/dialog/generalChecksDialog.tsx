/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import RequiredInfoChecksForm from "@/components/common/dialog/checks/generalCheck/requiredInfoChecksForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useState } from "react";
import { FaRegEdit } from "react-icons/fa";

const GeneralChecksDialog = ({
  token,
  id,
  checkItemNames,
}: {
  token: string;
  checkItemNames: any;
  id: string;
}) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [value, setValue] = useState("requiredInfo");

  // console.log("data ssss", checkItemNames);

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  return (
    <>
      <Button
        onClick={() => setIsOpenDialog(true)}
        variant="outline"
        disabled={!hasPostAndDeletePermission}
      >
        <FaRegEdit size={25} className="mr-2 text-[#0C456E]" />
        File Check Note
      </Button>

      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="overflow-y-auto max-h-[90vh] max-w-[750px]">
          <DialogHeader>
            <DialogTitle>File Check</DialogTitle>
          </DialogHeader>
          {/* 
          <div>
            <RadioGroup
              value={value}
              onValueChange={setValue}
              className="flex justify-between pb-4 mt-4 mb-5 border-b"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="requiredInfo" id="r1" />
                <Label htmlFor="r1">Information Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notRequiredInfo" id="r2" />
                <Label htmlFor="r2">No Information Required</Label>
              </div>
            </RadioGroup>{" "}
          </div> */}

          {value === "requiredInfo" && (
            <RequiredInfoChecksForm
              setIsOpenDialog={setIsOpenDialog}
              token={token}
              checkItemNames={checkItemNames}
              id={id}
            />
          )}

          {/* {value === "notRequiredInfo" && (
            <NoRequiredInfoChecksForm
              checkItemNames={checkItemNames}
              setIsOpenDialog={setIsOpenDialog}
              token={token}
            />
          )} */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeneralChecksDialog;
