/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import NoRequiredInfoChecksForm from "@/components/common/dialog/checks/additionalCheck/noRequiredInfoChecksForm";
import RequiredInfoChecksForm from "@/components/common/dialog/checks/additionalCheck/requiredInfoChecksForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

const AdditionalFileChecksDialog = ({
  token,
  checkItemNames,
}: {
  token: string;
  checkItemNames: any;
}) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [value, setValue] = useState("requiredInfo");

  return (
    <>
      {/* <Button onClick={() => setIsOpenDialog(true)} variant="outline">
        <FaRegEdit size={25} className="mr-2 text-[#0C456E]" />
        Add File Check Result
      </Button> */}

      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="overflow-y-auto max-h-[90vh] max-w-[750px]">
          <DialogHeader>
            <DialogTitle>File Check</DialogTitle>
          </DialogHeader>

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
          </div>

          {value === "requiredInfo" && (
            <RequiredInfoChecksForm
              setIsOpenDialog={setIsOpenDialog}
              token={token}
              checkItemNames={checkItemNames}
            />
          )}

          {value === "notRequiredInfo" && (
            <NoRequiredInfoChecksForm
              setIsOpenDialog={setIsOpenDialog}
              token={token}
              checkItemNames={checkItemNames}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdditionalFileChecksDialog;
