"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreateProfCertificateModuleModal } from "./_assets/components/create/CreateProfCertificateModuleModal";
import FilterData from "./_assets/components/filterData/FilterData";
import ProfCertificateModuleList from "./_assets/components/ProfessionalCertificateModuleList";
import { IFilterProfCertModuleForm } from "./_assets/schemas/moduleSchema";

const ProfCertificateModules = () => {
  const [searchTerm, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState<IFilterProfCertModuleForm>({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: "course-modules/get",
    filterData: {
      ...filterData,
      searchTerm,
      courseType: "PROFESSIONAL_COURSE",
      page: currentPage,
      pageSize: limit,
    },
    queryKey: "fetch-professional-module-list",
  });

  return (
    <div>
      <PageWithBreadcrumb
        items={[
          { title: "Home", href: "/admin" },
          {
            title: "Professional Certificate Modules",
          },
        ]}
      >
        <FilterData
          isLoading={isLoading}
          setCurrentPage={setCurrentPage}
          setFilterData={setFilterData}
        />

        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <h1 className="text-lg font-bold leading-6 text-black">
              Professional Certificate Module List
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
              <CreateProfCertificateModuleModal />
            </div>
          </div>
          <ProfCertificateModuleList
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            ProfModuleData={data}
            isLoading={isLoading}
          />
        </div>
      </PageWithBreadcrumb>
    </div>
  );
};

export default ProfCertificateModules;
