"use client";
import { Card } from "@/components/ui/card";
import { Timeline } from "@/components/ui/custom_ui/timeline";

interface PaymentLogProps {
  mode?: string;
}

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

const PaymentLogsTab = ({ mode }: PaymentLogProps) => {
  return(
    <div className="mt-4">
      {/* <Timeline items={mockData} isLoading={false} />
       */}
       <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Hold tight! </h3>
            <p className="text-sm text-gray-500 mb-4">
              These tab will be ready to use once the student portal is live
            </p>
          </div>
        </Card>
    </div>
  )
}

export default PaymentLogsTab;