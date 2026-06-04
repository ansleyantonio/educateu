/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface ModuleProps {
  ProfModuleData?: any;
  // currentPage?: number;
  // setCurrentPage?: (data: number) => void;
  isLoading?: boolean;
}

export const CourseConnectedTab = ({
  // currentPage,
  // setCurrentPage,
  ProfModuleData,
  isLoading,
}: ModuleProps) => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  return (
    <div>
      <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="border-l bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4 border-r">Module Title</TableHead>
            <TableHead className="border-r">Module Code</TableHead>
            <TableHead className="border-r">Course</TableHead>
            <TableHead className="pr-4">Faculty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative border-l">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : CPDModulesData?.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            CPDModulesData.map((ProfModule: any) => (
              <TableRow key={ProfModule.moduleTitle}>
                <TableCell className="pl-4 capitalize border-r">
                  <Link
                    href={`professional-certificate-modules/${ProfModule?.moduleTitle}`}
                  >
                    {ProfModule.moduleTitle}
                  </Link>
                </TableCell>
                <TableCell className="border-r">
                  {ProfModule.moduleCode}
                </TableCell>
                <TableCell className="border-r">
                  {ProfModule.moduleType}
                </TableCell>
                <TableCell>
                  <span className="text-blue-600">{ProfModule.faculty}</span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {CPDModulesData?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center border-b border-l">
                <CusPagination
                  totalPages={CPDModulesData?.length || 1}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

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
