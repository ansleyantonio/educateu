"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import SingleApplicationAuditLog from "@/components/SingleApplicationAduitLog/SingleApplicationAuditLog";
import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { AuditDownloadModal } from "./_assets/component/audit_download_modal";
import { AuditLogFilter } from "./_assets/component/audit_log_filter";
import { AuditLogFilterFormSchema } from "./_assets/utils/auditLogFilter";

interface IFilter {
  startDate: string | undefined;
  endDate: string | undefined;
  name: string;
  actionTypes: string[];
  tab?: string;
}

const AuditLogging = () => {
  const { user, editAccess } = useAuths();
  const token = user?.token;

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDialog, setDialog] = useState(false);
  const [isValue, setIsValue] = useState("all");

  const [filter, setFilter] = useState<IFilter | null>(null);

  const form = useForm<z.infer<typeof AuditLogFilterFormSchema>>({
    resolver: zodResolver(AuditLogFilterFormSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      name: "",
      actionTypes: ["business_development"],
    },
  });
  // const editAccess = getUserAccess(permissions) === "full-access";

  // const { data, isLoading } = useQuery({
  //   queryKey: [
  //     "fetch-list-of-audits-logs",
  //     { filter, page: currentPage, token, tab: isValue },
  //   ],
  //   queryFn: fetchListOfAuditLogs,
  // });

  const { data, isLoading } = useFetchData({
    filterData: {
      // page: currentPage,
      token,
      // tab: isValue,
      actionTypes: "business_development",
    },
    queryKey: "fetch-list-of-bdm-audits-logs",
    method: "POST",
    path: `user-management/user/logs?page=${currentPage}`,
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
        actionTypes: val === "business_development" ? [] : [val],
      };
    });
  };

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Business Development Management",
        //   href: "/admin/business-development-management/audit-log",
        // },
        { title: "Audit & Logging" },
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
            {/* <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              size="sm"
              className="ml-auto h-10 text-sm font-semibold text-[#555F6D]"
            >
              <HiOutlineFilter size={28} color="#555F6D" />
              Filter
            </Button> */}

            {/* Download Button */}
            <Button
              onClick={() => {
                if (editAccess) setDialog(true);
              }}
              variant="outline"
              size="sm"
              disabled={!editAccess}
              className={`ml-auto h-10 font-semibold text-[#555F6D] text-sm ${
                !editAccess ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Download
            </Button>
          </div>
        </div>

        <SingleApplicationAuditLog
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
          data={data?.auditLogs}
          totalPages={data?.totalPages}
        />

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
