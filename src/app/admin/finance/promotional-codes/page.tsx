"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreatePromotionalCodeModal } from "./_assets/components/modal/CreatePromotionalcodeModal";
import PromotionalCodeList from "./_assets/components/view/AdvanceModuleList";

const PromotionalCodePage = () => {
  const [searchTerm, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  // const [filterData, setFilterData] = useState<IFilterAdvanceModuleForm>({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    queryKey: "fetch-promotional-code-list",
    method: "GET",
    path: "promotional-codes/promotional-codes",
    filterData: {
      // ...filterData,
      page: currentPage,
      limit: limit,
      search: searchTerm,
    },
  });

  // console.log("fetch-promotional-code-list", data);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Promotional Codes",
        },
      ]}
    >
      {/* <ModuleFilterData
        FilterItemName="Filter Degree Module"
        setCurrentPage={setCurrentPage}
        setFilterData={setFilterData}
      /> */}

      <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
        <div className="flex justify-between items-center p-6 -pl-4">
          <h1 className="text-lg font-bold leading-6 text-[#000000] p">
            Promotional Codes
          </h1>
          <div className="gap-2 space-y-2 lg:flex lg:space-y-0">
            <CustomField.CommonSearch
              searchText={searchTerm}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField
              totalItems={data?.data?.pagination?.total}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
            <CreatePromotionalCodeModal />
          </div>
        </div>
        <PromotionalCodeList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          PromotionalCodeData={data}
          isLoading={isLoading}
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default PromotionalCodePage;
