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
import archive from "/public/assets/icons/archive.svg";
import publish from "/public/assets/icons/publish.svg";
import unpublish from "/public/assets/icons/un_publish.svg";

import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import { UpdateProfessionalCertificateModuleModal } from "../modal/UpdateProfessionalCertificateModuleModal";
import { ViewProfessionalCertificateModuleModal } from "../modal/ViewProfessionalCertificateModuleModal";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";
import { Button } from "@/components/ui/custom_ui/button";
import Link from "next/link";

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
          ) : ProfModuleData.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            ProfModuleData.map((ProfModule: any) => (
              <TableRow key={ProfModule.moduleTitle}>
                <TableCell className="pl-4 capitalize">
                  <Link
                    href={`professional-certificate-modules/${ProfModule?.moduleTitle}`}
                  >
                    {ProfModule.moduleTitle}
                  </Link>
                </TableCell>
                <TableCell>{ProfModule.moduleCode}</TableCell>
                <TableCell>{ProfModule.moduleType}</TableCell>
                <TableCell>{ProfModule.faculty}</TableCell>
                <TableCell className="pr-4 max-w-[80px]">
                  <div className="flex flex-wrap gap-2 justify-end items-center">
                    <UpdateProfessionalCertificateModuleModal
                      data={ProfModule}
                    />

                    <ViewProfessionalCertificateModuleModal data={ProfModule} />
                    {/* Publish */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:border-blue-700 border-[#E1E5E7]"
                      // onClick={() => {
                      //   setIsPublishModalOpen(true);
                      //   setSelectedCourse(item);
                      // }}
                    >
                      <Image
                        src={publish}
                        alt="Publish"
                        width={18}
                        height={18}
                      />
                    </Button>

                    {/* Unpublish */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:border-blue-700 border-[#E1E5E7]"
                    >
                      <Image
                        src={unpublish}
                        alt="Unpublish"
                        width={18}
                        height={18}
                      />
                    </Button>

                    {/* Archive */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:border-blue-700 border-[#E1E5E7]"
                    >
                      <Image
                        src={archive}
                        alt="Archive"
                        width={18}
                        height={18}
                      />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:border-blue-700 border-[#E1E5E7]"
                    >
                      <Image
                        src={fileDownload}
                        alt="download"
                        width={18}
                        height={18}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && ProfModuleData?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <CusPagination
                  totalPages={ProfModuleData?.length || 1}
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
