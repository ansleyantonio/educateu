"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import avatar from "/public/assets/logo/dashboard_management/image.png";

type StudentInfoProps = {
  name: string;
  applicationId: string;
  enrollmentDate: string;
  course: string;
  status: string;
};

const StudentInfo = ({
  name,
  applicationId,
  enrollmentDate,
  course,
  status,
}: StudentInfoProps) => {
  return (
    <Card className="flex items-center justify-between p-4 rounded-xl shadow-sm border border-gray-200 mt-4">
      {/* Left section */}
      <div className="flex flex-col items-start gap-4">
        <div className="flex">
          <Image
            src={avatar}
            alt="Student Avatar"
            className="w-10 h-10 rounded-full"
          />

          <h3 className="font-bold text-[24px] ml-[5px]">{name}</h3>
        </div>

        {/* Name and details */}
        <div className="flex gap-1">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span>
              <span className="font-bold text-black">Application ID:</span>{" "}
              {applicationId}
            </span>
            <span>
              <span className="font-bold text-black">Enrolment Date:</span>{" "}
              {enrollmentDate}
            </span>
            <span>
              <span className="font-bold text-black">Course:</span>{" "}
              {course}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`text-sm px-3 py-1 rounded-full font-medium ${
          status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {status} Student
      </div>
    </Card>
  );
};

export default StudentInfo;
