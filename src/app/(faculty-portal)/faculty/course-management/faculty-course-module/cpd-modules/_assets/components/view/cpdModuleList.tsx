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
import { UpdateCPD_Module } from "../modal/updateCPD_Modal";
import { ViewCPD_Modal } from "../modal/viewAdvanceModal";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";

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
          ) : CPDModuleData.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            CPDModuleData.map((cpdModule: any) => (
              <TableRow key={cpdModule.moduleTitle}>
                <TableCell className="pl-4 capitalize ">
                  {cpdModule.moduleTitle}
                </TableCell>
                <TableCell>{cpdModule.moduleCode}</TableCell>
                <TableCell>{cpdModule.moduleType}</TableCell>
                <TableCell>{cpdModule.faculty}</TableCell>
                <TableCell className="pr-4 max-w-[80px]">
                  <div className="flex gap-x-2 justify-end items-center">
                    <UpdateCPD_Module data={cpdModule} />
                    <ViewCPD_Modal data={cpdModule} />
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

        {isLoading === false && CPDModuleData?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <CusPagination
                  totalPages={CPDModuleData?.length || 1}
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

export default CPDModuleList;
