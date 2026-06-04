import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipComponent({
  text,
  lowercase = false,
}: {
  text: string;
  lowercase?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {lowercase ? (
            <span className="lowercase">{text}</span>
          ) : (
            <span className="capitalize">{text}</span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TooltipComponent;
