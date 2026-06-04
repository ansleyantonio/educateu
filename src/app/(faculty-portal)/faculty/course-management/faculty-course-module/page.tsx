"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useAuths } from "@/hooks/userContext";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ModuleFilterData from "./_assets/components/module/filterData/ModueFilterData";
import ModuleList from "./_assets/components/module/view/ModuleList";
import { IFilterModuleForm } from "./_assets/schemas/moduleSchema";

const CreateModule = () => {
  const [searchTerm, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState<IFilterModuleForm>({});
  const [limit, setLimit] = useState("10");

  const user = useAuths();
  const id = user?.user?.userId;

  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `faculty/courses-modules/${id}`,
    filterData: {
      // ...filterData,
      // courseType: "MODULE_COURSE",
      // moduleType: "DEGREE",
      page: currentPage,
      pageSize: limit,
      name: searchTerm,
    },
    queryKey: "fetch-degree-module-list",
  });
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/faculty" },
        {
          title: "Course-Management",
          href: "/faculty/course-management/module",
        },
        { title: "Module" },
      ]}
    >
      <ModuleFilterData
        FilterItemName="Filter Module"
        setCurrentPage={setCurrentPage}
        setFilterData={setFilterData}
      />

      <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
        <div className="flex justify-between items-center p-6">
          <h1 className="text-lg font-bold leading-6 text-[#000000] p">
            Module List
          </h1>
          <div className="gap-2 space-y-2 lg:flex lg:space-y-0">
            <CustomField.CommonSearch
              searchText={searchTerm}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField
              totalItems={data?.pagination?.total}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
            {/* <CreateModal moduleType="degree" /> */}
          </div>
        </div>
        <ModuleList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          modulesData={data}
          isLoading={isLoading}
          redirectUrlPath="modules"
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default CreateModule;
