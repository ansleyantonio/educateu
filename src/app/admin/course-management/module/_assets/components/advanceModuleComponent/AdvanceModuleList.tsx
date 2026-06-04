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
import Link from "next/link";
import DuplicateAdvanceModuleModal from "./duplicate/DuplicateCourseModal";
import { View_UpdateModal } from "./view_update/viewAdvanceModal";

interface ModuleProps {
  currentPage: number;
  AdvanceModulesData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
  redirectUrlPath?: string;
}
const ModuleList = ({
  redirectUrlPath,
  currentPage,
  setCurrentPage,
  AdvanceModulesData,
  isLoading,
}: ModuleProps) => {
  return (
    <>
      <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4">Module Title</TableHead>
            <TableHead>Awarding Body</TableHead>
            <TableHead>Module Code</TableHead>
            <TableHead>Credit</TableHead>
            {/* <TableHead>Module Type</TableHead> */}
            {/* <TableHead>Faculty</TableHead> */}
            <TableHead className="pr-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : AdvanceModulesData?.pagination?.count === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            AdvanceModulesData?.data?.courseModules?.map((advModule: any) => (
              <TableRow key={advModule?.id}>
                <TableCell className="pl-4 text-blue-500 capitalize">
                  <Link
                    href={`${redirectUrlPath}/${advModule?.title}/${advModule?.id}`}
                  >
                    {advModule.title}
                  </Link>
                </TableCell>
                <TableCell>{advModule?.awardingBody?.name}</TableCell>

                <TableCell>{advModule?.code}</TableCell>
                <TableCell>{advModule?.credit}</TableCell>
                {/* <TableCell>{advModule.moduleType}</TableCell> */}
                {/* <TableCell>{advModule.faculty}</TableCell> */}
                <TableCell className="pr-4 max-w-[80px]">
                  <div className="flex flex-wrap gap-2 justify-end">
                    {/* View & Update */}
                    <View_UpdateModal data={advModule} />

                    {/* Duplicate Module */}
                    <DuplicateAdvanceModuleModal existingCourse={advModule} />

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

        {isLoading === false &&
          AdvanceModulesData?.pagination?.totalPages > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <CusPagination
                    totalPages={AdvanceModulesData?.pagination?.totalPages || 1}
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
