/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQueryClient } from "@tanstack/react-query";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { OutComeForm } from "./outcome_form";

interface InterviewDetailsProps {
  isLoading: boolean;
  data: any;
  searchTerm?: string;
}

const PreScreeningDetails = ({ data, isLoading }: InterviewDetailsProps) => {
  const queryClient = useQueryClient();

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["list-of-pre-screening-applicants-data"],
    });
  };

  return (
    <div className="">
      <div>
        <div className="grid grid-cols-4 gap-4 p-4 text-sm bg-[#EAEDF0]">
          <p>Interview Details</p>
          <p>Application Details</p>
          <p>Pre-Screening History</p>
          <p>Pre-Screening Outcome</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-230px)]">
            <DataLoader />
          </div>
        ) : data?.applications?.length === 0 ? (
          <div className="relative mt-40">
            <NoDataComponent />
          </div>
        ) : (
          <OutComeForm
            isLoading={isLoading}
            applications={data?.applications}
            onOutcomeSubmit={handleMutationSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default PreScreeningDetails;
