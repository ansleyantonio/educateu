/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { ApplicantProps } from "@/components/common/dialog/assign/applicant_interface";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AssignDialog } from "../../../../../../../../components/common/dialog/assign/assign_dialog";
import LogHistory from "./logHistory";
import calender from "/public/assets/icons/calendar.svg";
import profile from "/public/assets/icons/profile.svg";
import user_star from "/public/assets/icons/user_star.svg";
import image from "/public/assets/logo/dashboard_management/image.png";
import dateFormat from "@/utils/DateFormatter";

export default function AdmissionOfficersCard({
  //  isWellbeing,
  id,
  applicationInfo,
}: {
  // isWellbeing?: boolean;
  id: string;
  applicationInfo: ApplicantProps[];
}) {
  const { data, isLoading } = useFetchData({
    queryKey: "fetch-list-of-assigned-logs",
    path: `admission/assigns/application-assignments?applicationId=${id}`,
    method: "GET",
  });

  const applicationAssignments = data?.data?.formattedApplicationAssignments;
  const assignment = applicationAssignments?.[0];
  const { assignedTo, assignedBy, createdAt } = assignment || {};

  return (
    <>
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center my-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between items-center p-4 gap-2">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <p className="text-lg font-semibold text-black">
                  Assigned to Admission Officers
                </p>
                <div className="flex gap-3 items-center">
                  <Image src={calender} alt="profile" />
                  <p>
                    Date :{" "}
                    {createdAt ? dateFormat.fullDateTime(createdAt) : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <AssignDialog
                  // isWellbeing={isWellbeing}
                  applicationInfo={applicationInfo}
                  assignmentLoading={isLoading}
                  assignment={assignment}
                />
              </div>
            </div>
            <hr />
            {assignment && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 2xl:gap-6 items-center p-4">
                <div className="flex flex-wrap gap-3 xl:items-center">
                  <div className="flex gap-2 items-center">
                    <Image className="w-5 h-5" src={profile} alt="profile" />
                    <p className="text-nowrap">Assigned to :</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Image className="rounded-full" src={image} alt="image" />
                    <p>
                      {assignedTo?.userPortalCategory?.user?.firstName +
                        " " +
                        assignedTo?.userPortalCategory?.user?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 xl:items-center">
                  <div className="flex gap-2 items-center">
                    <Image src={user_star} alt="user_star" />
                    <p className="text-nowrap">Assigned by : </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Image className="rounded-full" src={image} alt="image" />
                    <p>
                      {assignedBy?.userPortalCategory?.user?.firstName +
                        " " +
                        assignedBy?.userPortalCategory?.user?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <hr />
      </Card>
      <br />
      {applicationAssignments?.length > 0 && (
        <>
          <h2>History</h2>
          <div>
            <LogHistory history={applicationAssignments} />
          </div>
        </>
      )}
    </>
  );
}
