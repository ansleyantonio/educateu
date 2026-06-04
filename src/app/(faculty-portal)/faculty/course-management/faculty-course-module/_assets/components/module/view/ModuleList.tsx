/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import dateFormat from "@/utils/DateFormatter";
import { TruncateText } from "@/utils/TruncateText";
import Link from "next/link";

interface ModuleProps {
  currentPage: number;
  modulesData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
  redirectUrlPath?: string;
}
const ModuleList = ({
  redirectUrlPath,
  currentPage,
  setCurrentPage,
  modulesData,
  isLoading,
}: ModuleProps) => {
  // console.log("modulesData", modulesData.data);
  return (
    <>
      <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4">Module Title</TableHead>
            <TableHead>Module Code</TableHead>
            <TableHead>Module Type</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Course Start & End Date</TableHead>
            <TableHead className="pr-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : modulesData?.data.length <= 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            modulesData?.data?.map((advModule: any) => (
              <TableRow key={advModule.moduleName}>
                <TableCell className="pl-4 text-blue-500 capitalize">
                  <Link href={`faculty-course-module/${advModule?.moduleId}`}>
                    <TruncateText text={advModule.moduleName} />
                  </Link>
                  {/* <Link
                    href={`${redirectUrlPath}/${advModule?.title}/${advModule?.id}`}
                  >
                    {advModule.moduleName}
                  </Link> */}
                </TableCell>
                <TableCell>{advModule?.moduleCode}</TableCell>
                <TableCell>{advModule?.moduleType}</TableCell>
                <TableCell>{advModule?.courseName}</TableCell>
                <TableCell>
                  {dateFormat.customFormatDate(advModule.startDate)} -{" "}
                  {dateFormat.customFormatDate(advModule.endDate)}
                </TableCell>

                <TableCell className="pr-4 max-w-[80px]">
                  <div className="flex flex-wrap gap-2 justify-end">
                    {/* View & Update */}
                    {/* <ViewAdvanceModal data={advModule} /> */}

                    {/* Duplicate Module */}
                    {/* <DuplicateAdvanceModuleModal existingCourse={advModule} /> */}

                    {/* Download Module */}
                    {/* <ActionButton
                      imageSrc={fileDownload}
                      tooltipContent="Download Module"
                      variant="icon"
                    /> */}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && modulesData?.pagination?.totalPages > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <CusPagination
                  totalPages={modulesData?.length || 1}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </>
  );
};

export default ModuleList;
