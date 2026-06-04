/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import AssignForm from "./assignForm";
import ActionButton from "../../button/actionButton";
import { showToast } from "../../TostMessage/customTostMessage";

interface ApplicantProps {
  id: string;
  outcome: string;
  personalInformation?: {
    firstName: string;
    lastName: string;
  };
  stage?: string;
  status?: string;
  wellbeingStatus: string;
}

interface Props {
  applicationInfo: ApplicantProps[];
  assignment?: any;
  assignmentLoading?: boolean;
  // isWellbeing?: boolean;
}

export function AssignDialog({
  //  isWellbeing,
  applicationInfo,
  assignment,
  assignmentLoading,
}: Props) {
  const { user, editAccess } = useAuths();
  const applicationId = applicationInfo?.map((info) => info.id);

  const assignTo = assignment
    ? {
        id: assignment?.assignedTo?.id,
        firstName: assignment?.assignedTo?.userPortalCategory?.user?.firstName,
        lastName: assignment?.assignedTo?.userPortalCategory?.user?.lastName,
      }
    : null;

  const [searchText, setSearchText] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const { data, isLoading } = useFetchData({
    queryKey: "fetch-list-of-admission-officers",
    path: `admission/assigns/admission-officers`,
    method: "GET",
    filterData: {
      searchTerm: searchText,
    },
  });

  // Unified approval statuses
  const APPROVAL_STATUSES = [
    "APPROVED_UNCONDITIONAL",
    "APPROVED_CONDITIONAL",
    "APPROVED",
    "OUTCOME",
  ];

  const checkApprovedApplicants = (applicants: ApplicantProps[]) => {
    // Find all approved applicants (based on outcome OR stage)
    const approvedApplicants = applicants
      .filter((a) => APPROVAL_STATUSES.includes(a.stage ?? a.outcome))
      .map(
        (a) =>
          a?.personalInformation?.firstName +
          " " +
          a?.personalInformation?.lastName,
      );

    // Generate messages
    const messages: string[] = [];

    if (approvedApplicants.length > 0) {
      messages.push(`${approvedApplicants.join(", ")} already approved.`);
    }

    // If any message exists, show error toast
    if (messages.length > 0) {
      showToast("error", messages.join(" "));
      return;
    }

    // Otherwise allow opening dialog
    setIsOpenDialog(true);
  };

  // Is ANY applicant approved?
  const isApproved = applicationInfo?.some((a) =>
    APPROVAL_STATUSES.includes(a.outcome ?? a.stage),
  );

  return (
    <>
      {/* Dialog Trigger */}
      {assignmentLoading ? (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : assignment ? (
        <ActionButton
          handleOpen={() => checkApprovedApplicants(applicationInfo)}
          type="button"
          btnSize="lg"
          disabled={!editAccess || isApproved}
          buttonContent="Edit"
          icon={<CiEdit strokeWidth={1.5} size={16} />}
        />
      ) : (
        <ActionButton
          disabled={applicationId.length < 1 || !editAccess}
          btnSize="lg"
          handleOpen={() => checkApprovedApplicants(applicationInfo)}
          variant="primary"
          icon={<Plus strokeWidth={3} size={16} />}
          buttonContent="Assign"
        />
      )}

      {/* Dialog Content */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <AssignForm
            applicationId={applicationId}
            assignTo={assignTo}
            setIsOpenDialog={setIsOpenDialog}
            assignToUser={data?.data?.admissionOfficers}
            searchText={searchText}
            setSearchText={setSearchText}
            user={user}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
