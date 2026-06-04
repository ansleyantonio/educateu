"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";

interface OutcomeSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

const OUTCOME_OPTIONS = [
  { value: "pass", label: "Passed" },
  { value: "fail", label: "Failed" },
];

export const OutcomeSelect = ({ value, onChange }: OutcomeSelectProps) => {
  const matchedModule = useMatchedModule();

  // New permission logic using getUserAccess
  const accessLevel = getUserAccess(matchedModule?.modulePermission || []);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={!hasPostAndDeletePermission}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Outcome" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {OUTCOME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};