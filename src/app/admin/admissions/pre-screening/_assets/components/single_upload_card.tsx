"use client";

import * as React from "react";
import { format, isBefore, isAfter } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateRangePicker() {
  const [fromDate, setFromDate] = React.useState<Date>();
  const [toDate, setToDate] = React.useState<Date>();

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    if (toDate && date && isAfter(date, toDate)) {
      setToDate(undefined); // Clear "to" date if it's before the "from" date
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    if (fromDate && date && isBefore(date, fromDate)) {
      setFromDate(undefined); // Clear "from" date if it's after the "to" date
    }
  };

  return (
    <div className="space-y-4">
      {/* From Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !fromDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2" />
            {fromDate ? (
              format(fromDate, "PPP")
            ) : (
              <span>Pick a start date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={handleFromDateChange}
            initialFocus
            disabled={(date) => isBefore(date, new Date())} // Disable past dates
          />
        </PopoverContent>
      </Popover>

      {/* To Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !toDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2" />
            {toDate ? format(toDate, "PPP") : <span>Pick an end date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={handleToDateChange}
            initialFocus
            disabled={(date) => (fromDate ? isBefore(date, fromDate) : false)} // Disable dates before the "from" date
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
