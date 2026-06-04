/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardDescription } from "@/components/ui/card";
import { CopyWithIcon } from "@/utils/CopyButton";
import Image from "next/image";
import { FiClock, FiInfo } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { LuCalendarDays } from "react-icons/lu";
import Indicators from "../buttons/indicators";
import downloadIcon from "/public/assets/icons/Download.svg";
import image from "/public/assets/logo/dashboard_management/image.png";
// import CreatedByDialog from "./CreatedByDialog";
import CreatedByDialog from "@/app/admin/admissions/admission/[slug]/profile/_assets/components/dialog/createdByDialog";
import { fetchSingleApplications } from "@/app/admin/admissions/admission/[slug]/profile/_assets/query_controller/fetch_single_application";
import { WellBeingPDF } from "@/components/WellBeingPDF/WellBeingPDF";
import { useAuths } from "@/hooks/userContext";
import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";

export const Record = ({ application }: any) => {
  const { editAccess, user } = useAuths();
  // console.log(
  //   "application---",
  //   application
  // );
  const { data, isLoading } = useQuery({
    queryKey: [
      "single-application-data",
      { token: user?.token, id: application.id },
    ],
    queryFn: fetchSingleApplications,
    enabled: !!application.id,
  });

  const {
    userPortalCategoryRoleApplications,
    applicationId,
    email,
    firstName,
    lastName,
    referenceNumber,
    createdAt,
    status,
  } = application?.personalInformation ?? {};
  // if (!applicationId) return null;

  const formatDateTimeShort = (d: string) => {
    const dt = new Date(d);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(dt.getMonth() + 1)}/${p(dt.getDate())}/${dt.getFullYear()} ${p(
      dt.getHours()
    )}:${p(dt.getMinutes())}`;
  };

  const handleDownload = async () => {
    if (!application) return;

    const doc = <WellBeingPDF application={data} token={user?.token} />;
    const asPdf = await pdf(doc).toBlob();

    const url = URL.createObjectURL(asPdf);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      application.personalInformation?.firstName ?? "user"
    }_well_being_profile.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // const targetUser = application?.userPortalCategoryRoleApplications?.find(
  //   (item: any) => {
  //     const roleName = item.userPortalCategoryRole?.role?.name?.toLowerCase();
  //     return roleName === "agent" || roleName === "sub-agent";
  //   },
  // );

  return (
    <Card>
      {/* Card header */}
      <div className="flex flex-col gap-5 p-4 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex gap-3 items-center">
          <Image
            src={image}
            width={120}
            height={120}
            alt="profile"
            className="rounded-full border border-[#CFD6DD] h-[40px] w-[40px]"
          />

          <div>
            <div className="flex gap-2 items-center">
              <h3 className="mb-1 font-semibold text-[18px]">
                {application?.personalInformation?.firstName +
                  " " +
                  application?.personalInformation?.lastName}
              </h3>

              <div className="flex gap-2">
                {application.disabilityAndAccessibility
                  ?.disabilityAndAccessibility && (
                  <Indicators
                    text="Disability"
                    color="#5925DC"
                    background="#D9D6FE"
                  />
                )}
                {application?.criminalBackground &&
                  (application?.criminalBackground?.policeClearance !== "YES" ||
                    application?.criminalBackground?.offenseOrPenalty ===
                      "YES" ||
                    application?.criminalBackground
                      ?.disqualificationOrSanction == "YES") && (
                    <Indicators
                      text="Criminal Record"
                      color="#B42318"
                      background="#FECDCA"
                    />
                  )}
              </div>
            </div>
            <div className="flex gap-3 items-center text-xs font-semibold">
              <div
                role="button"
                tabIndex={!editAccess ? -1 : 0}
                className={`flex gap-2 items-center py-1 px-3 rounded-full border transition-transform focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                  !editAccess
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-[#F9FAFB] hover:bg-[#EDF1F5] active:scale-[0.98] cursor-pointer"
                }`}
                onClick={!editAccess ? undefined : () => handleDownload()}
                aria-disabled={!editAccess}
              >
                <Image
                  src={downloadIcon}
                  width={15}
                  height={15}
                  alt="download"
                  className={!editAccess ? "opacity-50" : ""}
                />
                <p>Download</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <FiInfo size={20} color="#34657C" />
          <p>Student Status : Application in Progress, Not Yet Enrolled </p>
        </div>
      </div>
      <hr />
      {/* Card description */}
      <CardDescription className="grid grid-cols-3 gap-4 justify-center items-center p-4 font-medium lg:grid-cols-7">
        {/* Email */}
        <div className="pr-4 border-r">
          <p>Email</p>
          <div className="flex gap-4 items-center">
            <p className="text-black truncate min-w-[65px]">
              {application?.personalInformation?.email}
            </p>
            <CopyWithIcon
              color="[#013E5B]"
              text={application?.personalInformation?.email}
            />
          </div>
        </div>

        {/* Reference */}
        <div className="pr-4 border-r">
          <p>Reference</p>
          <div className="flex gap-4 items-center">
            <p className="text-black truncate min-w-[65px]">
              {data?.data?.application?.applicationId}
            </p>
            <CopyWithIcon
              color="[#013E5B]"
              text={data?.data?.application?.applicationId}
            />
          </div>
        </div>

        {/* Application Status */}
        <StatusButton
          status={data?.data?.application?.status}
          label="Application Status"
        />
        {/* Id Check */}
        <StatusButton status="Pending" label="ID Check" />

        {/* Finance */}
        <StatusButton status="Incomplete" label="Finance" />

        {/* Creadibility */}
        <StatusButton status="Pending" label="Creadibility" />

        {/* InterView */}
        <StatusButton
          status={data?.data?.application?.interviewOutcome}
          label="Interview"
        />
      </CardDescription>
      <hr />
      {/* Card footer */}
      <div className="flex gap-4 items-center p-4 text-sm font-light">
        <div>
          <span className="text-sm font-thin">Created By (</span>
          <CreatedByDialog
            user={
              data?.data?.application?.userPortalCategoryRoleApplications?.[0]
                ?.userPortalCategoryRole?.userPortalCategory?.user
            }
          />
          )
        </div>
        <div className="flex gap-2 items-center">
          <FiClock color="#8D98AB" />
          <p>View Reallocation history</p>
        </div>
        <div className="flex gap-2 items-center">
          <LuCalendarDays color="#8D98AB" />
          <p>
            Submitted On:{" "}
            {formatDateTimeShort(data?.data?.application?.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
};

const StatusButton = ({ status, label }: { status: string; label: string }) => {
  const normalizedStatus = status?.toLowerCase();

  const color =
    normalizedStatus === "active"
      ? "green"
      : normalizedStatus === "pending"
      ? "#F59638"
      : normalizedStatus === "incomplete"
      ? "red"
      : "gray";

  return (
    <div className={` ${label !== "Interview" ? "border-r" : ""}`}>
      <p>{label}</p>
      <div className="flex gap-1 justify-center items-center px-2 mt-1 text-xs font-semibold bg-white rounded-lg border shadow-sm bg-bl py-[1px] w-fit">
        <GoDotFill size={20} color={color} />
        <p>{status}</p>
      </div>
    </div>
  );
};
