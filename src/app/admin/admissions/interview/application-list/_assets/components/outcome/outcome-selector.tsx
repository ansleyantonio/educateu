"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OutcomeOption } from "../../interface/interface";

const OUTCOME_OPTIONS = [
  { value: "pass", label: "Passed" },
  { value: "fail", label: "Failed" },
];

interface OutcomeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function OutcomeSelector({
  value,
  onValueChange,
  disabled = false,
}: OutcomeSelectorProps) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Select Outcome</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select Outcome" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {OUTCOME_OPTIONS.map((option: OutcomeOption) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
