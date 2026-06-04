import { Card } from "@/components/ui/card";

export default async function DuplicatedDOBCard() {
  return (
    <Card className="p-6 w-full h-[96px] text-[#666666]">
      <div className="flex flex-col gap-2 items-start">
        <p className="text-[14px] text-[#FF0000]">Duplicated DOB</p>
        <h1 className="font-bold text-[24px] text-[#151D48]">50</h1>
      </div>
    </Card>
  );
}
