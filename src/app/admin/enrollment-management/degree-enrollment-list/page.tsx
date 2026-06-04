"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import DownloadCSV from "@/components/Download/CSV_XLSX/ExportasCSV";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FilterData from "./_assets/components/filterData/FilterData";
import { MigrateStudentModal } from "./_assets/components/modal/MigrateStudenModal";
import DegreeEnrollmentApplicationList from "./_assets/components/view/degreeEnrollmentList";

const DegreeEnrollmentList = () => {
  const [filterData, setFilterData] = useState({});
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  // select Applicant
  const [selectApplicant, setSelectApplicant] = useState([]);
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    path: `enrollment-management`,
    method: "POST",
    filterData: {
      ...filterData,
      // pageSize: limit,
      page: currentPage,
      searchText,
      courseType: "DEGREE_COURSE",
    },
    queryKey: "fetch-degree-enrollment-list",
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Enrollment Management",
        //   href: "/admin/enrollment-management/degree-enrollment-list",
        // },
        {
          title: "Degree Enrollment List",
          href: "/admin/enrollment-management/degree-enrollment-list",
        },
      ]}
    >
      <div>
        <FilterData
          setFilterData={setFilterData}
          setCurrentPage={setCurrentPage}
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap gap-3 items-center justify-between p-6">
            <h1 className="text-lg font-bold leading-6 text-black">
              Degree Enrolment List
            </h1>

            <div className="flex gap-2 flex-wrap ">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              {/* <div className="gap-2 space-y-2 lg:flex lg:space-y-0"> */}
              {selectedRows.size >= 1 && (
                <div className="flex flex-wrap gap-2">
                  <DownloadCSV
                    data={selectApplicant}
                    fileName="degree Enrolment List"
                  />
                  <MigrateStudentModal selectApplicant={selectApplicant} />
                </div>
              )}
              {/* </div> */}
            </div>
          </div>
          <DegreeEnrollmentApplicationList
            setSelectedRows={setSelectedRows}
            selectedRows={selectedRows}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            Data={data?.data}
            isLoading={isLoading}
            setSelectApplicant={setSelectApplicant}
            selectApplicant={selectApplicant}
            pagination={data?.pagination}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default DegreeEnrollmentList;
