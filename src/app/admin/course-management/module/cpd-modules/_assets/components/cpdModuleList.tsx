/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import Link from "next/link";
import { DuplicateCPDModuleModal } from "./duplicate/duplicateCPDModuleModal";
import { ViewCPDModuleModal } from "./view-update/viewCPDModuleModal";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";

interface ModuleProps {
  currentPage: number;
  CPDModuleData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}

const CPDModuleList = ({
  currentPage,
  setCurrentPage,
  CPDModuleData,
  isLoading,
}: ModuleProps) => {
  // Prepare pagination data
  const paginationData = {
    page: currentPage,
    total: CPDModuleData?.pagination?.total || 0,
    totalPages: CPDModuleData?.pagination?.totalPages || 1,
  };

  return (
    <DynamicTableWithPagination
      data={CPDModuleData?.data?.courseModules || []}
      isLoading={isLoading}
      pagination={paginationData}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      config={{
        columns: [
          {
            key: "title",
            header: "Module Title",
            className: "pl-4 text-blue-500 capitalize",
            render: (cpdModule: any) => (
              <Link href={`cpd-modules/${cpdModule?.title}/${cpdModule?.id}`}>
                {cpdModule.title}
              </Link>
            ),
          },
          {
            key: "estimatedTimeToComplete",
            header: "Est. Time",
            render: (cpdModule: any) => `${cpdModule?.estimatedTimeToComplete} Min`,
          },
          {
            key: "code",
            header: "Module Code",
          },
          {
            key: "moduleType",
            header: "Module Type",
          },
          {
            key: "actions",
            header: "Action",
            className: "pr-4 text-right",
            render: (cpdModule: any) => (
              <ResponsiveButtonGroup>
                {/* View & Update */}
                <ViewCPDModuleModal data={cpdModule} />
                {/* Duplicate Course */}
                <DuplicateCPDModuleModal existingModule={cpdModule} />
              </ResponsiveButtonGroup>
            ),
          },
        ],
      }}
    />
  );
};

export default CPDModuleList;