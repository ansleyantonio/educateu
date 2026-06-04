/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo } from "react";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import FilterData from "./_assets/components/filterData/FilterData";
import LessonList from "./_assets/components/LessonList";
import { CreateLessonModal } from "./_assets/components/modal/CreateLessonModal";

const LessonModules = () => {
  const [searchText, setSearchText] = useState("");
  const [filterData, setFilterData] = useState<any>();
  const [limit, setLimit] = useState("10");

  const [currentPage, setCurrentPage] = useState<number>(1);

  const filters = useMemo(
    () => ({
      page: currentPage,
      pageSize: limit,
      searchTerm: searchText,
      ...filterData,
    }),
    [currentPage, limit, searchText, filterData]
  );

  const { data, isLoading } = useFetchData({
    path: `lessons/get`,
    method: "POST",
    queryKey: "fetch-list-of-course-lessons",
    filterData: filters,
  });

  // const serverPage = pagination.page;

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Lesson",
          href: "/admin/course-management/lesson",
        },
        // { title: "Lesson",
        // },
      ]}
    >
      <div>
        <FilterData
          isLoading={isLoading}
          setFilterData={setFilterData}
          setCurrentPage={setCurrentPage}
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <SectionHeader
              title="Lesson List"
              total={data?.pagination?.total || 0}
              label="Lesson"
              labels="Lessons"
            />
            <div className="flex gap-2 flex-wrap items-center">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <CreateLessonModal />
            </div>
          </div>
          <LessonList
            totalPages={data?.pagination.totalPages || 1}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            lessonData={data?.data?.lessons || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default LessonModules;
