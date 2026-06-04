import { Card } from "@/components/ui/card";
// import Image from "next/image";
// import profile from "/public/assets/icons/profile.svg";
// import { HiDotsHorizontal } from "react-icons/hi";

export default async function DuplicatedNameCard() {
  return (
    <Card className="p-4 h-[96px] text-[#666666]">
      {/* <div className="flex justify-between items-center"> */}
      {/*   <div className="flex gap-3 items-center"> */}
      {/*     <Image */}
      {/*       src={profile} */}
      {/*       className="p-3 rounded-full border w-[48px] h-[48px] border-[#CFD6DD]" */}
      {/*       width={100} */}
      {/*       height={100} */}
      {/*       alt="profile" */}
      {/*     /> */}
      {/*     <p>New Applications</p> */}
      {/*   </div> */}
      {/*   <HiDotsHorizontal size={25} color="#4A545E" /> */}
      {/* </div> */}
      <h1 className="text-lg font-bold text-red-600">Duplicated Name</h1>
      <h1 className="mt-3 text-xl font-bold text-[#151D48]">500+</h1>
    </Card>
  );
}
