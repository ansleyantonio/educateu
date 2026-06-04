"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CusPagination from "@/components/common/pagination/paginations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/custom_ui/customCard";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { Timeline } from "@/components/ui/custom_ui/timeline";
import { TabButton } from "@/components/ui/TabButton";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineFilter } from "react-icons/hi";
import z from "zod";
import { AuditDownloadModal } from "./_assets/component/audit_download_modal";
import { AuditLogFilter } from "./_assets/component/audit_log_filter";
import { fetchListOfAuditLogs } from "./_assets/query_controller/fetchAuditLogs";
import { AuditLogFilterFormSchema } from "./_assets/utils/auditLogFilter";

interface IFilter {
  startDate: string | undefined;
  endDate: string | undefined;
  name: string;
  actionTypes: string[];
  tab?: string;
}

const AuditLogging = () => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDialog, setDialog] = useState(false);
  const [isValue, setIsValue] = useState("all");

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const [filter, setFilter] = useState<IFilter | null>(null);

  const form = useForm<z.infer<typeof AuditLogFilterFormSchema>>({
    resolver: zodResolver(AuditLogFilterFormSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      name: "",
      actionTypes: [],
    },
  });
  // const hasPostAndDeletePermission = getUserAccess(permissions) === "full-access";

  const { data, isLoading } = useQuery({
    queryKey: [
      "fetch-list-of-audits-logs",
      { filter, page: currentPage, token, tab: isValue },
    ],
    queryFn: fetchListOfAuditLogs,
  });

  // useEffect(() => {
  //   setCurrentPage(page);
  // }, [page]);

  const handleTabChange = (val: string) => {
    setIsValue(val);

    setFilter((prev) => {
      const baseFilter = prev || {
        startDate: undefined,
        endDate: undefined,
        name: "",
        actionTypes: [],
      };

      return {
        ...baseFilter,
        actionTypes: val === "all" ? [] : [val],
      };
    });
  };

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // { title: "User Management", href: "/admin/user-management/audit-logging" },
        {
          title: "Audit & Logging",
          href: "/admin/user-management/audit-logging",
        },
      ]}
    >
      <div>
        <div className="flex justify-between items-center mb-4 h-10">
          <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#272E35]">
            Audit Logging
          </h1>

          <div className="flex items-center space-x-2 mx-3">
            {filter && (
              <Button
                variant="outline"
                onClick={() => {
                  // setIsValue("all");
                  handleTabChange("all");
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
              variant="outline"
              size="sm"
              className="ml-auto h-10 text-sm font-semibold text-[#555F6D]"
            >
              <HiOutlineFilter size={28} color="#555F6D" />
              Filter
            </Button>

            {/* Download Button */}
            <Button
              onClick={() => {
                if (hasPostAndDeletePermission) setDialog(true);
              }}
              variant="outline"
              size="sm"
              disabled={!hasPostAndDeletePermission}
              className={`ml-auto h-10 font-semibold text-[#555F6D] text-sm ${
                !hasPostAndDeletePermission
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Download
            </Button>
          </div>
        </div>

        <Card>
          <Tabs value={isValue} className="bg-white">
            <TabsList className="w-full grid grid-cols-2">
              <TabButton
                value="all"
                label="All"
                onClick={handleTabChange}
                className="w-full text-center"
              />
              <TabButton
                value="course_management"
                label="Course Management"
                onClick={handleTabChange}
                className="w-full text-center"
              />
            </TabsList>

            <TabsContent value="all">
              <Timeline isLoading={isLoading} items={data} />
            </TabsContent>
            <TabsContent value="course_management">
              <Timeline isLoading={isLoading} items={data} />
            </TabsContent>
          </Tabs>
        </Card>
        {/* <hr /> */}
        <div className="my-6 mx-3">
          <CusPagination
            totalPages={data?.totalPages || 1}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
          {/* <AgentPagination totalPages={data?.totalPages} /> */}
        </div>
        <AuditLogFilter
          form={form}
          setFilter={setFilter}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
        <AuditDownloadModal open={openDialog} setOpen={setDialog} />
      </div>
    </PageWithBreadcrumb>
  );
};

export default AuditLogging;
