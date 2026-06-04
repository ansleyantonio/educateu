"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import formatDateTime from "@/app/admin/user-management/audit-logging/_assets/utils/formatDateTime";
import React from "react";

interface AuditLogItem {
  section: string;
  message: React.ReactNode;
  createdAt: string;
}

interface AuditTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  items: {
    auditLogs: AuditLogItem[];
  };
}

export const Logging: React.FC<AuditTimelineProps> = ({
  title,
  className,
  items,
  ...props
}) => {
  return (
    <div className={cn("p-4 relative", className)} {...props}>

      <p className="font-bold text-[16px] mb-4">{title}</p>

      <div className="absolute top-[4.5rem] bottom-8 w-[2px] left-[1.5rem] bg-muted" />

      {items?.auditLogs.map((item, index) => (
        <div key={index} className="flex items-start mb-8 last:mb-0">
        
          <div className="flex relative justify-center items-center w-5 h-5 rounded-full bg-[#DEE3E7]" />

          <div className="flex-1 ml-4 text-[#435450]">
            <p className="font-medium text-[16px] text-black leading-[24px] mb-1">{item.section}</p>
            <p className="text-[16px] text-foreground">{item.message}</p>

            <div className="flex gap-2 items-center mt-2">
              <CalendarDays size={16} className="text-[#A0B0AC]" strokeWidth={1.5} />
              <p className="text-[16px] text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};