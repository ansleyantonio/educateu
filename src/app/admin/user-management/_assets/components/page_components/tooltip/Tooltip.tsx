import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyWithIcon } from "@/utils/CopyButton";

export function CusTooltipComponent({
  text,
  lowercase = false,
  copy = false,
}: {
  text: string;
  lowercase?: boolean;
  copy?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {lowercase ? (
            <span className="lowercase">
              {text.split("-")[0]}
              {text.split("-").length > 0 && "..."}
            </span>
          ) : (
            <span className="capitalize">
              {text.split("-")[0]}
              {text.split("-").length > 0 && "..."}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex gap-3 justify-center items-center">
            <p>{text}</p>
            {copy && <CopyWithIcon text={text} />}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default CusTooltipComponent;
