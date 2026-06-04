import formatDateTime from "@/app/admin/user-management/audit-logging/_assets/utils/formatDateTime";
import { CalendarDays } from "lucide-react";
import DataLoader from "../common/GlobalLoader/dataLoader";
import NoDataComponent from "../common/GlobalLoader/empty";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  isLoading: boolean;
  logList: any;
}

const LogList = ({ isLoading, logList }: Props) => {
  return (
    <div className="relative p-4">
      {isLoading ? (
        <div className="min-h-[250px] lg:min-h-[350px]">
          <DataLoader />
        </div>
      ) : logList?.length <= 0 ? (
        <div className="min-h-[250px] lg:min-h-[350px]">
          <NoDataComponent />
        </div>
      ) : (
        <>
          <div className="absolute top-8 bottom-8 w-[3px] left-[1.5rem] bg-muted" />
          <div>
            {logList?.map((item: any, index: number) => (
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
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LogList;
