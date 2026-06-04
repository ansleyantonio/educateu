import { Button } from "@/components/ui/button";
import { CustomCalendar } from "@/components/ui/custom_ui/custom_calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface DateSelectorProps {
  value?: Date | string;
  onChange?: (date: Date) => void;
  birthdate?: boolean;
  disabled?: boolean;
}

export function SelectDateField({
  value,
  onChange,
  birthdate,
  disabled = false,
}: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const parsedValue =
    typeof value === "string" ? new Date(value) : value;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(date);
      setOpen(false);
    }
  };

  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;

    const handleSubmit = () => setOpen(false);
    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !parsedValue && "text-muted-foreground"
          )}
        >
          {parsedValue instanceof Date && !isNaN(parsedValue.getTime()) ? (
            format(parsedValue, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
          <CalendarIcon className="ml-auto w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <CustomCalendar
          mode="single"
          captionLayout="dropdown-buttons"
          selected={parsedValue}
          onSelect={handleSelect}
          fromYear={1960}
          toYear={2030}
          birthdate={birthdate}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}