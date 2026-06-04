/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/border_table";
import Image from "next/image";
import image from "/public/assets/logo/dashboard_management/image.png";

// Define the type for applicant data
interface Applicant {
  id: string;
  userName: string;
  applyDate: string;
  interviewerName: string;
  interviewDate: string;
}

interface InvitationTableProps {
  data: Applicant[];
}

const InvitationTable: React.FC<InvitationTableProps> = ({ data }) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRowSelection = (id: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      (prevSelectedRows) =>
        prevSelectedRows.size === data.length
          ? new Set() // Deselect all if all are selected
          : new Set(data.map((item) => item.id)), // Select all if not all are selected
    );
  };

  const isRowSelected = (id: string) => selectedRows.has(id);

  return (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="flex items-center border-l-0">
            <input
              type="checkbox"
              checked={selectedRows.size === data.length}
              onChange={toggleSelectAll}
              aria-label="Select all applicants"
              className="mr-2 ml-5 w-4 h-4"
            />
            Applicant Name
          </TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Agent Name</TableHead>
          <TableHead className="border-r-0">Interview Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="rounded-b-md">
        {data.length > 0 ? (
          data.map((applicant) => (
            <TableRow
              key={applicant.id}
              className={`${
                isRowSelected(applicant.id)
                  ? "bg-blue-50"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <TableCell className="border-l-0">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={isRowSelected(applicant.id)}
                    onChange={() => toggleRowSelection(applicant.id)}
                    aria-label={`Select applicant ${applicant.userName}`}
                    className="mt-1 ml-5 w-4 h-4"
                  />
                  <Image
                    src={image}
                    alt="Applicant Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold">{applicant.userName}</p>
                </div>
              </TableCell>

              <TableCell>{applicant.applyDate}</TableCell>
              <TableCell>{applicant.interviewerName}</TableCell>
              <TableCell className="rounded-b-md border-b-0">
                {applicant.interviewDate}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="py-4 text-center">
              No data available.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InvitationTable;
