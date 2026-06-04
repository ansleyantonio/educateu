"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/table";
import Pagination from "@/utils/pagination";
import { StatusPoint } from "@/utils/status_point";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DataTableToolbar } from "./data-table-toolbar";
import { applicants, IFilterLists, interviewData } from "./data_type";
import image from "/public/assets/logo/dashboard_management/image.png";

export function InterviewTable() {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  //Search and Filter
  const [search, setSearch] = useState("");
  const [filterLists, setFilterLists] = useState<
    Partial<IFilterLists> | undefined
  >(undefined);

  // Function to toggle the selection of particular rows
  const toggleRowSelection = (id: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  // Function to toggle the selection of all rows
  const toggleSelectAll = () => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.size === applicants.length
        ? new Set()
        : new Set(applicants.map((applicant) => applicant.id))
    );
  };

  const isRowSelected = (id: string) => selectedRows.has(id);

  return (
    <Card>
      <DataTableToolbar
        dataLength={applicants.length}
        search={search}
        setSearch={setSearch}
        filterLists={filterLists}
        setFilterLists={setFilterLists}
      />

      <Table>
        <TableCaption className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={15}
            onPageChange={(page) => setCurrentPage(page)}
            position="between"
          />
        </TableCaption>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-4">
              <input
                type="checkbox"
                checked={selectedRows.size === applicants.length}
                onChange={toggleSelectAll}
                aria-label="Select all applicants"
                className="mt-1 ml-5 w-4 h-4"
              />
            </TableHead>
            <TableHead>Applicant</TableHead>
            <TableHead>Applicaation ID</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Pre-Screening</TableHead>
            <TableHead>Interview Status</TableHead>
            <TableHead>Application Status</TableHead>
            <TableHead>Applilcation Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviewData.map((applicant) => (
            <TableRow
              key={applicant.applicantId}
              className={`${
                isRowSelected(applicant.applicantId)
                  ? "bg-blue-50"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={isRowSelected(applicant.applicantId)}
                  onChange={() => toggleRowSelection(applicant.applicantId)}
                  aria-label={`Select applicant ${applicant.applicantName}`}
                  className="mt-1 ml-5 w-4 h-4"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-3 items-center">
                  <Image
                    src={image}
                    alt="Applicant Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <Link
                    href={`/admission/applicants/${applicant.applicantId}/profile`}
                  >
                    <p className="font-semibold">{applicant.applicantName}</p>
                    <p className="text-xs text-gray-500">
                      @
                      {applicant.applicantName.toLowerCase().replace(/\s/g, "")}
                    </p>
                  </Link>
                </div>
              </TableCell>
              <TableCell>{applicant.applicantId}</TableCell>
              <TableCell>{applicant.courseProgramme}</TableCell>
              <TableCell>{applicant.preScreening}</TableCell>
              <TableCell>
                <div className="flex gap-1 items-center px-2 rounded-lg border w-fit border-[#D0D5DD]">
                  <StatusPoint status={applicant.interviewStatus} />
                  <p>{applicant.interviewStatus}</p>
                </div>{" "}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 items-center px-2 rounded-lg border w-fit border-[#D0D5DD]">
                  <StatusPoint status={applicant.interviewStatus} />
                  <p>{applicant.applicationStatus}</p>
                </div>{" "}
              </TableCell>
              <TableCell>
                {" "}
                <div className="flex gap-1 items-center px-2 rounded-lg border w-fit border-[#D0D5DD]">
                  <StatusPoint status={applicant.interviewStatus} />
                  <p>{applicant.applicationProgress}</p>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
