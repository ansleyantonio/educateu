/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/table";
import dateFormat from "@/utils/DateFormatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { OutcomeFormValues, OutcomeSchema } from "./outcomeSchema";
import { DialogWrapper } from "../common_dialog/common_dialog";
import { showToast } from "../../TostMessage/customTostMessage";
import ActionButton from "../../button/actionButton";
import { StatusWithIcon } from "@/utils/status_point";
import { useState } from "react";
import { OutcomeSelect } from "./OutcomeSelect";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

// Types
export type Interview = {
  id: string;
  applicationId: string;
  title: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  platform: string;
  guests: string[];
  status: string;
  color: string;
  applicant: string;
  interviewer: string;
  bookedBy: string;
};

export type CalendarDay = {
  day: number;
  name: string;
  weekday: number;
  monthName: string;
  year: number;
  dateString: string;
  interviews: Interview[] | [];
};

interface InterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewData: CalendarDay | null;
}

export const InterviewListDialog = ({
  open,
  onOpenChange,
  interviewData,
}: InterviewDialogProps) => {
  const [applicantId, setApplicantId] = useState<string>("");
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const form = useForm<OutcomeFormValues>({
    resolver: zodResolver(OutcomeSchema),
    defaultValues: { outcomes: {} },
  });

  const { handleSubmit } = form;

  const outComeMutation = useApiMutation({
    method: "POST",
    path: `interview/interview-outcome/${applicantId}`,
    onSuccess: (data: any) => {
      form.reset({});
      onOpenChange(false);
      setOutcomes({});
      queryClient.invalidateQueries({ queryKey: ["interview-calendar"] });
      queryClient.invalidateQueries({
        queryKey: ["interview-able-applicants"],
      });
      queryClient.invalidateQueries({ queryKey: ["applicant-interview-data"] });

      showToast("success", data);
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  const handleOutcomeSubmit = (interviewId: string) => {
    setApplicantId(interviewId);
    const data = outcomes[interviewId];
    outComeMutation.mutate({ outcome: data });
  };

  return (
    <DialogWrapper
      open={open}
      handleOpen={onOpenChange}
      title={
        <p>
          {" "}
          Interviews on{" "}
          {interviewData?.dateString &&
            new Date(interviewData.dateString).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </p>
      }
      style="w-[80vw]"
    >
      <div className="overflow-x-auto">
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit((data) => console.log(data))}
            className="space-y-4"
          >
            <Card>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {[
                      "Date",
                      "Time",
                      "Applicant",
                      "ID",
                      "Booked By",
                      "Interviewer",
                      "Outcome",
                    ].map((head) => (
                      <TableHead key={head}>{head}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviewData?.interviews?.length ? (
                    interviewData.interviews.map(
                      ({
                        id,
                        applicationId,
                        startTime,
                        endTime,
                        status,
                        interviewDate,
                        applicant,
                        bookedBy,
                        interviewer,
                      }) => {
                        return (
                          <TableRow key={id}>
                            <TableCell>
                              {dateFormat.fullDateTime(interviewDate, {
                                local: true,
                                showTime: false,
                              })}
                            </TableCell>
                            <TableCell>
                              <span>
                                {dateFormat.time12h(startTime, {
                                  local: true,
                                })}{" "}
                                -{" "}
                                {dateFormat.time12h(endTime, {
                                  local: true,
                                })}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize">
                              {applicant}
                            </TableCell>
                            <TableCell
                              className="max-w-[180px] truncate"
                              title={applicationId}
                            >
                              {applicationId}
                            </TableCell>
                            <TableCell className="capitalize">
                              {bookedBy}
                            </TableCell>
                            <TableCell className="capitalize">
                              {interviewer}
                            </TableCell>
                            <TableCell className="flex flex-col gap-2">
                              {status === "PENDING" ? (
                                <OutcomeSelect
                                  value={outcomes[applicationId]}
                                  onChange={(value: string) =>
                                    setOutcomes((prev) => ({
                                      ...prev,
                                      [applicationId]: value,
                                    }))
                                  }
                                  // disabled={disabled}
                                />
                              ) : (
                                <StatusWithIcon status={status} />
                              )}

                              {outcomes[applicationId] &&
                                status === "PENDING" && (
                                  <ActionButton
                                    type="button"
                                    variant="primary"
                                    btnSize="sm"
                                    isPending={
                                      applicantId == applicationId &&
                                      outComeMutation?.isPending
                                    }
                                    handleOpen={() =>
                                      handleOutcomeSubmit(applicationId)
                                    }
                                    buttonContent="Submit Outcome"
                                  />
                                )}
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500"
                      >
                        No Interview Details Available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </form>
        </FormProvider>
      </div>
    </DialogWrapper>
  );
};
