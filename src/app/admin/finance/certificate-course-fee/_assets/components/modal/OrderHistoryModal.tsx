/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { Timeline } from "@/components/ui/custom_ui/timeline";
import { useState } from "react";
import historyIcon from "/public/assets/logo/agent/admin/transaction-history.svg";

type PaymentLog = {
  id: string;
  action: string;
  createdAt: string;
  updatedAt: string;
};

type PaymentAuditLogsResponse = {
  auditLogs: PaymentLog[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
};

const mockData: PaymentAuditLogsResponse = {
  auditLogs: [
    {
      id: "1",
      action: "1st Installment Complete $2500",
      createdAt: "2024-07-12T14:32:00Z",
      updatedAt: "2024-07-12T14:32:00Z",
    },
    {
      id: "2",
      action: "2nd Installment Complete $2500",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
    },
    {
      id: "3",
      action: "3rd Installment Due $2500",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
    },
    {
      id: "4",
      action: "4th Installment Pending $2500",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
    },
  ],
  totalRecords: 3,
  totalPages: 1,
  currentPage: 1,
}

export function CourseFeeHistoryModal() {
  const [open, setOpen] = useState(false);
 const handleOpen = () => {
    setOpen(!open);
  };
  return (
    <DialogWrapper
          triggerContent={
            <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Order History"
          imageSrc={historyIcon}
          handleOpen={handleOpen}
       />
          }
          title="Course Fee History"
          open={open}
          handleOpen={handleOpen}
          style="min-w-[65%]"
        >
          <div>
            <Timeline items={mockData} isLoading={false} />
          </div>
        </DialogWrapper>
  );
}
