/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { RefreshCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OutComeForm } from "./_assets/components/outcome/outcome-form";

const ApplicationList = () => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [searchText, setSearchText] = useState("");
  const [limit, setLimit] = useState("10");
  const [status, setStatus] = useState("");
  const [assignedToMe, setAssignedToMe] = useState("ALL");

  const { data, isLoading } = useFetchData({
    queryKey: "interview-able-applicants",
    path: `interview/applications`,
    method: "POST",
    filterData: {
      page: currentPage,
      ownership: assignedToMe,
      interviewOutcome: status,
      pageSize: limit,
      searchTerm: searchText,
    },
  });

  useEffect(() => {
    if (searchText) {
      setAssignedToMe("");
      setStatus("");
    }
  }, [searchText]);

  const applications = data?.data?.applications;

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Interview",
          href: "/admin/admissions/interview/application-list",
        },
        { title: "Application List" },
      ]}
    >
      <div className="rounded-lg border border-gray-200 bg-[#F6F6F6]">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 justify-between p-4 w-full xl:flex-row">
          <h3 className="text-lg font-semibold">Interview Application List</h3>
          <div className="flex flex-wrap gap-2 items-center lg:gap-4">
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />

            <CustomField.LimitField
              key={limit}
              setLimit={setLimit}
              totalItems={data?.pagination?.total}
              setCurrentPage={setCurrentPage}
            />

            <CustomField.SingleSelectField
              key={status}
              name="status"
              placeholder="Status"
              options={["PENDING", "PASS", "FAIL", "BOOKED"]}
              onValueChange={(value: string) => {
                setStatus(value);
              }}
              defaultValue={status}
            />

            <CustomField.SingleSelectField
              key={assignedToMe}
              name="assignedToMe"
              placeholder="Assigned"
              options={["ALL", "OWN"]}
              defaultValue={assignedToMe}
              onValueChange={(value) => {
                setAssignedToMe(value);
              }}
            />

            {(currentPage > 1 ||
              limit !== "10" ||
              searchText ||
              status != "" ||
              assignedToMe !== "ALL") && (
              <ActionButton
                variant="icon"
                handleOpen={() => {
                  setCurrentPage(1);
                  setStatus("");
                  setLimit("10");
                  setSearchText("");
                  setAssignedToMe("ALL");
                }}
                icon={<RefreshCcw />}
              />
            )}
          </div>
        </div>

        {/* Table */}
        <div>
          <OutComeForm
            pagination={data?.pagination}
            isLoading={isLoading}
            applications={applications}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ApplicationList;
