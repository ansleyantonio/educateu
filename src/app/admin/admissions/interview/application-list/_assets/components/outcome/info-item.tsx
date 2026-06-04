/* eslint-disable @typescript-eslint/no-explicit-any */
import { TruncateText } from "@/utils/TruncateText";
import Image from "next/image";

interface InfoItemProps {
  icon: any;
  text: string;
  isTruncate?: boolean;
}

export function InfoItem({ icon, text, isTruncate = false }: InfoItemProps) {
  return (
    <div className="flex gap-2 items-center">
      <Image
        src={icon || "/placeholder.svg"}
        width={20}
        height={20}
        alt="icon"
      />
      {isTruncate ? <TruncateText text={text} /> : <p>{text ? text : "N/A"}</p>}
    </div>
  );
}
