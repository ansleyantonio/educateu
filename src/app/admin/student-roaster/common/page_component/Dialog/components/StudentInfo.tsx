"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import avatar from "/public/assets/logo/dashboard_management/image.png";
import { Button } from "@/components/ui/custom_ui/button";
import { Mail } from 'lucide-react';
import { useState } from "react";
import { SendEmailModalRichText } from "../../../../../../../components/EmailModals/SendEmailModal";
import { useAuths } from "@/hooks/userContext";

type StudentInfoProps = {
  studentId: string;
  name: string;
  applicationId: string;
  enrollmentDate: string;
  course: string;
  status: string;
  mode?: string;
  email: string;
};

const StudentInfo = ({
  studentId,
  name,
  applicationId,
  enrollmentDate,
  course,
  status,
  mode,
  email
}: StudentInfoProps) => {

 const [dialogOpen, setDialogOpen] = useState(false);
const {editAccess} = useAuths()
  return (
    <Card className="flex items-center justify-between p-4 rounded-xl shadow-sm border border-gray-200 mt-4">
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-2">
          <Image
            src={avatar}
            alt="Student Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <h3 className="font-bold text-[24px] ml-[5px]">{name}</h3>
            <div
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {status} Student
            </div>
          </div>
        </div>

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
              <span className="font-bold text-black">Course:</span> {course}
            </span>
          </div>
        </div>
      </div>

      {/* <div
        className={`text-sm px-3 py-1 rounded-full font-medium ${
          status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {status} Student
      </div> */}
      <Button
          variant="primary"
          onClick={() => setDialogOpen(true)}
          disabled={!editAccess}
        >
           <Mail className="mr-3"/> Send Email
        </Button>
        <SendEmailModalRichText
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          email_to={[email]}
          viewOnly={true}
        />
    </Card>
  );
};

export default StudentInfo;
