/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState } from "react";
import type React from "react";

import { GoDotFill } from "react-icons/go";
import profile from "/public/assets/icons/prescrenning/profile.svg";
import calendar from "/public/assets/icons/prescrenning/calendar.svg";
import cell from "/public/assets/icons/prescrenning/cell.svg";
import circle from "/public/assets/icons/prescrenning/circel.svg";
import clock from "/public/assets/icons/prescrenning/clock.svg";
import email from "/public/assets/icons/prescrenning/email.svg";
import grad_cap from "/public/assets/icons/prescrenning/grad_cap.svg";
import location from "/public/assets/icons/prescrenning/location.svg";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { outComeController } from "../query_controller/outComeController";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuths } from "@/hooks/userContext";
import Image from "next/image";
import type { OutComeFormProps, OutcomeOption } from "../interface/interface";
import dateFormat from "@/utils/DateFormatter";

const OUTCOME_OPTIONS = [
  { value: "pass", label: "Passed" },
  { value: "fail", label: "Failed" },
];

export function OutComeForm({
  interviews,
  isLoading,
  onOutcomeSubmit,
}: OutComeFormProps) {
  const auth = useAuths();
  const [outcomes, setOutcomes] = useState<Record<number, string>>({});

  const handleSubmit = async (
    e: React.FormEvent,
    applicationId: string,
    idx: number,
  ) => {
    e.preventDefault();
    if (!auth?.user?.token) {
      console.warn("User token not available");
      return;
    }

    const outcome = outcomes[idx] ?? "did_not_pick_up";

    try {
      const result = await outComeController({
        token: auth.user.token,
        data: {
          applicationId: applicationId,
          outcome: `${outcome.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}.`,
          template: "",
          description: "",
        },
      });

      if (result.statusCode === 200) {
        toast.success(result.message);
        onOutcomeSubmit();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to save outcome");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-230px)]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (interviews.length === 0) {
    return <span>No data found</span>;
  }

  return (
    <>
      {interviews.map((interview, idx) => {
        const applicant = interview.application;
        const hasPassed = applicant.preScreeningHistories?.some(
          (h) => h.outcome.trim().toLowerCase() === "pre screening passed.",
        );

        return (
          <div key={interview.id}>
            <form
              className="grid grid-cols-4 gap-6 p-6 bg-white rounded-md shadow"
              onSubmit={(e) => handleSubmit(e, applicant.id, idx)}
            >
              {/* Personal Details */}
              <div className="space-y-4">
                <InfoItem
                  icon={profile}
                  text={`${applicant.personalInformation.firstName} ${applicant.personalInformation.lastName}`}
                />
                <InfoItem
                  icon={grad_cap}
                  text="N/A" // academicBackground is not in the provided data structure
                />
                <InfoItem
                  icon={cell}
                  text={applicant.personalInformation.mobileNumber}
                />
                <InfoItem
                  icon={email}
                  text={applicant.personalInformation.email}
                />
              </div>

              {/* Interview Info */}
              <div className="space-y-4">
                <InfoItem
                  icon={calendar}
                  text={dateFormat.toMonthYear(interview.interviewDate)}
                />
                <InfoItem
                  icon={clock}
                  text={`${dateFormat.time12h(interview.startTime)} - ${dateFormat.time12h(interview.endTime)}`}
                />
                <InfoItem icon={location} text="N/A" />
                <StatusIndicator status="Booked" />
              </div>

              {/* Screening History */}
              <div className="space-y-2">
                {applicant.preScreeningHistories?.length ? (
                  applicant.preScreeningHistories.map((history) => (
                    <HistoryItem key={history.id} history={history} />
                  ))
                ) : (
                  <p className="py-1 px-2 text-sm text-center text-red-600 bg-red-200 rounded-md">
                    No Pre-Screening History
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {/* Submit Button */}
                <Button type="submit" variant="success" disabled={hasPassed}>
                  Book an interview
                </Button>

                {/* Outcome Form */}
                <SelectField
                  label="Select Outcome"
                  value={outcomes[idx] ?? "did_not_pick_up"}
                  onValueChange={(value: string) =>
                    setOutcomes((prev) => ({ ...prev, [idx]: value }))
                  }
                  options={OUTCOME_OPTIONS}
                  disabled={hasPassed}
                />
              </div>
            </form>
            <hr className="my-4" />
          </div>
        );
      })}
    </>
  );
}

// Helper Components with proper typing
interface InfoItemProps {
  icon: any;
  text: string;
}

const InfoItem = ({ icon, text }: InfoItemProps) => (
  <div className="flex gap-2 items-center">
    <Image src={icon || "/placeholder.svg"} width={20} height={20} alt="icon" />
    <p>{text ? text : "N/A"}</p>
  </div>
);

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => (
  <div className="flex gap-2 items-center">
    <Image
      src={circle || "/placeholder.svg"}
      width={20}
      height={20}
      alt="status"
    />
    <div className="flex gap-2 items-center py-1 px-2 rounded-md bg-[#C6F1DA]">
      <GoDotFill className="text-[#1D7C4D]" />
      <p className="font-medium text-[#1D7C4D]">{status}</p>
    </div>
  </div>
);

interface HistoryItemProps {
  history: {
    id: string;
    outcome: string;
    createdAt: string;
    createdBy: {
      userPortalCategory: {
        user: {
          firstName: string;
          lastName: string;
        };
      };
    };
  };
}

const HistoryItem = ({ history }: HistoryItemProps) => {
  const isPassed =
    history.outcome.trim().toLowerCase() === "pre screening passed.";
  const user = history?.createdBy?.userPortalCategory?.user;

  return (
    <p
      className={`py-1 px-2 text-sm text-center rounded-md ${
        isPassed ? "text-green-700 bg-green-100" : "text-gray-700 bg-gray-100"
      }`}
    >
      {history?.outcome} on {dateFormat.toMonthYear(history?.createdAt)} by{" "}
      {user?.firstName} {user?.lastName}
    </p>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: OutcomeOption[];
  disabled?: boolean;
}

const SelectField = ({
  label,
  value,
  onValueChange,
  options,
  disabled = false,
}: SelectFieldProps) => (
  <div>
    <label className="block mb-2 text-sm font-medium">{label}</label>
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option: OutcomeOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
