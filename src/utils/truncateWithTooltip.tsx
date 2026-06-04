import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyWithIcon } from "@/utils/CopyButton";

export function TruncateWithTooltip({
  text,
  lowercase = false,
  copy = false,
  length = 20,
}: {
  text: string;
  lowercase?: boolean;
  copy?: boolean;
  length?: number;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap ${
              lowercase ? "lowercase" : "capitalize"
            }`}
            style={{ maxWidth: "100%" }}
          >
            {text.length > length ? text.slice(0, length) + "..." : text}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <div className="flex overflow-auto gap-3 justify-center items-center max-w-[80vw]">
            <p className="break-all">{text}</p>
            {copy && <CopyWithIcon text={text} />}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
