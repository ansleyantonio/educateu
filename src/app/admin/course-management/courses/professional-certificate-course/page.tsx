/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CommonSearch from "@/components/common/fields/assets/components/commonSearch";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreateProfessionalCourseModal } from "./_assets/components/create/createProfessionalCourseModal";
import FilterData from "./_assets/components/filterData/FilterData";
import ProfessionalCertificateCourseList from "./_assets/components/ProfessionalCerificateCourseList";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";

const ProfessionalCourse = () => {
  const [searchTerm, setSearchText] = useState("");
  const [filterData, setFilterData] = useState<any>();
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: `courses/get`,
    queryKey: "fetch-professional-course-list",
    filterData: {
      ...filterData,
      searchTerm,
      page: currentPage,
      pageSize: limit,
      courseType: "PROFESSIONAL_COURSE",
    },
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Professional-Certificate-Course",
          href: "/admin/course-management/course/professional-certificate-course",
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
          <div className="flex flex-wrap justify-between items-center py-6 px-2 gap-2">
            <SectionHeader
              title="Professional Certificate Course"
              total={data?.pagination?.total || 0}
              label="Course"
              labels="Courses"
            />

            <div className="flex gap-2 flex-wrap">
              <CommonSearch
                width="50px"
                setSearchText={setSearchText}
                searchText={searchTerm}
              />
              <CustomField.LimitField
                totalItems={data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <CreateProfessionalCourseModal />
            </div>
          </div>
          {/* courseSessionList */}
          <ProfessionalCertificateCourseList
            data={data}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ProfessionalCourse;
