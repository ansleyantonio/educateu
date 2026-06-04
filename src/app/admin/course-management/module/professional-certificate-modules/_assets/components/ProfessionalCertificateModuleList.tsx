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
import { ViewProfessionalCertificateModuleModal } from "./view-update/viewProfessionalCertificateModuleModal";
import { DuplicateProfessionalCertificateModal } from "./duplicate/duplicateProfessionalModuleModal";

interface ModuleProps {
  currentPage: number;
  ProfModuleData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}

const ProfCertificateModuleList = ({
  currentPage,
  setCurrentPage,
  ProfModuleData,
  isLoading,
}: ModuleProps) => {
  return (
    <>
      <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4">Module Title</TableHead>
            {/* <TableHead>Awarding Body</TableHead> */}
            <TableHead>Est. Time</TableHead>
            <TableHead>Module Code</TableHead>
            <TableHead>Module Type</TableHead>
            <TableHead className="pr-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : ProfModuleData?.pagination?.count === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            ProfModuleData?.data?.courseModules?.map((ProfModule: any) => (
              <TableRow key={ProfModule.title}>
                <TableCell className="pl-4 text-blue-500 capitalize">
                  <Link
                    href={`professional-certificate-modules/${ProfModule?.title}/${ProfModule?.id}`}
                  >
                    {ProfModule.title}
                  </Link>
                </TableCell>

                {/* <TableCell>{ProfModule.awardingBody}</TableCell> */}
                <TableCell>{ProfModule?.estimatedTimeToComplete} Min</TableCell>
                <TableCell>{ProfModule.code}</TableCell>
                <TableCell>{ProfModule.moduleType}</TableCell>
                <TableCell className="pr-4 max-w-[80px]">
                  <div className="flex flex-wrap gap-2 justify-end items-center">
                    {/* View & Update */}
                    <ViewProfessionalCertificateModuleModal data={ProfModule} />
                    {/*  Download Certificate */}
                    {/* <ActionButton
                      imageSrc={fileDownload}
                      variant="icon"
                      tooltipContent="Download Certificate"
                    /> */}
                    {/*  Duplicate Course */}
                    <DuplicateProfessionalCertificateModal
                      existingModule={ProfModule}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && ProfModuleData?.pagination?.totalPages > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                <CusPagination
                  totalPages={ProfModuleData?.pagination?.totalPages || 1}
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

export default ProfCertificateModuleList;
