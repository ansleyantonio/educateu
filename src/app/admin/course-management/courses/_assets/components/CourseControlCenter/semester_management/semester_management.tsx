/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Accordion } from "@/components/ui/custom_ui/course-accordion";
import { useState } from "react";
import SemesterList from "./semesterList";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import AvailableModuleComponent from "./assignableModule/assignableModule_component";
import AssignedProgressStatus from "@/app/admin/course-management/_assets/components/assignedProgressStatus";

interface SemesterManagementProps {
  id: string;
  semestersNo?: number;
  type?: string;
}

const SemesterManagement = ({
  type,
  id,
  semestersNo = 6,
}: SemesterManagementProps) => {
  const [openModule, setOpenModule] = useState<string | null>(null);

  // Fetch semesters Data
  const { data, isLoading } = useFetchData({
    path: `courses/${id}/semesters`,
    queryKey: `get-semester-modules`,
  });

  const semesters = data?.data?.semesters;

  if (isLoading) {
    return (
      <div>
        <DataLoader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-3 pt-3 w-full">
      {/* Left: Assigned Module */}
      <div className="col-span-12 lg:col-span-8">
        {type && (
          <AssignedProgressStatus
            title="Assigned Module"
            type={type}
            total={data?.meta?.courseTotalCredits}
            assigned={data?.meta?.courseAssignedTotalCredits}
            unitName="Credits"
          />
        )}

        {Array.from({ length: semestersNo }, (_, n) => {
          const semester = semesters?.find(
            (semester: any) => (semester?.semesterNumber as number) === n + 1,
          );

          return (
            <Accordion
              key={n}
              type="single"
              collapsible
              className="cursor-not-allowed"
              value={openModule ?? undefined}
              onValueChange={setOpenModule}
            >
              <SemesterList
                id={id}
                semesterNo={n + 1}
                semester={semester}
                openModule={openModule}
                setOpenModule={setOpenModule}
              />
            </Accordion>
          );
        })}
      </div>

      {/* Right: Available Lessons */}
      <div className="col-span-12 lg:col-span-4">
        <AvailableModuleComponent id={id} semestersNo={semestersNo} />
      </div>
    </div>
  );
};

export default SemesterManagement;
