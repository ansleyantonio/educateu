/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

interface AgentFilterProps {
  setStatus: (value: string) => void;
  setAgentType: (value: string) => void;
  setLimit: (limit: string) => void;
  total: number;
  setCurrentPage: (page: number) => void;
}

const AgentFilter = ({
  setStatus,
  setAgentType,
  setLimit,
  total,
  setCurrentPage,
}: AgentFilterProps) => {
  const { control } = useForm({
    defaultValues: {
      dataLength: "",
    },
  });
  return (
    <div className="flex gap-x-3">
      <Select onValueChange={setAgentType}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Agent Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {/* <SelectLabel>Agent Type</SelectLabel> */}
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="INTERNAL">Internal</SelectItem>
            <SelectItem value="EXTERNAL">External</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/*      <Select> */}
      {/*   <SelectTrigger className=""> */}
      {/*     <SelectValue placeholder="Internal Organization" /> */}
      {/*   </SelectTrigger> */}
      {/*   <SelectContent> */}
      {/*     <SelectGroup> */}
      {/*       {/* <SelectLabel>Internal Organization</SelectLabel> */}
      {/*       <SelectItem value="apple">Dhaka University</SelectItem> */}
      {/*       {/* <SelectItem value="pineapple">Pineapple</SelectItem> */}
      {/*     </SelectGroup> */}
      {/*   </SelectContent> */}
      {/* </Select> */}
      <Select onValueChange={setStatus}>
        <SelectTrigger className="min-w-[100px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {/* <SelectLabel>Status</SelectLabel> */}
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SUSPENDED">Suspend</SelectItem>
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

export default AgentFilter;
