import { Card } from "@/components/ui/card";
import Image from "next/image";
import appointment from "/public/assets/icons/appointment.svg";

export default async function TotalInterviewCard() {
  return (
    <Card className="p-6 w-full h-[96px] text-[#666666]">
      <div className="flex flex-col gap-2 items-start">
        <p className="text-[14px]">Total interviewed</p>
        <div className="flex gap-3 items-center">
          <Image
            src={appointment}
            className="p-1 rounded-full border w-[30px] h-[30px] border-[#CFD6DD]"
            width={100}
            height={100}
            alt="profile"
          />
          <h1 className="font-bold text-[24px] text-[#151D48]">500+</h1>
        </div>
      </div>
    </Card>
  );
}
