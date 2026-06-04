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
import publish from "/public/assets/icons/publish.svg";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

export function MarkAsPaidModal({
  data,
  customTrigger,
  refetch, 
}: {
  data?: any;
  customTrigger?: React.ReactNode;
  refetch?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const markAsPaidMutation = useApiMutation({
    method: "POST",
    path: "commission-payments/update-payment/history",
    onSuccess: (response) => {
      showToast("success", `${data?.fullName} marked as paid successfully.`);
      setOpen(false);
      if (refetch) refetch();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Failed to mark as paid.";
      showToast("error", message);
    },
  });

  const handleYes = async () => {
    markAsPaidMutation.mutate({
      id: data?.paymentHistoryId,
      status: "PAID",
    });
  };

  const handleNo = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger ?? (
          <ActionButton
            variant="icon"
            btnStyle="hover:border-green-700"
            tooltipContent="Mark as Paid"
            imageSrc={publish}
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

        <div className="text-gray-700 mt-2">
          Are you sure you want to mark{" "}
          <strong>{data?.fullName}</strong> as paid?
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={handleNo}>
            No
          </Button>
          <Button
            variant="default"
            onClick={handleYes}
            disabled={markAsPaidMutation.isPending}
          >
            {markAsPaidMutation.isPending ? "Processing..." : "Yes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}