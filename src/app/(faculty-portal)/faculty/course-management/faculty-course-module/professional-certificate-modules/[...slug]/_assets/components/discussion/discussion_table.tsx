"use client";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/border_table";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";

export const DiscussionTable = () => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-t bg-[#F5F7F9] border-[#EAEDF0]">
            <TableHead className="pl-4">Student Name</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Enrolled At</TableHead>
            <TableHead className="text-left">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((data, i) => (
            <TableRow className="" key={i}>
              <TableCell className="pl-4 text-sm leading-6 capitalize">
                {data.studentName}
              </TableCell>
              <TableCell>{data.courseName}</TableCell>
              <TableCell>{data.enrolledAt}</TableCell>
              <TableCell className="text-left">
                <div className="flex gap-x-2">
                  <div className="flex gap-2 items-center py-1 px-3 rounded-lg border border-[#E1E5E7]">
                    <Image src={fileView} alt="eye" width={17} height={17} />
                    <p>View</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {invoices?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center border-b border-l">
                <CusPagination
                  totalPages={invoices?.length || 1}
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

//TODO: Remove This Mock Data
const invoices = [
  {
    studentName: "John Doe",
    courseName: "React Development",
    enrolledAt: "2024-01-10",
  },
  {
    studentName: "Jane Smith",
    courseName: "Next.js Mastery",
    enrolledAt: "2024-02-05",
  },
  {
    studentName: "Michael Johnson",
    courseName: "UI/UX Design",
    enrolledAt: "2024-03-15",
  },
  {
    studentName: "Emily Davis",
    courseName: "JavaScript Basics",
    enrolledAt: "2024-04-02",
  },
  {
    studentName: "David Martinez",
    courseName: "Full Stack Development",
    enrolledAt: "2024-05-20",
  },
  {
    studentName: "Sophia Wilson",
    courseName: "CSS for Beginners",
    enrolledAt: "2024-06-12",
  },
  {
    studentName: "Daniel Brown",
    courseName: "TypeScript Essentials",
    enrolledAt: "2024-07-08",
  },
  {
    studentName: "Olivia Taylor",
    courseName: "Frontend Performance Optimization",
    enrolledAt: "2024-08-19",
  },
  {
    studentName: "Liam Anderson",
    courseName: "Advanced Node.js",
    enrolledAt: "2024-09-05",
  },
  {
    studentName: "Ava Thomas",
    courseName: "Python for Web Development",
    enrolledAt: "2024-10-10",
  },
];
