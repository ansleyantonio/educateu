/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import AgentPagination from "@/app/(agent-portal)/agent/application-management/_assets/components/page_components/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/border_table";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { fetchAssessmentInvitationsData } from "../../queryClient/queryController";

const AssessmentInvitations = () => {
  const id = usePathname().split("/")[3];
  const params = useSearchParams();

  const auth = useAuths();
  const token = auth?.user?.token;

  const page = params.get("page") || 1;

  const [currentPage, setCurrentPage] = useState(page);

  const { data, isLoading } = useQuery({
    queryKey: ["list-of-notes-data", token, id, currentPage],
    queryFn: fetchAssessmentInvitationsData,
    enabled: !!page,
  });
  console.log(data?.data);

  const formatDateTime = (input?: string) => {
    if (!input) return "";
    const parts = input.match(/\d+/g);
    if (!parts || parts.length < 5) return input;

    const [d, m, y, h, min] = parts.map(Number);
    const date = new Date(y, m - 1, d, h, min);
    return date.toLocaleString();
  };

  return (
    <Table className="relative h-40">
      {/* Pagination */}
      {!isLoading && (
        <TableCaption className="p-4">
          <AgentPagination
            setCurrentPage={setCurrentPage}
            totalPages={data?.pagination?.totalPages}
          />
        </TableCaption>
      )}

      {/* Table Header */}
      <TableHeader className="bg-gray-50">
        <TableRow>
          {/* <TableHead className="flex items-center border-0"> */}
          {/*   Applicant Name */}
          {/* </TableHead> */}
          <TableHead className="border-0">Request Type</TableHead>
          <TableHead className="border-0">Note</TableHead>

          <TableHead className="border-0">Sent By</TableHead>
          <TableHead className="border-0">Date And Time</TableHead>
        </TableRow>
      </TableHeader>

      {/* Table Body */}
      {isLoading ? (
        <div className="absolute top-[50%]  right-[50%] translate-x-[-50%] translate-y-[-50%] mt-5">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : (
        <TableBody className="rounded-b-md">
          {data?.data?.applicationNotes?.length > 0 ? (
            data?.data?.applicationNotes?.map((applicant: any, i: number) => (
              <TableRow key={i}>
                {/* <TableCell className="border-l-0"> */}
                {/*   {applicant?.applicantName} */}
                {/* </TableCell> */}

                <TableCell>{applicant?.type}</TableCell>

                <TableCell>{applicant?.note}</TableCell>
                <TableCell>{applicant?.createdBy}</TableCell>
                <TableCell className="rounded-b-md border-b-0">
                  {formatDateTime(applicant?.createdAt)}
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
      )}
    </Table>
  );
};

export default AssessmentInvitations;
