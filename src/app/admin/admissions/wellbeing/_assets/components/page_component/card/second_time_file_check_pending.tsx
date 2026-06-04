import { Card } from "@/components/ui/card";
import Image from "next/image";
import sandClock from "/public/assets/icons/sandClock.svg";
import Indicators from "../buttons/indicators";

export default async function SecondTimeFileCheckCardPending() {
  return (
    <Card className="overflow-hidden p-3 w-full rounded-xl border shadow sm:p-4 bg-card text-[#666666] md:h-[160px]">
      <div className="flex flex-col gap-2 h-full sm:gap-3">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-4">
            <Image
              src={sandClock}
              className="p-2 w-10 h-10 rounded-full border sm:p-3 sm:w-12 sm:h-12 border-[#CFD6DD]"
              width={100}
              height={100}
              alt="sand clock"
            />
          </div>
          <div className="col-span-8">
            <Indicators
              text="#2 Pending"
              color="#272E35"
              background="#F9DBAF"
            />
          </div>
        </div>
        <p className="text-xs font-normal tracking-normal leading-5 sm:text-sm sm:leading-5 text-[#555F6D]">
          Second Well-being File Check Pending
        </p>
        <h1 className="text-xl font-bold sm:text-2xl text-[#151D48]">125</h1>
      </div>
    </Card>
  );
}
