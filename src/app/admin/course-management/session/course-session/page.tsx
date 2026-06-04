"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import CommonSearch from "@/components/common/search/commonSearch";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CourseSessionList from "./_assets/components/CourseSessionList";
import { CreateSession } from "./_assets/components/create/createSessionModal";
import SessionFilterData from "./_assets/components/filterData/FilterData";
import { IFilterSessionForm } from "./_assets/schemas/FilterSessionSchema";

const CourseSessionManagement = () => {
  const [filterData, setFilterData] = useState<IFilterSessionForm>({});
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    path: `session`,
    method: "GET",
    queryKey: "fetch-session-list",
    filterData: {
      ...filterData,
      page: currentPage,
      search: searchText,
      pageSize: limit,
    },
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Course Session",
        },
      ]}
    >
      <div>
        <SessionFilterData
          isLoading={isLoading}
          setFilterData={setFilterData}
          setCurrentPage={setCurrentPage}
        />

        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center gap-2 p-6">
            <div className="flex gap-2 justify-start items-center basis-1/4">
              <h1 className="text-lg font-bold leading-6 text-black">
                Create Session
              </h1>
              <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full text-nowrap">
                {data?.pagination?.total === 1
                  ? "1 Session"
                  : `${data?.pagination?.total} Sessions`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <CreateSession setSearchText={setSearchText} />
            </div>
          </div>
          <CourseSessionList
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

export default CourseSessionManagement;
