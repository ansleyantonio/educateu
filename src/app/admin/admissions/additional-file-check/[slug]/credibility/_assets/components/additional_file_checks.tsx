import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronUp } from "lucide-react";
import file_validation from "/public/assets/icons/file_validation.svg";
import { LuInfo, LuSquareCheck } from "react-icons/lu";
import Image from "next/image";

const AdditionalFileChecks = () => {
  return (
    <Card className="mt-4">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-semibold text-black">
          Additional File Checks
        </h1>
        <ChevronUp />
      </div>
      <hr />

      <div className="p-4">
        <div className="flex gap-2 items-start">
          {/* Icon */}
          <LuInfo size={25} className="flex-shrink-0" />

          {/* Paragraph */}
          <p className="flex-grow">
            Nullam ac amet, Ut convallis. non elit eget ac facilisis tortor.
            libero, ultrices amet, Cras ipsum Nam odio faucibus quam sodales.
            ultrices Nullam vitae elit. dolor odio luctus laoreet id ex sit
            facilisis Nam risus in Ut maximus eu placerat ipsum Cras urna. vel
            faucibus elementum Donec gravida elit varius non. est. convallis.
            nisi sollicitudin. nec vel elit quam nec est. In Cras eu non.
            placerat Nam lacus varius nibh Vestibulum Ut quis malesuada urna
            venenatis felis, non.
          </p>
        </div>

        <p className="p-2 my-4 text-red-500 rounded-md bg-[#FAE1E6]">
          No additional file check was completed
        </p>

        <div className="flex gap-2 items-start mb-4">
          {/* Icon */}
          <LuSquareCheck size={25} className="flex-shrink-0" />

          {/* Paragraph */}
          <p className="flex-grow">
            I, Frederick Gordon Deane, hereby confirm that the information
            stored in this file is correct and complete.
          </p>
        </div>

        <div className="flex justify-end">
          <Button className="rounded-full border" variant="secondary">
            <Image
              src={file_validation}
              className="w-[20px] h-[20px]"
              alt="file validation"
            />
            Confirm additional check 1
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdditionalFileChecks;
