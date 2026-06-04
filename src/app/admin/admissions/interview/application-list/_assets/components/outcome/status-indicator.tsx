import Image from "next/image";
import circle from "/public/assets/icons/prescrenning/circel.svg";
import { GoDotFill } from "react-icons/go";

interface StatusIndicatorProps {
  status: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  Booked: {
    bg: "bg-[#C6F1DA]",
    text: "text-[#1D7C4D]",
  },
  Pending: {
    bg: "bg-[#FFF3CD]",
    text: "text-[#856404]",
  },
  Rejected: {
    bg: "bg-[#F8D7DA]",
    text: "text-[#721C24]",
  },
  Interviewed: {
    bg: "bg-[#D1ECF1]",
    text: "text-[#0C5460]",
  },
  // default fallback
  Default: {
    bg: "bg-gray-200",
    text: "text-gray-700",
  },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const { bg, text } = statusStyles[status] || statusStyles["Default"];

  return (
    <div className="flex gap-2 items-center">
      <Image src={circle} width={20} height={20} alt="status" />
      <div className={`flex gap-2 items-center py-1 px-2 rounded-md ${bg}`}>
        <GoDotFill className={text} />
        <p className={`font-medium ${text}`}>{status}</p>
      </div>
    </div>
  );
}
