"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import LogHistory from "./logHistory";
import calender from "/public/assets/icons/calendar.svg";
import profile from "/public/assets/icons/profile.svg";
import user_star from "/public/assets/icons/user_star.svg";
import image from "/public/assets/logo/dashboard_management/image.png";

export default function AdmissionOfficersCard({ id }: { id: string }) {
  const { data, isLoading } = useFetchData({
    queryKey: "fetch-list-of-assigned-logs",
    path: `admission/assigns/application-assignments`,
    method: "GET",
    filterData: {
      applicationId: id,
    },
  });

  // console.log("Assignmen History data", data);

  const formatDateTimeShort = (d: string) => {
    const dt = new Date(d);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(dt.getMonth() + 1)}/${p(dt.getDate())}/${dt.getFullYear()} ${p(
      dt.getHours()
    )}:${p(dt.getMinutes())}`;
  };

  const applicationAssignments = data?.data?.formattedApplicationAssignments;
  const assignment = applicationAssignments?.[0];
  const { assignedTo, assignedBy, createdAt } = assignment || {};
  console.log("assignment", assignedTo?.userPortalCategory?.user?.firstName);

  return (
    <>
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center my-8">
            <DataLoader />
          </div>
        ) : (
          <>
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-2 p-4">
              <p className="text-lg font-semibold text-black">
                Assigned to Admission Officers
              </p>
              <div className="flex gap-3 items-center">
                <Image src={calender} alt="profile" />
                <p>
                  Date : {createdAt ? formatDateTimeShort(createdAt) : "N/A"}
                </p>
              </div>
              <div>
                {/* <AssignDialog */}
                {/*   assignmentLoading={isLoading} */}
                {/*   assignment={assignment} */}
                {/* /> */}
              </div>
            </div>
            <hr />
            {assignment && (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:gap-6 items-center p-4">
                <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
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

                <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
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
