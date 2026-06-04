/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getApplicantNoteController } from "@/app/admin/admissions/admission/[slug]/notes/_assets/queryClient/queryController";
import SingleNoteComponent from "@/components/common/note_component/singleNote";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { HiPlusSm } from "react-icons/hi";
import { AddNote } from "./AddNote";

export const Notes = ({ applicationId }: any) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [publicNotePage, setPublicNotePage] = useState(1);

  const handleOpenDialog = (id: string) => {
    setSelectedApplicationId(id);
    setIsOpenDialog(true);
  };

  const queryResults = useQueries({
    queries: [
      {
        queryKey: [
          "get-applicant-public-note",
          token,
          applicationId?.id,
          "PUBLIC",
          publicNotePage,
        ],
        queryFn: getApplicantNoteController,
        enabled: !!token && !!applicationId?.id,
      },
    ],
  });

  const notesQuery = queryResults[0];
  const notesData = queryResults[0]?.data;
  const isLoading = queryResults[0]?.isLoading;
  const isError = queryResults[0]?.isError;

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 p-3 rounded-t-md border border-[#DEE3E7]">
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-black text-[18px]">All Notes</h1>
          <button
            onClick={() => handleOpenDialog(applicationId?.id)}
            disabled={!hasPostAndDeletePermission || ["APPROVED", "REJECTED"].includes(
              applicationId?.wellbeingCheckStatus?.toUpperCase()?.trim() ?? ""
            )}
            className={`inline-flex items-center py-1.5 px-2 text-sm rounded-md border border-gray-300 text-[#272E35] transition ${
              hasPostAndDeletePermission &&
              !["APPROVED", "REJECTED"].includes(
                applicationId?.wellbeingCheckStatus?.toUpperCase()?.trim() ?? ""
              )
                ? "hover:bg-gray-100"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <HiPlusSm size={25} />
            Add Notes
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-3 rounded-md border border-[#DEE3E7] text-gray-500">
              <p>Loading notes...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col gap-2 p-3 rounded-md border border-[#F5C2C7] bg-[#F8D7DA] text-[#842029]">
              <p>Failed to load notes. Please try again.</p>
            </div>
          ) : notesData?.data?.applicationNotes?.length > 0 ? (
            notesData.data.applicationNotes.map((item: any) => (
              <SingleNoteComponent key={item?.id} item={item} />
            ))
          ) : (
            <div className="flex flex-col gap-2 p-3 rounded-md border border-[#DEE3E7]">
              <p className="font-medium tracking-normal leading-4">
                No Notes Available
              </p>
            </div>
          )}
        </div>

        {token && (
          <AddNote
            token={token}
            applicationId={selectedApplicationId}
            isOpen={isOpenDialog}
            onClose={() => setIsOpenDialog(false)}
            onSuccess={() => notesQuery.refetch()}
          />
        )}
      </div>
    </div>
  );
};
