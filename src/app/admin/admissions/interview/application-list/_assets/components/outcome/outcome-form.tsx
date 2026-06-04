/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";
import { useState } from "react";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import BookInterview from "@/components/common/dialog/InterviewBooking/InterviewBookingModal";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useQueryClient } from "@tanstack/react-query";
import { ApplicantInfo } from "./applicant-info";
import InterviewInfo from "./interview-info";
import { OutcomeSelector } from "./outcome-selector";
import ActionButton from "@/components/common/button/actionButton";
import { Calendar } from "lucide-react";
import { InterviewHistory } from "./interview-history";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

export function OutComeForm({ applications, isLoading, pagination }: any) {
  const [outcomes, setOutcomes] = useState<Record<number, string>>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [applicantInfo, setApplicationInfo] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);

  const matchedModule = useMatchedModule();
  const accessLevel = getUserAccess(matchedModule?.modulePermission || []);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  const queryClient = useQueryClient();

  const outComeMutation = useApiMutation({
    method: "POST",
    path: `interview/interview-outcome/${applicantInfo?.id}`,
    onSuccess: (data) => {
      setOutcomes({});
      queryClient.invalidateQueries({ queryKey: ["interview-calendar"] });
      queryClient.invalidateQueries({
        queryKey: ["interview-able-applicants"],
      });
      queryClient.invalidateQueries({ queryKey: ["applicant-interview-data"] });
      showToast("success", data || "Outcome saved successfully");
    },
  });

  const onOutcomeSubmit = (idx: number, applicationInfo: any) => {
    console.log(idx, "Submit applicationInfo", applicationInfo);
    setApplicationInfo(applicationInfo);
    outComeMutation.mutate({
      outcome: outcomes[idx],
    });
  };

  // Define table configuration
  const tableConfig = {
    columns: [
      {
        key: "applicationDetail",
        header: "Application Detail",
        render: (row: any) => <ApplicantInfo applicant={row} />,
      },
      {
        key: "interviewDetails",
        header: "Interview Details",
        render: (row: any) => (
          <InterviewInfo interviewInfo={row.interviews?.[0]} />
        ),
      },
      {
        key: "interviewHistory",
        header: "Interview History",
        render: (row: any) => {
          const history =
            row.interviews[0]?.status === "PENDING"
              ? row.interviews.slice(1)
              : row.interviews;
          return <InterviewHistory histories={history || []} />;
        },
      },
      {
        key: "interviewOutcome",
        header: "Interview Outcome",
        render: (row: any, idx: number) => {
          const interviewStatus = row.interviews?.[0]?.status;
          const hasPassed = interviewStatus === "PASS";
          const hasBooked = interviewStatus === "PENDING";
          const disabled = hasPassed || !hasPostAndDeletePermission;

          return (
            <div className="space-y-4 min-w-[100px]">
              {/* Book Interview Button */}
              <ActionButton
                disabled={disabled || hasBooked}
                buttonContent="Book Interview"
                handleOpen={() => {
                  setApplicationInfo(row);
                  setIsBookingOpen(true);
                }}
                variant="primary"
                btnStyle={disabled ? "opacity-50 cursor-not-allowed" : ""}
                icon={<Calendar />}
              />

              {interviewStatus === "PENDING" && (
                <>
                  <OutcomeSelector
                    value={outcomes[idx]}
                    onValueChange={(value: string) =>
                      setOutcomes((prev) => ({ ...prev, [idx]: value }))
                    }
                    disabled={disabled}
                  />

                  {outcomes[idx] && (
                    <ActionButton
                      type="submit"
                      isPending={outComeMutation?.isPending}
                      variant="success"
                      disabled={!hasPostAndDeletePermission}
                      handleOpen={() => onOutcomeSubmit(idx, row)}
                      buttonContent="Save Outcome"
                    />
                  )}
                </>
              )}
            </div>
          );
        },
      },
    ],
  };

  return (
    <>
      {/* Book Interview Modal */}
      {isBookingOpen && (
        <BookInterview
          applicationInfo={applicantInfo}
          isBookingOpen={isBookingOpen}
          setIsBookingOpen={setIsBookingOpen}
        />
      )}

      <DynamicTableWithPagination
        data={applications}
        isLoading={isLoading}
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={tableConfig}
      />
    </>
  );
}
