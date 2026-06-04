/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CPDCourseList from "./_assets/components/CPDCourseList";
import { CreateCPDCourseModal } from "./_assets/components/create/createCPDCourseModal";
import FilterData from "./_assets/components/filterData/FilterData";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";

const CourseCPD = () => {
  const [searchTerm, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState<any>();
  const [limit, setLimit] = useState("10");

  // console.log("filterData", filterData);

  const { data, isLoading } = useFetchData({
    path: `courses/get`,
    method: "POST",
    filterData: {
      ...filterData,
      searchTerm,
      page: currentPage,
      pageSize: limit,
      courseType: "CPD_COURSE",
      limit,
    },
    queryKey: "fetch-cpd-course-list",
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Course Management",
        //   href: "/admin/course-management/course/cpd-course",
        // },
        {
          title: "CPD Course",
        },
      ]}
    >
      <div>
        <FilterData
          isLoading={isLoading}
          setCurrentPage={setCurrentPage}
          setFilterData={setFilterData}
        />

        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <SectionHeader
              title="CPD Courses"
              total={data?.pagination?.total || 0}
              label="Course"
              labels="Courses"
            />

            <div className="flex gap-2 flex-wrap">
              <CustomField.CommonSearch
                searchText={searchTerm}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <CreateCPDCourseModal />
            </div>
          </div>
          {/* courseSessionList */}
          <CPDCourseList
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={data?.pagination}
            isLoading={isLoading}
            data={data?.data?.courses}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default CourseCPD;
