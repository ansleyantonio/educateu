/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicantProps } from "@/components/common/dialog/assign/applicant_interface";
import { Card } from "@/components/ui/card";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { setApplicantStatusCookie } from "@/lib/applicanStageCookie";
import { TruncateWithTooltip } from "@/utils/truncateWithTooltip";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DataTableToolbar } from "./data-table-toolbar";
import { IFilterLists } from "./data_type";
import image from "/public/assets/logo/dashboard_management/image.png";

interface Props {
  applications: any;
  isLoading: boolean;
  setCurrentPage: (data: number) => void;
  pageLimit: string;
  setPageLimit: (limit: string) => void;
  currentPage: number;
  search: string;
  setSearch: (search: string) => void;
  assignmentFilter: string;
  setAssignmentFilter: (value: string) => void;
}

export function ApplicantTable({
  applications,
  setCurrentPage,
  currentPage,
  isLoading,
  search,
  setSearch,
  pageLimit,
  setPageLimit,
  assignmentFilter,
  setAssignmentFilter,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterLists, setFilterLists] = useState<
    Partial<IFilterLists> | undefined
  >(undefined);
  const [applicationInfo, setApplicationInfo] = useState<ApplicantProps[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // const [assignmentFilter, setAssignmentFilter] = useState("unassigned");

  // const toggleRowSelection = (data: any) => {
  //   // Check if the item already exists in applicationInfo
  //   const existingIndex = applicationInfo.findIndex(
  //     (item) => item.id === data?.id
  //   );
  //
  //   if (existingIndex >= 0) {
  //     // If exists, remove it
  //     setApplicationInfo((prev) => prev.filter((item) => item.id !== data?.id));
  //   } else {
  //     // If doesn't exist, add it
  //     setApplicationInfo((prev) => [
  //       ...prev,
  //       {
  //         id: data?.id,
  //         outcome: data?.outcome,
  //         name: `${data?.personalInformation?.firstName} ${data?.personalInformation?.lastName}`,
  //         wellbeingStatus: data?.wellbeingCheckStatus,
  //       },
  //     ]);
  //   }
  // };

  // const toggleSelectAll = (
  //   allApplicants: Array<{ id: string; [key: string]: any }>
  // ) => {
  //   setApplicationInfo((prev) => {
  //     // If all applicants are already selected, deselect all
  //     if (prev.length === allApplicants.length) {
  //       return [];
  //     }
  //
  //     // Otherwise select all applicants
  //     return allApplicants.map((applicant) => ({
  //       id: applicant.id,
  //       outcome: applicant.outcome,
  //       wellbeingStatus: applicant.wellbeingCheckStatus,
  //       name: `${applicant.personalInformation?.firstName || ""} ${
  //         applicant.personalInformation?.lastName || ""
  //       }`.trim(),
  //     }));
  //   });
  // };
  //
  // const isRowSelected = (id: string) =>
  //   applicationInfo.some((item) => item.id === id);

  const dataLength = applications?.data?.applications.length;

  return (
    <Card>
      {/* applicationId={selectedIds} */}
      <DataTableToolbar
        setCurrentPage={setCurrentPage}
        total={applications?.pagination?.total || 0}
        applicationInfo={applicationInfo}
        dataLength={dataLength}
        search={search}
        setAssignmentFilter={setAssignmentFilter}
        setLimit={setPageLimit}
        setSearch={setSearch}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        filterLists={filterLists}
        setFilterLists={setFilterLists}
      />

      <DynamicTableWithPagination
        data={applications?.data?.applications}
        isLoading={isLoading}
        pagination={applications?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "applicantId",
              header: "Applicant Name",
              render: (applicant: any) => (
                <>
                  <Link
                    className="flex gap-3 items-center pr-4 cursor-pointer"
                    onClick={() =>
                      setApplicantStatusCookie(
                        applicant.stage !== "NEW" ? true : false,
                      )
                    }
                    href={`/admin/admissions/admission/${applicant.id}/profile`}
                  >
                    <Image
                      src={image}
                      alt="Applicant Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      {applicant.personalInformation && (
                        <TruncateWithTooltip
                          text={
                            applicant?.personalInformation?.firstName +
                            " " +
                            applicant?.personalInformation?.lastName
                          }
                          length={20}
                        />
                      )}

                      {applicant.personalInformation?.email && (
                        <TruncateWithTooltip
                          text={applicant.personalInformation.email}
                          lowercase={true}
                          length={15}
                          copy={true}
                        />
                      )}
                    </div>
                  </Link>
                </>
              ),
            },
            {
              key: "agentOrSource",
              header: "Agent/Source",
              render: (applicant: any) => (
                <div className="capitalize">
                  {applicant?.agentOrSource?.toLowerCase()}
                </div>
              ),
            },
            {
              key: "admissionOfficer",
              header: "Assigned",
              render: (applicant: any) => (
                <div className="capitalize">
                  {applicant?.admissionOfficer?.toLowerCase()}
                </div>
              ),
            },
            {
              key: "courseSelection",
              header: "Course Programme",
              render: (applicant: any) => (
                <div className="ml-2 capitalize">
                  {applicant?.courseSelection?.course?.course?.title || "-"}
                </div>
              ),
            },
            {
              key: "checked",
              header: "Checked",
              render: (applicant: any) => (
                <div className="text-xs">
                  {applicant.generalFileCheckStatus}
                </div>
              ),
            },
            // {
            //   key: "finance",
            //   header: "Finance",
            //   render: (applicant: any) => <>{applicant.finance}</>,
            // },
            // {
            //   key: "credibility",
            //   header: "Credibility",
            //   render: (applicant: any) => <>{applicant.credibility}</>,
            // },
            {
              key: "status",
              header: "Status",
              render: (applicant: any) => (
                <div className="text-xs">{applicant.status}</div>
              ),
            },
            {
              key: "state/progress",
              header: "State/Progress",
              render: (applicant: any) => (
                <div className="text-xs">{applicant.stage}</div>
              ),
            },
          ],
        }}
        isCheckBox
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        setSelectObject={setApplicationInfo}
      />
    </Card>
  );
}
