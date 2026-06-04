"use client";

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
import { useState } from "react";

interface DateSelectorProps {
  value?: Date;
  onChange?: (date: Date) => void;
  birthdate?: boolean;
  disabled?: boolean;
}

export function DateSelector({
  value,
  onChange,
  birthdate,
  disabled = false,
}: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      console.log("Selected Date atik:", date);
      onChange?.(date);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value instanceof Date && !isNaN(value.getTime()) ? (
            format(value, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
          <CalendarIcon className="ml-auto w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <CustomCalendar
          // style={{ width: "100%", height: "100px" }}
          mode="single"
          captionLayout="dropdown-buttons"
          selected={value}
          onSelect={handleSelect} // Use custom handler to close on select
          fromYear={1960}
          toYear={2030}
          birthdate={birthdate}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
