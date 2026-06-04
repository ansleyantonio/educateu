/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { ApplicantProps } from "@/components/common/dialog/assign/applicant_interface";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplicantTable } from "../_assets/components/page_component/applicant_table/applicant_table";
import { FilterComponent } from "../_assets/components/page_component/filter_component/filter_component";

const ApplicantPage = () => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [applicationInfo, setApplicationInfo] = useState<ApplicantProps[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [limit, setLimit] = useState("10");
  const { data, isLoading } = useFetchData({
    queryKey: "list-of-admission-applications-data",
    path: `admission`,
    method: "POST",
    filterData: {
      page: currentPage,
      searchTerm: search,
      pageSize: limit,
      ownership: assignmentFilter,
      ...filters,
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search, limit]);

  // console.log("application info", applicationInfo);
  // useEffect(() => {
  //   // Filter applications that are in the selectedIds array
  //   const filteredApplications =
  //     data?.data?.applications.filter((item: any) =>
  //       selectedIds.includes(item.id)
  //     ) || [];

  //   setApplicationInfo(filteredApplications);
  // }, [selectedIds, data?.data?.applications]);

  return (
    <PageWithBreadcrumb items={[{ title: "Home" }, { title: "Admission" }]}>
      <div className="relative my-5">
        <section className="">
          {/* Applicants summary cards*/}

          {/* <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
          <DuplicatedNameCard />
          <DuplicatedDOBCard />
          <DuplicatedAddressCard />
          <ApplicationCheckedCard />
          <TotalInterviewCard />
          <SubmittedCard />
        </div> */}

          <FilterComponent
            onFilterChange={(payload) => {
              setFilters(payload);
            }}
          />
          {/* Applicants Table */}
          <div className="mt-4">
            {/* <DataTableToolbar
              applicationInfo={applicationInfo}
              dataLength={data?.data?.applications.length || 0}
              search={search}
              setAssignmentFilter={setAssignmentFilter}
              setLimit={setLimit}
              setSearch={setSearch}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLists={filterLists}
              setFilterLists={setFilterLists}
            />
            <DynamicTableWithPagination
              isCheckBox={true}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              setSelectObject={setApplicationInfo}
              data={data?.data?.applications}
              isLoading={isLoading}
              pagination={data?.pagination}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              config={{
                columns: [
                  {
                    key: "name",
                    header: "Applicant Name",
                    render: (applicant) => (
                      <Link
                        className="flex gap-3 items-center w-full cursor-pointer"
                        onClick={() =>
                          setApplicantStatusCookie(
                            applicant.stage !== "NEW" ? true : false
                          )
                        }
                        href={`/admin/admissions/admission/${applicant.id}/profile`}
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
                  },
                  {
                    key: "assigned",
                    header: "Assigned",
                  },
                  {
                    key: "courseSelection.course",
                    header: "Course Programme",
                    render: (applicant) =>
                      applicant?.courseSelection?.course || "-",
                  },
                  {
                    key: "generalFileCheckStatus",
                    header: "Checked",
                  },
                  {
                    key: "finance",
                    header: "Finance",
                  },
                  {
                    key: "credibility",
                    header: "Credibility",
                  },
                  {
                    key: "status",
                    header: "Status",
                  },
                  {
                    key: "stage",
                    header: "State/Progress",
                  },
                ],
              }}
            /> */}
            <ApplicantTable
              search={search}
              setSearch={setSearch}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              applications={data}
              isLoading={isLoading}
              pageLimit={limit}
              setPageLimit={setLimit}
              assignmentFilter={assignmentFilter}
              setAssignmentFilter={setAssignmentFilter}
            />
          </div>
        </section>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ApplicantPage;
