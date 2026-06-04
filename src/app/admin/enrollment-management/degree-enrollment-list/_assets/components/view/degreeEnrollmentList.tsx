/* eslint-disable prefer-const */
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
import { Checkbox } from "@/components/ui/checkbox";
import { TruncateText } from "@/utils/TruncateText";
import { AnimatePresence, motion } from "framer-motion";
interface PaginationMeta {
  count: number; // Number of items in the current page
  total: number; // Total number of items across all pages
  page: number; // Current page number
  perPage: number; // Number of items per page
  totalPages: number; // Total number of pages
}

interface ModuleProps {
  currentPage: number;
  Data: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedRows?: Set<string>;
  setSelectApplicant?: any;
  selectApplicant: any;
  pagination: PaginationMeta;
}
const DegreeEnrollmentApplicationList = ({
  currentPage,
  setCurrentPage,
  Data,
  isLoading,
  selectedRows = new Set<string>(),
  setSelectedRows = () => {},
  setSelectApplicant,
  selectApplicant = [],
  pagination,
}: ModuleProps) => {
  const isAllSelected =
    Data?.length > 0 && Data?.every((user: any) => selectedRows.has(user.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows(new Set());
      setSelectApplicant?.([]);
    } else {
      const allIds = new Set<string>(Data.map((user: any) => user.id)); //
      setSelectedRows(allIds);

      setSelectedRows(allIds);
      setSelectApplicant?.(Data);
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="pl-4 mb-4 text-sm text-gray-500"
          >
            Selected Applicants: {selectedRows.size}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Table Header */}
      <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-6 w-[30px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="pl-4">Application</TableHead>
            <TableHead>Awarding Body</TableHead>
            <TableHead>Year of Entry</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Finance</TableHead>
            {/* <TableHead>Module </TableHead> */}
            <TableHead>Finance Check</TableHead>
            <TableHead>Academic Session</TableHead>
            <TableHead>Offer of Acceptance </TableHead>
            <TableHead>Migration Status </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : Data?.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            Data?.map((applicant: any, index: number) => (
              <TableRow key={index}>
                {/* <Checkbox /> */}
                <TableCell className="py-5 pl-6 w-[30px]">
                  <Checkbox
                    checked={selectedRows.has(applicant.id)}
                    onCheckedChange={(checked) => {
                      const updated = new Set(selectedRows);
                      const updatedApplicants = new Set(
                        selectApplicant?.map((a: any) => a.id),
                      );
                      let newSelectedApplicants = [...selectApplicant];

                      if (checked) {
                        updated.add(applicant.id);
                        if (!updatedApplicants.has(applicant.id)) {
                          newSelectedApplicants.push(applicant);
                        }
                      } else {
                        updated.delete(applicant.id);
                        newSelectedApplicants = newSelectedApplicants.filter(
                          (item) => item.id !== applicant.id,
                        );
                      }

                      setSelectedRows(updated);
                      setSelectApplicant?.(newSelectedApplicants);
                    }}
                  />
                </TableCell>
                <TableCell className="pl-4 capitalize">
                  <TruncateText text={applicant?.fullName} />
                  {/* <ApplicantINfo user={applicant} /> */}
                </TableCell>
                <TableCell>
                  <TruncateText text={applicant?.awardingBody} />
                </TableCell>
                <TableCell>{applicant.yearOfEntry}</TableCell>
                <TableCell>
                  <TruncateText text={applicant?.course} />
                </TableCell>
                <TableCell>{applicant.finance}</TableCell>
                {/* <TableCell>{applicant.module}</TableCell> */}
                <TableCell>{applicant.financeStatus}</TableCell>
                <TableCell>{applicant.academicSession}</TableCell>
                <TableCell className="my-auto text-center">
                  {applicant.offerOfAcceptance}
                </TableCell>
                <TableCell>
                  <button
                    className={`px-3  rounded-full font-semibold shadow-sm ${
                      applicant?.migrationStatus == true &&
                      "bg-green-400 text-white"
                    }`}
                  >
                    {applicant.migrationStatus == true ? "Enrolled" : "Active"}
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && Data?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                <CusPagination
                  totalPages={pagination?.totalPages || 1}
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

export default DegreeEnrollmentApplicationList;
