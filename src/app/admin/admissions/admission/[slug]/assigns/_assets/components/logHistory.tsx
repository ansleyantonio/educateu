/* eslint-disable @typescript-eslint/no-explicit-any */
import formatDateTime from "@/app/admin/user-management/audit-logging/_assets/utils/formatDateTime";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays } from "lucide-react";

const LogHistory = ({ history }: any) => {
  return (
    <ScrollArea className="w-full h-[calc(100vh-254px)]">
      <div className="relative p-4">
        {/* Continuous line */}
        <div className="absolute top-8 bottom-8 w-[3px] left-[1.5rem] bg-muted" />{" "}
        {/* Increased the line weight */}
        {history?.length > 0 &&
          history?.map((item: any, index: number) => (
            <div key={index} className="flex items-start mb-8 last:mb-0">
              {/* Increased dot size */}

              <div className="flex relative justify-center items-center w-5 h-5 rounded-full bg-[#DEE3E7]" />
              {/* Step Content */}
              <div className="flex-1 ml-4 text-[#435450]">
                <p className="text-base font-medium leading-tight capitalize text-foreground">
                  {" Assigned to " +
                    item?.assignedTo?.userPortalCategory?.user?.firstName +
                    " " +
                    item?.assignedTo?.userPortalCategory?.user?.lastName +
                    " by " +
                    item?.assignedBy?.userPortalCategory?.user?.firstName +
                    " " +
                    item?.assignedBy?.userPortalCategory?.user?.lastName}
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
          ))}
      </div>
    </ScrollArea>
  );
};

export default LogHistory;
