import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextCaseFormat } from "@/utils/textFormate";
import Image from "next/image";
const IconShow = ({
  navigation,
  path,
  alt,
  name,
}: {
  navigation: boolean;
  path: string;
  alt: string;
  name: string;
}) => {
  return (
    <div className="flex w-full rounded-md items-center justify-start gap-2 xl:gap-3">
      {!navigation ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[18px] h-[18px] xl:w-6 xl:h-6 relative z-auto">
                <Image
                  src={path}
                  alt={alt}
                  className="absolute object-fill text-white w-full h-full"
                  fill
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="">
                {TextCaseFormat(name.split("-").join(" "))}
                {/* {name.split("-").join(" ")} */}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="w-[18px] h-[18px] xl:w-6 xl:h-6 relative z-auto">
          <Image
            src={path}
            alt={alt}
            className="absolute object-fill text-white w-full h-full"
            fill
          />
        </div>
      )}
      {navigation && (
        <span className="mt-1 text-white text-[12px] capitalize">{name}</span>
      )}
    </div>
  );
};

export default IconShow;
