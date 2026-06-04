/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import circle from "/public/assets/icons/prescrenning/circel.svg";
import { StatusWithIcon } from "@/utils/status_point";
import calendar from "/public/assets/icons/prescrenning/calendar.svg";
import clock from "/public/assets/icons/prescrenning/clock.svg";
import { InfoItem } from "./info-item";
import dateFormat from "@/utils/DateFormatter";

const InterviewInfo = ({ interviewInfo }: any) => {
  const { interviewDate, startTime, endTime, status } = interviewInfo || {};
  return (
    <div className="space-y-4 min-w-[150px]">
      <InfoItem
        icon={calendar}
        text={
          interviewDate
            ? dateFormat.fullDateTime(interviewDate, {
                local: true,
                showTime: false,
              })
            : "N/A"
        }
      />
      <InfoItem
        icon={clock}
        text={
          startTime && endTime
            ? `${dateFormat.time12h(startTime, { local: true })} - ${dateFormat.time12h(endTime, { local: true })}`
            : "N/A"
        }
      />

      {/* <InfoItem icon={locationIcon} text={personalInformation?. || "N/A"} /> */}

      <div className="flex gap-2 items-center">
        <Image src={circle} width={20} height={20} alt="status" />
        <StatusWithIcon
          status={status == "PENDING" ? "BOOKED" : (status ?? "N/A")}
        />
      </div>
    </div>
  );
};

export default InterviewInfo;
