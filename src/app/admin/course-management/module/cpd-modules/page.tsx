"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CPDModuleList from "./_assets/components/cpdModuleList";
import { CreateCPDModal } from "./_assets/components/create/CreateCPDModal";
import FilterData from "./_assets/components/filterData/FilterData";
import { IFilterCPdModuleForm } from "./_assets/schemas/moduleSchema";

const CPDModules = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState<IFilterCPdModuleForm>({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: "course-modules/get",
    filterData: {
      ...filterData,
      pageSize: limit,
      courseType: "CPD_COURSE",
      page: currentPage,
    },
    queryKey: "fetch-cpd-module-list",
  });

  return (
    <div>
      <PageWithBreadcrumb
        items={[
          // {
          //   title: "Course Management",
          //   href: "/admin/course-management/session/course-session",
          // },
          { title: "Home", href: "/admin" },
          {
            title: "CPD Modules",
          },
        ]}
      >
        <FilterData
          isLoading={isLoading}
          setFilterData={setFilterData}
          setCurrentPage={setCurrentPage}
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <h1 className="text-lg font-bold leading-6 text-black">
              CPD Module List
            </h1>
            <div className="flex gap-2 flex-wrap">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <CreateCPDModal />
            </div>
          </div>
          <CPDModuleList
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            CPDModuleData={data}
            isLoading={isLoading}
          />
        </div>
      </PageWithBreadcrumb>
    </div>
  );
};

export default CPDModules;
