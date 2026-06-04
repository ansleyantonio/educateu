/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
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
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface ModuleProps {
  ProfModuleData?: any;
  id: string;
  // currentPage?: number;
  // setCurrentPage?: (data: number) => void;
}

export const CourseConnectedTab = ({
  // currentPage,
  // setCurrentPage,
  ProfModuleData,
  id,
}: ModuleProps) => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const { data, isLoading } = useFetchData({
    path: `course-modules/${id}/connected-courses`,
    queryKey: "fetch-advanced-module-course-connect",
  });

  // console.log("data course connected", data?.data.connectedCourses);
  return (
    <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
      <TableHeader className="border-l bg-[#F5F7F9]">
        <TableRow>
          <TableHead className="pl-4 border-r">Course Title</TableHead>
          <TableHead className="border-r">Course Code</TableHead>
          <TableHead className="border-r">status</TableHead>
          <TableHead className="pr-4">Course Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="relative border-l">
        {isLoading ? (
          <div className="min-h-[250px]">
            <DataLoader />
          </div>
        ) : data?.data?.connectedCourses?.length === 0 ? (
          <div className="min-h-[250px]">
            <NoDataComponent />
          </div>
        ) : (
          data?.data?.connectedCourses.map((ProfModule: any) => (
            <TableRow key={ProfModule.moduleTitle}>
              <TableCell className="pl-4 capitalize border-r">
                {ProfModule.title}
              </TableCell>
              <TableCell className="border-r">{ProfModule.code}</TableCell>
              <TableCell className="border-r">{ProfModule.status}</TableCell>
              <TableCell>
                <span className="text-blue-600">{ProfModule.courseType}</span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>

      {data?.data?.connectedCourses?.length > 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-center border-b border-l">
              <CusPagination
                totalPages={data.pagination?.totalPages || 1}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
};
