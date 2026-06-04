import { Card } from "@/components/ui/card";
import Image from "next/image";
import tick from "/public/assets/icons/tick.svg";
import Indicators from "../buttons/indicators";

export default async function FirstTimeFileCheckedCard() {
  return (
    <Card className="overflow-hidden p-3 w-full rounded-xl border shadow sm:p-4 bg-card text-[#666666] md:h-[160px]">
      <div className="flex flex-col gap-2 h-full sm:gap-3">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-4">
            <Image
              src={tick}
              className="p-2 w-10 h-10 rounded-full border sm:p-3 sm:w-12 sm:h-12 border-[#CFD6DD]"
              width={100}
              height={100}
              alt="checked icon"
            />
          </div>
          <div className="col-span-8">
            <Indicators
              text="#1 Checked"
              color="#026AA2"
              background="#B9E6FE"
            />
          </div>
        </div>
        <p className="text-xs font-normal tracking-normal leading-5 sm:text-sm sm:leading-5 text-[#555F6D]">
          First Well-being File Check Completed
        </p>
        <h1 className="text-xl font-bold sm:text-2xl text-[#151D48]">24</h1>
      </div>
    </Card>
  );
}
