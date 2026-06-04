/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import ExpandableText from "@/utils/EnabledText";
import { StatusWithIcon } from "@/utils/status_point";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CircleCheck,
  CircleCheckBig,
  CirclePlus,
} from "lucide-react";
import { useState } from "react";

interface assessmentProps {
  assessment: any;
  id: string;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  assignedData: Array<any>;
}

const AssignAssessmentsModal = ({
  assignedData,
  setIsWaiting,
  assessment,
  id,
}: assessmentProps) => {
  const [open, setOpen] = useState(false);
  const isAssigned = assignedData?.find(
    (item: any) => item?.id === assessment?.id,
  );

  const queryClient = useQueryClient();

  const assignAssessmentMutation = useApiMutation({
    method: "POST",
    path: "course-modules/assign-assessment",
    onSuccess: (data: any) => {
      setIsWaiting(false);
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-assigned-contents"],
      });
      showToast("success", data);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
        setIsWaiting(false);
        setOpen(false);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit() {
    setIsWaiting(true);
    const body = { moduleId: id, assessmentId: assessment?.id };
    assignAssessmentMutation.mutate(body);
  }

  return (
    <DialogWrapper
      handleOpen={() => setOpen(true)}
      closer={false}
      open={open}
      triggerContent={
        <ActionButton
          variant="primaryIcon"
          disabled={isAssigned}
          icon={isAssigned ? <CircleCheckBig /> : <CirclePlus />}
          tooltipContent="Assign to Module"
          handleOpen={() => {
            setOpen(true);
          }}
        />
      }
      style="p-2  md:min-w-[500px]"
    >
      <div className="space-y-6">
        {/* Top Section */}
        {/* Left Section */}
        <div className="flex-1 space-y-3">
          {/* Icon + Title */}
          <div className="flex gap-3 items-center text-[#008994]">
            {/* Icon */}
            <div className="p-3 rounded-xl shadow-inner bg-[#E1F1F2] shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>

            {/* Title and Code */}
            <div className="min-w-0">
              <h3 className="text-xl font-bold leading-snug sm:text-2xl text-[#008994] truncate">
                {assessment?.nameOrTitle}
              </h3>
              <p className="text-sm font-medium sm:text-base text-muted-foreground truncate">
                {assessment?.assessmentCode}
              </p>
            </div>
          </div>

          {/* Description */}
          {assessment?.descriptionOrInstructions && (
            <div className="text-sm text-gray-600">
              <ExpandableText text={assessment?.descriptionOrInstructions} />
            </div>
          )}

          {/* Module Details */}
          <div className="flex flex-wrap gap-3 text-sm">
            <StatusWithIcon
              label="Est. Time"
              status={assessment?.timeLimit.toString()}
              className="!text-blue-500 !bg-blue-100"
              showBg={true}
              lastLabel={"day"}
            />
            <StatusWithIcon
              label="Type"
              status={assessment?.assessmentType}
              showBg={true}
              className="!text-purple-700 !bg-purple-100 !border-purple-200"
            />
          </div>
        </div>

        {/* Confirmation Text */}
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          Are you sure you want to assign{" "}
          <span className="font-semibold text-[#008994]">
            {assessment?.nameOrTitle}
          </span>{" "}
          assessment ?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-3 justify-end mt-6 sm:flex-row">
          <ActionButton
            handleOpen={() => setOpen(false)}
            variant="outline"
            buttonContent="Cancel"
          />
          <ActionButton
            handleOpen={() => onSubmit()}
            buttonContent="Assign"
            isPending={assignAssessmentMutation?.isPending}
            loadingContent="Assigning..."
            icon={<CircleCheck />}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default AssignAssessmentsModal;
