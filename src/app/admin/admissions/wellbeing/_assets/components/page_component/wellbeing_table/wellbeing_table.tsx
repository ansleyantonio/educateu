/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { WellBeingDialog } from "../../well_being_modal";
import Indicators from "../buttons/indicators";
import ConfirmationDialog from "../modal_components/confirmation_dialog";
import image from "/public/assets/logo/dashboard_management/image.png";
import ActionButton from "@/components/common/button/actionButton";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";

interface Props {
  applications: any;
  isLoading: boolean;
  setCurrentPage: (data: number) => void;
  currentPage: number;
}

export function WellBeingTable({
  applications,
  setCurrentPage,
  isLoading,
  currentPage,
}: Props) {
  const auth = useAuths();
  const token = auth?.user?.token as string;

  // const queryClient = useQueryClient();

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  //const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [applicationInfo, setApplicationInfo] = useState<any>(null);

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedApplicantName, setSelectedApplicantName] = useState<
    string | null
  >(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);

  const handleClick = (application: any) => {
    setApplicationInfo(application);

    setIsOpen(true);
  };

  const handleApproveReject = (
    applicantId: string,
    status: "APPROVED" | "REJECTED",
    applicantName: string
  ) => {
    setSelectedApplicantId(applicantId);
    setSelectedStatus(status);
    setSelectedApplicantName(applicantName);
    setIsConfirmationOpen(true);
  };

  return (
    <>
      <DynamicTableWithPagination
        isLoading={isLoading}
        data={applications?.data?.applications || []}
        pagination={{
          page: currentPage,
          total: applications?.data?.applications?.length || 0,
          totalPages: applications?.pagination?.totalPages,
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "applicantName",
              header: "Applicant Name",
              render: (applicant) => (
                <div
                  className="flex gap-3 items-center"
                  onClick={() => handleClick(applicant)}
                >
                  <Image
                    src={image}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col cursor-pointer">
                    <p className="font-semibold">
                      {applicant?.personalInformation?.firstName}{" "}
                      {applicant?.personalInformation?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      @ {applicant?.personalInformation?.firstName}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "referenceNo",
              header: "Reference No.",
              render: (applicant) => applicant?.applicationId,
            },
            {
              key: "studentCareRecords",
              header: "Student Care Records",
              render: (applicant) => (
                <div className="flex flex-col gap-2 w-fit">
                  {applicant?.disabilityAndAccessibility &&
                    applicant?.disabilityAndAccessibility?.disabilityAndAccessibility?.[0]?.toLowerCase() !==
                      "no known disability" && (
                      <Indicators
                        text="Disability"
                        color="#5925DC"
                        background="#D9D6FE"
                      />
                    )}
                  {applicant?.criminalBackground &&
                    (applicant?.criminalBackground?.policeClearance !== "YES" ||
                      applicant?.criminalBackground?.offenseOrPenalty ===
                        "YES" ||
                      applicant?.criminalBackground
                        ?.disqualificationOrSanction == "YES") && (
                      <Indicators
                        text="Criminal Record"
                        color="#B42318"
                        background="#FECDCA"
                      />
                    )}
                </div>
              ),
            },
            {
              key: "intake",
              header: "Intake",
              render: (applicant) => (
                <>
                  {applicant?.courseSelection?.session?.intakePeriod ? (
                    <p className="text-xs text-gray-500 capitalize">
                      {applicant?.courseSelection?.session?.intakePeriod}
                    </p>
                  ) : (
                    <p className="ml-3">-</p>
                  )}
                </>
              ),
            },
            {
              key: "awardingBody",
              header: "Awarding Body",
              render: (applicant) => (
                <>
                  {applicant?.courseSelection?.course?.course?.awardingBody
                    ?.name ? (
                    <p className="text-xs text-gray-500 capitalize">
                      {
                        applicant?.courseSelection?.course?.course?.awardingBody
                          ?.name
                      }
                    </p>
                  ) : (
                    <p className="ml-3">-</p>
                  )}
                </>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (applicant) => (
                <span className="flex gap-2 items-center py-1 px-2 text-xs rounded-full border w-fit border-[#DEE3E7]">
                  <span
                    className={`w-2 h-2 ${
                      applicant?.wellbeingCheckStatus === "REJECTED"
                        ? "bg-red-500"
                        : applicant?.wellbeingCheckStatus === "APPROVED"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    } rounded-full`}
                  />
                  {applicant?.wellbeingCheckStatus}
                </span>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (applicant) => (
                <ResponsiveButtonGroup>
                  {applicant?.wellbeingCheckStatus === "PENDING" ? (
                    <div
                      className={`flex gap-2 ${
                        !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <ActionButton
                        btnSize="sm"
                        variant="icon"
                        handleOpen={() =>
                          handleApproveReject(
                            applicant.id,
                            "APPROVED",
                            `${applicant.personalInformation?.firstName} ${applicant.personalInformation?.lastName}`
                          )
                        }
                        disabled={!hasPostAndDeletePermission}
                        btnStyle={
                          !hasPostAndDeletePermission ? "opacity-50" : ""
                        }
                        icon={<Check size={12} strokeWidth={3} color="green" />}
                      />

                      <ActionButton
                        btnSize="sm"
                        handleOpen={() =>
                          handleApproveReject(
                            applicant.id,
                            "REJECTED",
                            `${applicant.personalInformation?.firstName} ${applicant.personalInformation?.lastName}`
                          )
                        }
                        variant="icon"
                        icon={<X size={12} strokeWidth={3} color="red" />}
                        disabled={!hasPostAndDeletePermission}
                        btnStyle={
                          !hasPostAndDeletePermission ? "opacity-50" : ""
                        }
                      />
                    </div>
                  ) : (
                    <p className="ml-3">-</p>
                  )}
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
      />
      <WellBeingDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationInfo={applicationInfo}
      />

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        applicantId={selectedApplicantId}
        applicantName={selectedApplicantName}
        status={selectedStatus}
        token={token}
      />
    </>
  );
}
