"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ModuleList from "../_assets/components/advanceModuleComponent/AdvanceModuleList";
import { CreateModuleModal } from "../_assets/components/advanceModuleComponent/create/CreateModal";
import ModuleFilterData from "../_assets/components/advanceModuleComponent/filterData/ModueFilterData";
import { IFilterAdvanceModuleForm } from "../_assets/schemas/module/advanceModuleSchema";

const DiplomaModules = () => {
  const [searchTerm, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState<IFilterAdvanceModuleForm>({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: "course-modules/get",
    filterData: {
      ...filterData,
      courseType: "DIPLOMA_COURSE",
      moduleType: "DIPLOMA",
      page: currentPage,
      pageSize: limit,
      searchTerm,
    },
    queryKey: "fetch-diploma-module-list",
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Diploma Module",
        },
      ]}
    >
      <ModuleFilterData
        FilterItemName="Filter diploma Module"
        setCurrentPage={setCurrentPage}
        setFilterData={setFilterData}
      />

      <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
        <div className="flex flex-wrap justify-between items-center p-6 gap-2">
          <h1 className="text-lg font-bold leading-6 text-black">
            Diploma Module List
          </h1>
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
            <CreateModuleModal moduleType="diploma" />
          </div>
        </div>
        <ModuleList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          AdvanceModulesData={data}
          isLoading={isLoading}
          redirectUrlPath="diploma-modules"
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default DiplomaModules;
