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
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import { Button } from "@/components/ui/button";

export function ViewReceiptModal({
  data,
  customTrigger,
}: {
  data?: any;
  customTrigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleClose = () => setOpen(false);

  const receiptUrl = data?.receipt_url;
  const isPDF = receiptUrl?.toLowerCase().endsWith(".pdf");

  const handleDownload = async () => {
    if (!receiptUrl) return;
  
    const isCrossOrigin = !receiptUrl.startsWith(window.location.origin);
  
    if (isCrossOrigin) {
      window.open(receiptUrl, "_blank");
      return;
    }
  
    try {
      setDownloading(true);
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = receiptUrl.split("/").pop() || "receipt.jpg";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Unable to download the receipt image.");
    } finally {
      setDownloading(false);
    }
  };  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger ?? (
          <ActionButton
            variant="icon"
            btnStyle="hover:border-green-700"
            tooltipContent="View Receipt"
            imageSrc={fileView}
            handleOpen={() => setOpen(true)}
          />
        )}
      </DialogTrigger>

      <DialogContent className="w-full md:min-w-[50%] max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-base text-black">
            Receipt of <strong>{data?.fullName}</strong>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {receiptUrl ? (
            isPDF ? (
              <iframe
                src={receiptUrl}
                title="Receipt PDF"
                className="w-full h-[70vh] border rounded-md"
              />
            ) : (
              <img
                src={receiptUrl}
                alt={`${data?.fullName}'s Receipt`}
                className="w-full max-h-[70vh] object-contain rounded-md border"
              />
            )
          ) : (
            <p className="text-gray-500">No receipt available.</p>
          )}
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {/* {receiptUrl && !isPDF && (
            <Button
              onClick={handleDownload}
              variant="default"
              disabled={downloading}
            >
              {downloading ? "Downloading..." : "Download"}
            </Button>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}