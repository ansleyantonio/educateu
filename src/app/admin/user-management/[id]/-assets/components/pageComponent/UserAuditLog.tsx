"use client";
import { Timeline } from "@/components/ui/custom_ui/timeline";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Ava from "/public/assets/logo/agent/admin/Avatar.png";
import { CreateUsers } from "@/app/admin/user-management/_assets/interface/CreateUserSchema";
import { fetchSingleUserAuditLogs } from "../controller/fetchSingleUserAuditLogs";
import { useAuths } from "@/hooks/userContext";
import { AuditLogFilter } from "./audit_log_filter";
import { useState } from "react";
import { Button } from "@/components/ui/custom_ui/button";
import { HiOutlineFilter } from "react-icons/hi";
import z from "zod";
import { useForm } from "react-hook-form";
import { AuditLogFilterFormSchema } from "@/app/admin/user-management/audit-logging/_assets/utils/auditLogFilter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import AgentPagination from "@/app/(agent-portal)/agent/application-management/_assets/components/page_components/pagination";
import NoDataComponent from "@/components/common/GlobalLoader/empty";

type UserAuditLogProps = {
  id: string;
  user?: CreateUsers;
};

interface IFilter {
  startDate: string | undefined;
  endDate: string | undefined;
  name: string;
  actionTypes: string[];
}

const UserAuditLog = ({ id, user }: UserAuditLogProps) => {
  const params = useSearchParams();
  const page = params.get("page") || 1;

  const [currentPage, setCurrentPage] = useState(page);

  const auth = useAuths();
  const token = auth?.user?.token;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const defaultFilter = {
    startDate: undefined,
    endDate: undefined,
    name: "",
    actionTypes: [],
  };

  const [filter, setFilter] = useState<IFilter | null>(null);

  const form = useForm<z.infer<typeof AuditLogFilterFormSchema>>({
    resolver: zodResolver(AuditLogFilterFormSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      // name: "",
      actionTypes: [],
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-list-of-single-user-audit-log", { filter, id, token }],
    queryFn: fetchSingleUserAuditLogs,
  });

  //   console.log("Items in User Audit Log", data?.auditLogs.auditLogs);

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-between items-center mb-4">
        <div className="flex justify-start items-center gap-x-3">
          <div className="w-14 h-14 relative">
            <Image alt="logo" src={Ava} fill className="absolute object-fill" />
          </div>
            <div className="flex justify-between items-center text-sm text-[#101828] font-bold capitalize">
              <div className="flex gap-x-1">
                <p>{user?.firstName}</p>
                <p>{user?.lastName}</p>
              </div>
            </div>
        </div>
        {filter && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFilter(null);
              form.reset();
            }}
          >
            Reset
          </Button>
        )}

        {/* Filter Button */}
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="primary"
          size="sm"
        >
          <HiOutlineFilter strokeWidth={3} size={28} color="white" />
          Filter
        </Button>
      </div>

      {data?.auditLogs.auditLogs && data.auditLogs.auditLogs.length > 0 ? (
        <>
          <Timeline isLoading={isLoading} items={data?.auditLogs} />
          <div className="my-6">
            <AgentPagination totalPages={data?.totalPages} />
          </div>
        </>
      ) : (
        <NoDataComponent />
      )}

      <AuditLogFilter
        form={form}
        setFilter={setFilter}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />
    </div>
  );
};

export default UserAuditLog;
