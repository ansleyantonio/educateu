"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AgentPagination from "@/app/(agent-portal)/agent/application-management/_assets/components/page_components/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/table";
import Image from "next/image";
import avatar from "/public/assets/logo/dashboard_management/image.png";
import { Toolbar } from "./Toolbar";
import { ApplicantDialog } from "./Dialog/ApplicantDialog";

// Mock data
const mockApplicants = [
  {
    id: "1",
    name: "John Doe",
    studentId: "#12245",
    course: "Computer Science",
    progress: "75%",
    email: "john@example.com",
    entrydate: "12/03/2020",
    endDate: "12/03/2024",
    status: "Active",
  },
  {
    id: "2",
    name: "Jane Smith",
    studentId: "#12245",
    course: "Business Administration",
    progress: "60%",
    email: "jane@example.com",
    entrydate: "12/03/2020",
    endDate: "12/03/2024",
    status: "Inactive",
  },
  {
    id: "3",
    name: "Alice Johnson",
    studentId: "#12245",
    course: "Psychology",
    progress: "90%",
    email: "alice@example.com",
    entrydate: "12/03/2020",
    endDate: "12/03/2024",
    status: "Active",
  },
];

type Applicant = {
  id: string;
  name: string;
  studentId: string;
  course: string;
  progress: string;
  email: string;
  entrydate: string;
  endDate: string;
  status: string;
};

export function ApplicantTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [search, setSearch] = useState("");

  const filteredApplicants = mockApplicants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNameClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDialogOpen(true);
  };

  const handleDownload = () => {
    console.log("Download clicked");
    // logic for generating and downloading CSV/Excel can be added here
  };

  return (
    <Card>
      <Toolbar
        total={mockApplicants.length}
        search={search}
        setSearch={setSearch}
        onDownload={handleDownload}
      />
      <Table>
        <TableCaption className="p-4">
          <AgentPagination totalPages={1} />
        </TableCaption>

        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="pl-6 w-[20%]">Student Name</TableHead>
            <TableHead className="w-[20%]">Student ID</TableHead>
            <TableHead className="w-[25%]">Course</TableHead>
            <TableHead className="w-[35%]">Course Progress</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {mockApplicants.map((applicant) => (
            <TableRow key={applicant.id} className="bg-white hover:bg-gray-100">
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <Image
                    src={avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col">
                    <p
                      className="font-medium cursor-pointer"
                      onClick={() => handleNameClick(applicant)}
                    >
                      {applicant.name}
                    </p>
                    <div
                      className={`px-3 py-1 text-sm rounded-full w-fit mt-1 ${
                        applicant.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {applicant.status}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {applicant.studentId}
                <p className="text-sm text-muted-foreground">
                  {applicant.email}
                </p>
              </TableCell>
              <TableCell>
              <p className="font-medium cursor-pointer"
                 onClick={() => handleNameClick(applicant)}
              >{applicant.course}</p>
                <p className="text-sm text-muted-foreground">
                  Entry Date: {applicant.entrydate}
                </p>
                <p className="text-sm text-muted-foreground">
                  End Date: {applicant.endDate} (Expected)
                </p>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 items-center">
                  <Progress value={parseInt(applicant.progress)} />
                  <span className="text-xs text-muted-foreground text-right">
                    {applicant.progress}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ApplicantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        applicant={selectedApplicant}
      />
    </Card>
  );
}
