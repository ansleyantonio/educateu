/* eslint-disable no-unused-vars */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentFilterProps {
  status: string;
  limit: string;
  setStatus: (value: string) => void;
  setAgentType: (value: string) => void;
  setLimit: (limit: string) => void;
  setOrgType: (org: string) => void;
  total: number;
  setCurrentPage: (page: number) => void;
}

const AwardingStatusBodyFilter = ({
  status,
  limit,
  setStatus,
  setAgentType,
  setLimit,
  setOrgType,
  total,
  setCurrentPage,
}: AgentFilterProps) => {
  return (
    <div className="flex gap-x-3">
      {/* <Select onValueChange={setAgentType}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Agent Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">all</SelectItem>
            <SelectItem value="INTERNAL">Internal</SelectItem>
            <SelectItem value="EXTERNAL">External</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select> */}

      {/* <Select onValueChange={setOrgType}>
        <SelectTrigger>
          <SelectValue placeholder="Internal Organization" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Organization Type</SelectLabel>
            <SelectItem value="Internal Organization">
              Internal Organzation
            </SelectItem>
            <SelectItem value="External Organization">
              External Organzation
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select> */}

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="min-w-[100px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {/* <SelectLabel>Status</SelectLabel> */}
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">InActive</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <CustomField.LimitField
        totalItems={total}
        setLimit={setLimit}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default AwardingStatusBodyFilter;
