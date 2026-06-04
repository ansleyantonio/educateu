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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function ProfileStatusCard({ application }: any) {
  const {editAccess} = useAuths()
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
  if (!applicationId) return null;

  const formatDateTimeShort = (d: string) => {
    const dt = new Date(d);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${p(dt.getMonth() + 1)}/${p(dt.getDate())}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
  };

  const targetUser = application?.userPortalCategoryRoleApplications?.find(
    (item: any) => {
      const roleName = item.userPortalCategoryRole?.role?.name?.toLowerCase();
      return roleName === "agent" || roleName === "sub-agent";
    },
  );

const handleDownload = async () => {
    if (!application) return;

    const {
      personalInformation,
      academicBackground,
      courseSelection,
      personalStatement,
      disabilityAndAccessibility,
      nextOfKin,
      fund,
      references,
      criminalBackground,
    } = application;

    const friendlyPersonalLabels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      dateOfBirth: "Date of Birth",
      email: "Email Address",
      countryOfBirth: "Country of Birth",
      currentNationality: "Nationality",
      sex: "Sex",
      ethnicity: "Ethnicity",
      mobileNumber: "Mobile Number",
      currentAddress: "Current Address",
      currentPostCode: "Current Postcode",
      permanentAddress: "Permanent Address",
      nationalIdentityType: "ID Type",
      nationalIdentityNumber: "ID Number",
    };

    const friendlyAcademicLabels: Record<string, string> = {
      highestLevelOfQualification: "Highest Level of Qualification",
      areaOfQualification: "Area of Qualification",
      gradeOrResult: "Grade/Result",
      yearCompleted: "Year Completed",
      countryOfIssue: "Country of Issue",
      institutionName: "Institution Name",
    };

    const friendlyCourseSelectionLabels: Record<string, string> = {
      faculty: "Faculty",
      course: "Course",
      intake: "Intake",
      yearOfCourse: "Year of Course",
    };

    const friendlyNextOfKinLabels: Record<string, string> = {
      relationship: "Relationship",
      fullName: "Full Name",
      phoneOrMobile: "Phone or Mobile",
      address: "Address",
    };

    const friendlyCriminalLabels: Record<string, string> = {
      offenseOrPenalty: "Offense or Penalty",
      disqualificationOrSanction: "Disqualification or Sanction",
      policeClearance: "Police Clearance",
    };

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const headingFontSize = 14;
    const lineHeight = fontSize + 6;
    const marginX = 40;
    const pageHeight = 841.89;
    const pageWidth = 595.28;
    const maxLineWidth = pageWidth - marginX * 2;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 40;

    const drawText = (text: string, isHeading = false) => {
      const size = isHeading ? headingFontSize : fontSize;
      const words = text.split(" ");
      let line = "";

      if (isHeading) y -= 10;

      for (const word of words) {
        const testLine = line + word + " ";
        const width = font.widthOfTextAtSize(testLine, size);

        if (width > maxLineWidth) {
          if (y < 60) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - 40;
          }
          page.drawText(line.trim(), {
            x: marginX,
            y,
            size,
            font,
            color: rgb(0, 0, 0),
          });
          y -= size + 4;
          line = word + " ";
        } else {
          line = testLine;
        }
      }

      if (line.trim()) {
        if (y < 60) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - 40;
        }
        page.drawText(line.trim(), {
          x: marginX,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        });
        y -= size + 4;
      }

      if (isHeading) y -= 8;
    };

    const drawKeyValue = (label: string, value: any) => {
      const displayValue = value ? value.toString() : "N/A";
      drawText(`${label}: ${displayValue}`);
    };

    // Header
    drawText("APPLICATION PROFILE SUMMARY", true);
    drawText(`Application ID: ${application.id}`);
    drawText(`Created At: ${new Date(application.createdAt).toLocaleString()}`);
    drawText(`Status: ${application.status}`);
    drawText(`Stage: ${application.stage}`);
    drawText(`Interview Outcome: ${application.interviewOutcome}`);
    drawText(`Outcome: ${application.outcome}`);
    drawText("");

    // Personal Info
    drawText("Personal Information", true);
    for (const key in friendlyPersonalLabels) {
      const label = friendlyPersonalLabels[key];
      let value = personalInformation?.[key];
      if (key === "dateOfBirth" && value) {
        value = new Date(value).toISOString().split("T")[0];
      }
      drawKeyValue(label, value);
    }

    drawText("");

    // Academic Background
    drawText("Academic Background", true);
    for (const key in friendlyAcademicLabels) {
      drawKeyValue(friendlyAcademicLabels[key], academicBackground?.[key]);
    }

    drawText("");

    // Course Selection
    drawText("Course Selection", true);
    for (const key in friendlyCourseSelectionLabels) {
      drawKeyValue(friendlyCourseSelectionLabels[key], courseSelection?.[key]);
    }

    drawText("");

    // Personal Statement
    drawText("Personal Statement", true);
    drawKeyValue("Personal Statement", personalStatement?.statement);

    drawText("");

    // Disability & Accessibility
    drawText("Disability & Accessibility", true);
    drawKeyValue(
      "Disability & Accessibility",
      disabilityAndAccessibility?.disabilityAndAccessibility
    );

    drawText("");

    // Next of Kin
    drawText("Next of Kin", true);
    for (const key in friendlyNextOfKinLabels) {
      drawKeyValue(friendlyNextOfKinLabels[key], nextOfKin?.[key]);
    }

    drawText("");

    // Fund Info
    drawText("Fund Information", true);
    drawKeyValue("Source", fund?.source);

    drawText("");

    // References
    drawText("References", true);
    drawKeyValue("References", references);

    drawText("");

    // Criminal Background
    drawText("Criminal Background", true);
    for (const key in friendlyCriminalLabels) {
      drawKeyValue(friendlyCriminalLabels[key], criminalBackground?.[key]);
    }

    // Save and trigger download

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      personalInformation?.firstName ?? "user"
    }_application_profile.pdf`;
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
              <div className={`flex gap-2 items-center py-1 px-3 rounded-full border transition-transform focus:ring-2 focus:ring-blue-200 focus:outline-none ${
    !editAccess 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
      : 'bg-[#F9FAFB] hover:bg-[#EDF1F5] active:scale-[0.98] cursor-pointer'
  }`} aria-disabled={!editAccess} onClick={!editAccess ? undefined : () => handleDownload()}>
                <Image
                  src={downloadIcon}
                  width={15}
                  height={15}
                  alt="download"
                   className={!editAccess ? 'opacity-50' : ''}
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
        <StatusButton status="Pending" label="Interview" />
      </CardDescription>
      <hr />
      {/* Card footer */}
      <div className="flex flex-wrap gap-4 items-center p-4 text-sm font-light">
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
