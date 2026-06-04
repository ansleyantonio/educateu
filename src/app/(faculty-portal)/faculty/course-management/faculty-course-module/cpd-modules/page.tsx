"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FilterData from "./_assets/components/filterData/FilterData";
import { CreateCPDModal } from "./_assets/components/modal/CreateCPDModal";
import CPDModuleList from "./_assets/components/view/cpdModuleList";

const CPDModules = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState({});

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin/business-development-management" },
        {
          title: "business management",
          href: "/admin/business-development-management",
        },
        { title: "Agent Settings" },
      ]}
    >
      <div>
        <FilterData
          setFilterData={setFilterData}
          setCurrentPage={setCurrentPage}
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex justify-between items-center p-6">
            <h1 className="text-lg font-bold leading-6 text-[#000000] p">
              CPD Module List
            </h1>
            <div className="lg:flex gap-2 lg:space-y-0 space-y-2 ">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CreateCPDModal />
            </div>
          </div>
          <CPDModuleList
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            CPDModuleData={CPDModulesData}
            isLoading={false}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default CPDModules;

///TODO: Remove This Mock Data
const CPDModulesData = [
  {
    moduleTitle: "Module Title 01",
    moduleCode: "Code-01",
    moduleType: "Degree",
    faculty: "John Doe",
    forumDiscussionBoard: true,
  },
  {
    moduleTitle: "Module Title 02",
    moduleCode: "Code-02",
    moduleType: "Diploma",
    faculty: "John Doe",
    forumDiscussionBoard: true,
  },
  {
    moduleTitle: "Module Title 03",
    moduleCode: "Code-03",
    moduleType: "Diploma",
    faculty: "John Doe",
    forumDiscussionBoard: false,
  },
  {
    moduleTitle: "Module Title D4",
    moduleCode: "Code-04",
    moduleType: "Diploma",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 05",
    moduleCode: "Code-05",
    moduleType: "Diploma",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title D6",
    moduleCode: "Code-06",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 07",
    moduleCode: "Code-07",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 08",
    moduleCode: "Code-08",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title D9",
    moduleCode: "Code-09",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 10",
    moduleCode: "Code-10",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 01",
    moduleCode: "Code-11",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 04",
    moduleCode: "Code-04",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title D6",
    moduleCode: "Code-06",
    moduleType: "Diploma",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title D6",
    moduleCode: "Code-05",
    moduleType: "Diploma",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 08",
    moduleCode: "Code-08",
    moduleType: "Diploma",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 08",
    moduleCode: "Code-08",
    moduleType: "Diploma",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 10",
    moduleCode: "Code-10",
    moduleType: "Degree",
    faculty: "John Doe",
  },
  {
    moduleTitle: "Module Title 10",
    moduleCode: "Code-10",
    moduleType: "Degree",
    faculty: "John Doe",
  },
];
