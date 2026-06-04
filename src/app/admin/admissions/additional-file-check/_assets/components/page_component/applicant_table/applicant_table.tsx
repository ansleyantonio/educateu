/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  search: string;
  setSearch: (search: string) => void;
  setCurrentPage: (page: number) => void;
  currentPage: number;
  limit: string;
  setLimit: (limit: string) => void;
  filterLists: Partial<IFilterLists> | undefined;
  setFilterLists: (filterLists: Partial<IFilterLists> | undefined) => void;
}

export function ApplicantTable({
  applications,
  setCurrentPage,
  currentPage,
  isLoading,
  search,
  setSearch,
  setLimit,
  limit,
  filterLists,
  setFilterLists,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // const [filterLists, setFilterLists] = useState<
  //   Partial<IFilterLists> | undefined
  // >(undefined);
  return (
    <Card>
      <DataTableToolbar
        dataLength={applications?.data?.applications.length}
        search={search}
        setSearch={setSearch}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        filterLists={filterLists}
        setFilterLists={setFilterLists}
        setLimit={setLimit}
        total={applications?.pagination?.total}
        setCurrentPage={setCurrentPage}
      />

      <DynamicTableWithPagination
        isLoading={isLoading}
        data={applications?.data?.applications || []}
        pagination={{
          page: currentPage,
          total: applications?.data?.applications.length,
          totalPages: applications?.pagination?.totalPages,
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "applicantName",
              header: "Applicant Name",
              render: (applicant) => (
                <Link
                  className="flex gap-3 items-center w-full cursor-pointer"
                  onClick={() =>
                    setApplicantStatusCookie(
                      applicant.stage !== "NEW" ? true : false
                    )
                  }
                  href={`/admin/admissions/additional-file-check/${applicant.id}/profile`}
                >
                  <Image
                    src={image}
                    alt="Applicant Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
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
            {
              key: "finance",
              header: "Finance",
              render: (applicant: any) => <>{applicant.finance}</>,
            },
            {
              key: "credibility",
              header: "Credibility",
              render: (applicant: any) => <>{applicant.credibility}</>,
            },
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
      />
    </Card>
  );
}
