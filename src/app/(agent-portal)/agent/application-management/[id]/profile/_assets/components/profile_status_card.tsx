/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardDescription } from "@/components/ui/card";
import { CopyWithIcon } from "@/utils/CopyButton";
import Image from "next/image";
import { FiClock, FiInfo } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { LuCalendarDays } from "react-icons/lu";
import downloadIcon from "/public/assets/icons/Download.svg";
import dp from "/public/assets/logo/dashboard_management/image.png";

export default function ProfileStatusCard({ application }: any) {
  const { email, firstName, lastName, createdAt } =
    application?.personalInformation ?? {};
  // if (!applicationId) return null;

  console.log("application", application);

  const formatDateTimeShort = (d: string) => {
    const dt = new Date(d);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(dt.getMonth() + 1)}/${p(dt.getDate())}/${dt.getFullYear()} ${p(
      dt.getHours()
    )}:${p(dt.getMinutes())}`;
  };

  return (
    <Card>
      {/* Card header */}
      <div className="flex flex-col gap-5 p-4 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex gap-3 items-center">
          <Image
            src={dp}
            width={120}
            height={120}
            alt="profile"
            className="rounded-full border border-[#CFD6DD] h-[40px] w-[40px]"
          />

          <div>
            <h3 className="mb-1 font-semibold text-[18px]">
              {firstName + " " + lastName}
            </h3>
            <div className="flex gap-3 items-center text-xs font-semibold">
              <div className="flex gap-2 items-center py-1 px-3 rounded-full border cursor-pointer bg-[##F9FAFB]">
                <Image
                  src={downloadIcon}
                  width={15}
                  height={15}
                  alt="download"
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
            <p className="text-black truncate min-w-[65px]">{email}</p>
            <CopyWithIcon color="[#013E5B]" text={email} />
          </div>
        </div>

        {/* Reference */}
        <div className="pr-4 border-r">
          <p>ApplicationId</p>
          <div className="flex gap-4 items-center">
            <p className="text-black truncate min-w-[65px]">
              {application?.applicationId}
            </p>
            {application?.applicationId && (
              <CopyWithIcon
                color="[#013E5B]"
                text={application?.applicationId}
              />
            )}
          </div>
        </div>

        {/* Application Status */}
        <StatusButton status="Active" label="Application Status" />
        {/* Id Check */}
        <StatusButton status="Pending" label="ID Check" />

        {/* Finance */}
        <StatusButton status="Incomplete" label="Finance" />

        {/* Creadibility */}
        <StatusButton status="Pending" label="Creadibility" />

        {/* InterView */}
        <StatusButton status="Pending" label="Interview" />
      </CardDescription>
      <hr />
      {/* Card footer */}
      <div className="flex gap-4 items-center p-4 text-sm font-light">
        {/* <div> */}
        {/*   <span className="text-sm font-thin">Created By (</span> */}
        {/*   <span className="text-blue-600 cursor-pointer hover:underline"> */}
        {/*     Frederick Deane */}
        {/*   </span> */}
        {/* </div> */}
        <div className="flex gap-2 items-center">
          <FiClock color="#8D98AB" />
          <p>View Reallocation history</p>
        </div>
        <div className="flex gap-2 items-center">
          <LuCalendarDays color="#8D98AB" />
          <p>Submitted On: {formatDateTimeShort(createdAt)}</p>
        </div>
      </div>
    </Card>
  );
}

const StatusButton = ({ status, label }: { status: string; label: string }) => {
  return (
    <div className={` ${label !== "Interview" ? "border-r" : ""}`}>
      <p>{label}</p>
      <div className="flex gap-1 justify-center items-center px-2 mt-1 text-xs font-semibold bg-white rounded-lg border shadow-sm bg-bl py-[1px] w-fit">
        <GoDotFill
          size={20}
          color={`${
            status === "Active"
              ? "green"
              : status === "Pending"
              ? "#F59638"
              : status === "Incomplete"
              ? "red"
              : "gray"
          }`}
        />
        <p>{status}</p>
      </div>
    </div>
  );
};
