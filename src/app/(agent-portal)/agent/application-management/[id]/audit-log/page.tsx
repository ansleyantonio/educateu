"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import SingleApplicationAuditLog from "@/components/SingleApplicationAduitLog/SingleApplicationAuditLog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const AuditLog = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");
  const [searchTerm, setSearchText] = useState("");

  const { data, isLoading } = useFetchData({
    // get all audit logs
    path: `application-management/courses/audit-logs/${id}`,
    queryKey: "fetch-module-audit-logs",
  });
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/agent" },
        {
          title: "Application Management",
          href: "/agent/application-management",
        },
        { title: "Audit & Logging" },
      ]}
    >
      <div>
        <div className="lg:flex justify-between items-center p-6 space-y-2 lg:space-y-0">
          <h1 className="text-lg font-bold leading-6 text-[#000000] p">
            Audit Logging
          </h1>

          <div className="flex gap-2 space-y-2 md:space-y-0">
            <CustomField.CommonSearch
              searchText={searchTerm}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField
              totalItems={data?.pagination?.total}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
            {/* Download Button */}
            <Button
              //   onClick={() => {
              //     if (editAccess) setDialog(true);
              //   }}
              variant="outline"
              size="sm"
              //   disabled={!editAccess}
              className={`ml-auto h-10 font-semibold text-[#555F6D] text-sm`}
            >
              Download
            </Button>
          </div>
        </div>

        <Suspense fallback={<h1 />}>
          <SingleApplicationAuditLog
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            data={data?.data.auditLogs}
            totalPages={data?.totalPages}
          />
          {/* <SomeComponent /> */}
        </Suspense>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AuditLog;
