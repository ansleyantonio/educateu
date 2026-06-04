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
import Image from "next/image";

import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import { UpdateAdvanceModule } from "../modal/updateAdvanceModal";
import { ViewAdvanceModal } from "../modal/viewAdvanceModal";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";

interface ModuleProps {
  currentPage: number;
  AdvanceModulesData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}
const AdvanceModuleList = ({
  currentPage,
  setCurrentPage,
  AdvanceModulesData,
  isLoading,
}: ModuleProps) => {
  return (
    <>
      <Table className="border-r border-t border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4">Module Title</TableHead>
            <TableHead>Module Code</TableHead>
            <TableHead>Module Type</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead className="pr-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : AdvanceModulesData.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            AdvanceModulesData.map((advModule: any) => (
              <TableRow key={advModule.moduleTitle}>
                <TableCell className="pl-4 capitalize ">
                  {advModule.moduleTitle}
                </TableCell>
                <TableCell>{advModule.moduleCode}</TableCell>
                <TableCell>{advModule.moduleType}</TableCell>
                <TableCell>{advModule.faculty}</TableCell>
                <TableCell className="pr-4 max-w-[80px]">
                  <div className="flex gap-x-2 justify-end items-center">
                    <UpdateAdvanceModule data={advModule} />
                    <ViewAdvanceModal data={advModule} />
                    <div className="py-2 px-3 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer hover:border-blue-700 active:scale-95 border-[#E1E5E7]">
                      <Image
                        src={fileDownload}
                        alt="download"
                        width={17}
                        height={17}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && AdvanceModulesData?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <CusPagination
                  totalPages={AdvanceModulesData?.length || 1}
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

export default AdvanceModuleList;
