/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import avatar from "/public/assets/logo/dashboard_management/image.png";
import { Toolbar } from "./Toolbar";
import { ApplicantDialog } from "./Dialog/ApplicantDialog";
import { Loader2 } from "lucide-react";
import { maskEmail } from "@/utils/maskString/maskString";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

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
  awardingBody: string;
};

type RawApplicant = {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  course: string;
  progress: string;
  email: string;
  entryDate: string;
  endDate: string;
  status: string;
  awardingBody: string;
};

type ApplicantTableProps = {
  mode?: "registry" | "support";
  data: any;
  setCurrentPage: (page: number) => void;
  currentPage: number;
  isLoading: boolean;
  setLimit: (limit: string) => void;
};

export function ApplicantTable({
  mode = "registry",
  data,
  setCurrentPage,
  currentPage,
  isLoading,
  setLimit,
}: ApplicantTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mappedApplicants, setMappedApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!data) return;

    const transformed: Applicant[] = data?.data?.map((a: RawApplicant) => ({
      id: a?.id || "",
      name: `${a?.firstName} ${a?.lastName}` || "",
      studentId: a?.studentId || "",
      course: a?.course || "",
      progress: a?.progress || "0%",
      email: a?.email || "",
      entrydate: new Date(a?.entryDate).toLocaleDateString("en-GB"),
      endDate: new Date(a?.endDate).toLocaleDateString("en-GB"),
      status: a?.status === "APPROVED" ? "Active" : "Inactive",
      awardingBody: a?.awardingBody || "",
    }));

    setMappedApplicants(transformed);
  }, [data]);

  const filteredApplicants = mappedApplicants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNameClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDialogOpen(true);
  };

  // Handle selection updates
  const handleSetSelectedIds = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleSetSelectObject = (applicants: Applicant[]) => {
    setSelectedApplicants(applicants);
  };

  // Prepare pagination data
  const paginationData = {
    page: currentPage,
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 1,
  };

  return (
    <>
      <Card>
        <Toolbar
          applicants={selectedApplicants}
          total={data?.pagination?.total}
          search={search}
          setSearch={setSearch}
          setLimit={setLimit}
        />

        <DynamicTableWithPagination
          data={filteredApplicants}
          isLoading={isLoading}
          pagination={paginationData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedIds={selectedIds}
          setSelectedIds={handleSetSelectedIds}
          setSelectObject={handleSetSelectObject}
          isCheckBox
          config={{
            columns: [
              {
                key: "name",
                header: "Student Name",
                className: "pl-6 w-[20%] cursor-pointer",
                render: (applicant: Applicant) => (
                  <div
                    className="flex items-center gap-3"
                    onClick={() => handleNameClick(applicant)}
                  >
                    <Image
                      src={avatar}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <p className="font-medium">{applicant.name}</p>
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
                ),
              },
              {
                key: "studentId",
                header: "Student ID",
                className: "w-[20%] cursor-pointer",
                render: (applicant: Applicant) => (
                  <div onClick={() => handleNameClick(applicant)}>
                    {applicant.studentId}
                    <p className="text-sm text-muted-foreground">
                      {maskEmail(applicant.email)}
                    </p>
                  </div>
                ),
              },
              {
                key: "course",
                header: "Course",
                className: "w-[20%] cursor-pointer",
                render: (applicant: Applicant) => (
                  <div onClick={() => handleNameClick(applicant)}>
                    <p className="font-medium">{applicant.course}</p>
                    <p className="text-sm text-muted-foreground">
                      Entry Date: {applicant.entrydate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      End Date: {applicant.endDate} (Expected)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Awarding/Accreditation Body: {applicant.awardingBody}
                    </p>
                  </div>
                ),
              },
              {
                key: "progress",
                header: "Course Progress",
                className: "w-[40%]",
                render: (applicant: Applicant) => (
                  <div className="flex gap-2 items-center">
                    <Progress value={parseInt(applicant.progress)} />
                    <span className="text-xs text-muted-foreground">
                      {applicant.progress}
                    </span>
                  </div>
                ),
              },
            ],
            rowClassName: (applicant: Applicant) =>
              `bg-white hover:bg-gray-100 ${
                selectedIds.includes(applicant.id)
                  ? "border-l-4 border-blue-500"
                  : ""
              }`,
          }}
        />

        {selectedApplicant && (
          <ApplicantDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            applicant={selectedApplicant}
            mode={mode}
          />
        )}
      </Card>
    </>
  );
}