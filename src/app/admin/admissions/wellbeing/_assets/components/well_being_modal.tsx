/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuths } from "@/hooks/userContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { Document } from "./page_component/modal_components/document";
import { Notes } from "./page_component/modal_components/notes";
import { Record } from "./page_component/modal_components/record";

import { Button } from "@/components/ui/custom_ui/button";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { Check, X } from "lucide-react";
import { TbCheck } from "react-icons/tb";
import ConfirmationDialog from "./page_component/modal_components/confirmation_dialog";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";

interface WellBeingModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationInfo: any;
}

interface Applicant {
  id: string;
  status: string;
  stage: string;
  wellbeingCheckStatus: string;
  generalFileCheckStatus: string;
  additionalFileCheckStatus: string;
  interviewOutcome: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  personalInformation: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    countryOfBirth: string;
    currentNationality: string;
    sex: string;
    currentAddress: string;
    nationalIdentityNumber: string;
    applicationInfo: string;
    createdAt: string;
    updatedAt: string;
  };
  personalStatement: {
    id: string;
    statement: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  academicBackground: {
    id: string;
    highestLevelOfQualification: string;
    areaOfQualification: string;
    gradeOrResult: string;
    yearCompleted: string;
    countryOfIssue: string;
    institutionName: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  courseSelection: {
    id: string;
    faculty: string;
    course: string;
    intake: string;
    yearOfCourse: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  disabilityAndAccessibility: {
    id: string;
    disabilityAndAccessibility: string[];
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  nextOfKin: {
    id: string;
    relationship: string;
    fullName: string;
    phoneOrMobile: string;
    address: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  fund: {
    id: string;
    source: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  criminalBackground: {
    id: string;
    offenseOrPenalty: string;
    offenseOrPenaltyDetails: string;
    disqualificationOrSanction: string;
    disqualificationOrSanctionDetails: string;
    policeClearance: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  supportingDocument: {
    id: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
    supportingDocumentAttachments: {
      id: string;
      supportingDocumentId: string;
      attachmentId: string;
      name: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      attachment: {
        id: string;
        paths: string[];
        createdAt: string;
        updatedAt: string;
      };
    }[];
  };
  applicationNotes: any[]; // Adjust this based on actual structure
}

export const WellBeingDialog = ({
  isOpen,
  onClose,
  applicationInfo,
}: WellBeingModalProps) => {
  console.log("applicationInfo", applicationInfo?.wellbeingCheckStatus);

  const [confirmationDialogIsOpen, setConfirmationDialogIsOpen] =
    useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  );
  const [selectedApplicantName, setSelectedApplicantName] = useState<
    string | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);

  const auth = useAuths();
  const token = auth?.user?.token as string;

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";
  //  const queryClient = useQueryClient();

  const handleStatusChange = (
    applicantInfo: Applicant,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (!applicationInfo?.id) {
      toast.error("Invalid Application ID");
      return;
    }
    setSelectedApplicantId(applicantInfo?.id);
    const applicantFullName =
      applicantInfo?.personalInformation?.firstName +
      " " +
      applicantInfo?.personalInformation?.lastName;
    setSelectedApplicantName(applicantFullName);
    setSelectedStatus(status);
    setConfirmationDialogIsOpen(true);
    // onClose();
  };
  // console.log("Data in Well being Dialog for application", applicationInfo);

  return (
    <DialogWrapper
      open={isOpen}
      handleOpen={onClose}
      title="WellBeing"
      style="overflow-y-auto w-[90vw] h-[90vh] xl:w-[80vw]"
    >
      <div className="flex flex-col mt-5 space-y-4">
        <Record application={applicationInfo} />
        <Document
          applicationId={applicationInfo}
          hasPostAndDeletePermission={hasPostAndDeletePermission}
        />
        <Notes applicationId={applicationInfo} />

        {applicationInfo?.wellbeingCheckStatus === "PENDING" && (
          <>
            <div className="flex flex-col gap-4 p-3 rounded-t-md border border-[#DEE3E7]">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h1 className="font-semibold text-black text-[18px]">
                    Approval
                  </h1>
                  <p className="font-medium text-gray-500">
                    Would you like to approve this student profile ?
                  </p>
                </div>

                <div
                  className={`flex gap-2 ${
                    !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
                  }`}
                >
                  <Button
                    variant="confirm"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(applicationInfo, "APPROVED")
                    }
                    disabled={!hasPostAndDeletePermission}
                    className={
                      !hasPostAndDeletePermission
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <Check size={12} strokeWidth={3} color="green" />
                  </Button>

                  <Button
                    variant="cancel"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(applicationInfo, "REJECTED")
                    }
                    disabled={!hasPostAndDeletePermission}
                    className={
                      !hasPostAndDeletePermission
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <X size={12} strokeWidth={3} color="red" />
                  </Button>
                </div>
              </div>
            </div>

            <ActionButton
              handleOpen={() => handleStatusChange(applicationInfo, "APPROVED")}
              disabled={!hasPostAndDeletePermission}
              btnStyle={`flex justify-center items-center self-end p-3 text-white rounded-md bg-[#013E5B] ${
                !hasPostAndDeletePermission
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              icon={<TbCheck className="mr-2 w-6 h-6" />}
              buttonContent="Mark As Checked"
            />
          </>
        )}
      </div>
      <ConfirmationDialog
        isOpen={confirmationDialogIsOpen}
        onClose={() => setConfirmationDialogIsOpen(false)}
        parentDialogClose={onClose}
        applicantId={selectedApplicantId}
        applicantName={selectedApplicantName}
        status={selectedStatus}
        token={token}
      />
    </DialogWrapper>
  );
};
