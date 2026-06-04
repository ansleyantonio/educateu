/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import ActionButton from "@/components/common/button/actionButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import pdfIcon from "/public//assets/logo/profile/Icon.svg";
import downloadIcon from "/public/assets/icons/Download.svg";
import { Button } from "@/components/ui/button";

export function DownloadReceiptModal({
  data,
  customTrigger,
  onConfirm,
}: {
  data?: any;
  customTrigger?: React.ReactNode;
  onConfirm?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleYes = () => {
    if (onConfirm) onConfirm();
    setOpen(false);
  };

  const handleNo = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger ?? (
          <ActionButton
            variant="icon"
            btnStyle="hover:border-green-700"
            tooltipContent="Downlaod Receipt"
            imageSrc={downloadIcon}
            handleOpen={() => setOpen(true)}
          />
        )}
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-[40%] max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-bold text-base text-black">
            Confirm Action
          </DialogTitle>
        </DialogHeader>

        <div className="text-gray-700">
          Are you sure you want to downlaod <strong>{data?.fullName}</strong>&apos;s  Receipt?
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleNo}>
            No
          </Button>
          <Button variant="primary" onClick={handleYes}>
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}