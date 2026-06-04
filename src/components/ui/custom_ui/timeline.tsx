import formatDateTime from "@/app/admin/user-management/audit-logging/_assets/utils/formatDateTime";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import type * as React from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

type AuditLog = {
  id: string;
  action: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
};

type AuditLogsResponse = {
  auditLogs: AuditLog[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
};

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AuditLogsResponse;
  isLoading: boolean;
}

export function Timeline({
  items,
  isLoading,
  className,
  ...props
}: TimelineProps) {
  return (
    // <ScrollArea className="w-full rounded-md border h-[calc(100vh-254px)]">
    <div className={cn("p-4 relative", className)} {...props}>
      {/* Continuous line */}
      <div className="absolute top-8 bottom-8 w-[3px] left-[1.5rem] bg-muted" />{" "}
      <>
        {isLoading ? (
          <div className="flex justify-center items-center space-y-2 w-full min-h-[150px]">
            <DataLoader />
          </div>
        ) : items?.auditLogs?.length > 0 ? (
          items.auditLogs.map((item, index) => (
            <div key={index} className="flex items-start mb-8 last:mb-0">
              {/* Dot */}
              <div className="flex relative justify-center items-center w-5 h-5 rounded-full bg-[#DEE3E7]" />

              {/* Step Content */}
              <div className="flex-1 ml-4 text-[#435450]">
                <p className="text-base font-medium leading-tight capitalize text-foreground">
                  {item?.user?.username} {item.action}
                </p>
                <div className="flex gap-3 items-center mt-3">
                  <CalendarDays
                    size={18}
                    className="text-[#A0B0AC]"
                    strokeWidth={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center space-y-2 w-full min-h-[150px]">
            <NoDataComponent />{" "}
          </div>
        )}
      </>
    </div>
    // </ScrollArea>
  );
}
