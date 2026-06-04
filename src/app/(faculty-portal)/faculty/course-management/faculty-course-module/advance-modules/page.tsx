"use client";

import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FilterData from "./_assets/components/filterData/FilterData";
import { CreateAdvanceModal } from "./_assets/components/modal/CreateAdvanceModal";
import AdvanceModuleList from "./_assets/components/view/AdvanceModuleList";
const AdvanceModules = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState({});

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/faculty/course-management/" },
        { title: "Course-Managemnet", href: "/faculty/course-management/" },
        { title: "Module", href: "/faculty/course-management/module" },
        { title: "Advance Modules" },
      ]}
    >
      <div>
        <FilterData
          setCurrentPage={setCurrentPage}
          setFilterData={setFilterData}
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex justify-between items-center p-6">
            <h1 className="text-lg font-bold leading-6 text-[#000000] p">
              Advanced Module List
            </h1>
            <div className="lg:flex gap-2 lg:space-y-0 space-y-2 ">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CreateAdvanceModal />
            </div>
          </div>
          <AdvanceModuleList
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            AdvanceModulesData={AdvanceModulesData}
            isLoading={false}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AdvanceModules;

///TODO: Remove This Mock Data
const AdvanceModulesData = [
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
