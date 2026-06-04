/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardDescription } from "@/components/ui/card";
import dp from "/public/assets/logo/dashboard_management/image.png";
import Image from "next/image";
import { FiInfo, FiClock } from "react-icons/fi";
import { LuCalendarDays } from "react-icons/lu";
import { GoDotFill } from "react-icons/go";
import { CopyWithIcon } from "@/utils/CopyButton";
import downloadIcon from "/public/assets/icons/Download.svg";
import CreatedByDialog from "./dialog/createdByDialog";
import { useAuths } from "@/hooks/userContext";
import { pdf } from "@react-pdf/renderer";
import { ApplicationPDF } from "@/components/ApplicationPDF/ApplicationPDF";

export default function ProfileStatusCard({ application }: any) {
  const {editAccess} = useAuths();
  const { email, firstName, lastName, createdAt } =
    application?.personalInformation ?? {};
    const {applicationId} = application;
  if (!applicationId) return null;
  // console.log(application, "Application")

  const formatDateTimeShort = (d: string) => {
    const dt = new Date(d);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(dt.getMonth() + 1)}/${p(dt.getDate())}/${dt.getFullYear()} ${p(
      dt.getHours()
    )}:${p(dt.getMinutes())}`;
  };

  const targetUser = application?.userPortalCategoryRoleApplications?.find(
    (item: any) => {
      const roleName = item.userPortalCategoryRole?.role?.name?.toLowerCase();
      return roleName === "agent" || roleName === "sub-agent";
    }
  );

  const handleDownload = async () => {
    if (!application) return;
  
    const doc = <ApplicationPDF application={application} />;
  
    const asPdf = await pdf(doc).toBlob();
  
    const url = URL.createObjectURL(asPdf);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${application.personalInformation?.firstName ?? "user"}_application_profile.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <p>Student Status : {application?.status || "Application in Progress, Not Yet Enrolled"} </p>
        </div>
      </div>
      <hr />
      {/* Card description */}
      <CardDescription className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4 p-4 font-medium ">
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
          <p>Reference</p>
          <div className="flex gap-4 items-center">
            <p className="text-black truncate min-w-[65px]">{applicationId}</p>
            <CopyWithIcon color="[#013E5B]" text={applicationId} />
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
        <StatusButton
          status={application?.interviewOutcome}
          label="Interview"
        />
      </CardDescription>
      <hr />
      {/* Card footer */}
      <div className="flex flex-wrap gap-4 xl:items-center p-4 text-sm font-light">
        <div>
          <span className="text-sm font-thin">Created By (</span>
          <CreatedByDialog
            user={targetUser?.userPortalCategoryRole?.userPortalCategory?.user}
          />
          )
        </div>
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
    <div className={`pr-4 ${label !== "Interview" ? "border-r" : ""}`}>
      <p>{label}</p>
      <div className="flex gap-1 justify-center items-center px-2 mt-1 text-xs font-semibold bg-white rounded-lg border shadow-sm bg-bl py-[1px] w-fit">
        <GoDotFill
          size={20}
          color={`${
            status == "Active"
              ? "green"
              : status == "Pending"
              ? "#F59638"
              : status == "Incomplete"
              ? "red"
              : "gray"
          }`}
        />
        <p>{status}</p>
      </div>
    </div>
  );
};
