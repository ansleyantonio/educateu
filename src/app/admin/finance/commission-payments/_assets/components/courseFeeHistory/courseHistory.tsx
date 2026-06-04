import dateFormat from "@/utils/DateFormatter";
import { CalendarDays, Dot } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CourseHistory = ({ historyData }: any) => {
  return (
    <>
      {/* Continuous line */}
      <div className="absolute bottom-8 top-24 w-[3px] left-[1.5rem] bg-muted" />

      {historyData?.auditLogs?.length > 0 ? (
        historyData.auditLogs.map((item: any, index: number) => (
          <div key={index} className="flex items-start mb-8 last:mb-0">
            {/* Dot */}
            <div className="flex relative justify-center items-center w-5 h-5 rounded-full bg-[#DEE3E7]" />

            {/* Step Content */}
            <div className="flex-1 ml-4 text-[#435450]">
              <p className="text-base font-medium leading-tight capitalize text-foreground">
                {item?.user?.username} {item.action}
              </p>
              <div className="flex gap-1 items-center mt-3">
                <CalendarDays
                  size={18}
                  className="text-[#A0B0AC]"
                  strokeWidth={2}
                />
                <p className="text-sm text-muted-foreground">
                  {dateFormat.fullDateTime(item.createdAt)}
                </p>
                <Dot size={18} className="text-[#A0B0AC]" strokeWidth={5} />
                <p>{item.action}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-2 w-full min-h-[150px]">
          <p className="py-1 px-2 text-sm text-center text-black bg-white rounded-md">
            No Audit Logs
          </p>
        </div>
      )}
    </>
  );
};

export default CourseHistory;
