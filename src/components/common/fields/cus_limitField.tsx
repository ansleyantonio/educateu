/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomField } from "./cusInputField";
const LimitField = ({
  setLimit,
  options,
  totalItems,
  setCurrentPage,
}: {
  setLimit: (limit: string) => void;
  options?: string[];
  totalItems?: number;
  setCurrentPage?: (data: number) => void;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const total = totalItems ?? 100;

  const defaultOptions = ["10", "20", "30", "40", "50", "100"];
  const baseOptions = options ?? defaultOptions;
  // Find the index of the first option >= total
  const lastIndex = baseOptions.findIndex((opt) => Number(opt) >= total);

  // Slice from start to that index (inclusive), fallback to full list if not found
  const OptionsList =
    lastIndex === -1 ? baseOptions : baseOptions.slice(0, lastIndex + 1);

  // Get limit from URL or default to 10
  const currentLimit = searchParams.get("pageSize") || "10";

  // tooltip message hidden when select field click
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleLimitChange = (newLimit: string) => {
    // tooltip message hidden when select field click
    setTooltipOpen(false);
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newLimit);
    params.set("page", "1"); // reset to first page when limit changes
    router.push(`${pathname}?${params.toString()}`);
    setLimit(newLimit);
    setCurrentPage?.(1);
  };

  useEffect(() => {
    setLimit(currentLimit);
  }, [currentLimit]);

  return (
    <div>
      <Tooltip
        open={tooltipOpen}
        // block Radix from auto-setting open state
        onOpenChange={(open) => {
          if (!open) setTooltipOpen(false); // allow close
        }}
      >
        <TooltipTrigger asChild>
          <div
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onClick={() => setTooltipOpen(false)} // force close on click
          >
            <CustomField.SingleSelectField
              name="limit"
              placeholder="Limit"
              options={OptionsList}
              onValueChange={handleLimitChange}
              defaultValue={currentLimit}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-500 text-white">
          <p className="text-[10px]">Number of entries per page</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default LimitField;
