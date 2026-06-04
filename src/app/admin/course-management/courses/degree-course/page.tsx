"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AdvanceCourseList from "../_assets/components/advanceCourseComponent/AdvanceCourseList";
import { CreateAdvanceCourseModal } from "../_assets/components/advanceCourseComponent/create/createAdvanceCourseModal";
import CourseFilterData from "../_assets/components/advanceCourseComponent/filterData/CourseFilterData";
import { IAdvanceCourseFilterForm } from "../_assets/schemas/advanceFilterFormSchema";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";

const DegreeCourse = () => {
  const [searchTerm, setSearchText] = useState("");
  const [filterData, setFilterData] = useState<IAdvanceCourseFilterForm>();
  const [limit, setLimit] = useState("10");

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: `courses/get`,
    queryKey: "fetch-degree-course-list",
    filterData: {
      ...filterData,
      searchTerm,
      pageSize: limit,
      page: currentPage,
      courseType: "DEGREE_COURSE",
      // advancedCourseType: "DEGREE",
    },
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "degree Course",
          href: "/admin/course-management/course/degree-course",
        },
      ]}
    >
      <div>
        <CourseFilterData
          setCurrentPage={setCurrentPage}
          setFilterData={setFilterData}
          FilterItemName="Degree Course"
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <SectionHeader
              title="Degree Courses"
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
              <CreateAdvanceCourseModal courseType="DEGREE" />
            </div>
          </div>
          {/* courseSessionList */}
          <AdvanceCourseList
            data={data}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            isLoading={isLoading}
            redirectUrlPath="degree-course"
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default DegreeCourse;
