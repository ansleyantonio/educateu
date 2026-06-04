/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import check from "/public/assets/icons/check_ring.svg";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";

interface IInvoicePaidModal {
  data?: any;
  invoiceIds: string[];
  value?: "Single" | "Multiple";
  status?: boolean;
}

const InvoicePaidModal = ({
  invoiceIds,
  data,
  value = "Single",
  status,
}: IInvoicePaidModal) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateCheckStatusMutation = useApiMutation({
    method: "PATCH",
    path: "commission-payments/invoices/bulk-update",
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: ["invoiced-applicants"],
      });
      // queryClient.invalidateQueries({
      //   queryKey: ["fetch-diploma-course-list"],
      // });
      setIsOpen(!open);
    },
  });

  const notApprovedStudents = data
    ?.filter((item: any) => invoiceIds?.includes(item?.invoiceId))
    ?.filter((item: any) => item?.invoiceStatus !== "APPROVED") // not approved
    ?.map((item: any) => item?.fullName); // return name or applicantId

  //. Define a submit handler.
  function onSubmit() {
    updateCheckStatusMutation.mutate({
      invoiceIds: invoiceIds,
      invoiceStatus: "PAID",
    });
  }

  return (
    <DialogWrapper
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        value === "Single" ? (
          <ActionButton
            disabled={status}
            handleOpen={() => setIsOpen(!isOpen)}
            imageSrc={check}
            variant="icon"
            tooltipContent="Check Status"
          />
        ) : (
          <ActionButton
            handleOpen={() => setIsOpen(!isOpen)}
            imageSrc={check}
            variant="icon"
            buttonContent="Mark as Paid"
          />
        )
      }
      style="min-w-[400px]"
    >
      <>
        {notApprovedStudents?.length > 0 ? (
          <div className="text-sm text-red-600">
            <p>The following students are not approved</p>
          </div>
        ) : (
          <div>
            <div className="flex gap-x-3">
              <Info />
              <div className="font-semibold">
                <h3>You’re about to mark as Paid</h3>
              </div>
            </div>

            <div className="flex gap-x-3 justify-end items-center mt-4">
              <ActionButton
                handleOpen={() => setIsOpen(!isOpen)}
                buttonContent="Cancel"
                variant="outline"
              />
              <ActionButton
                handleOpen={() => onSubmit()}
                buttonContent="Confirm"
                isPending={updateCheckStatusMutation.isPending}
              />
            </div>
          </div>
        )}
      </>
    </DialogWrapper>
  );
};

export default InvoicePaidModal;
