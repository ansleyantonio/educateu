/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import AssignForm from "./assignForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchListOfAdmissionOfficers } from "../../../queryClient/queryController";
import { useAuths } from "@/hooks/userContext";
import { CiEdit } from "react-icons/ci";

interface Props {
  assignment?: any;
  assignmentLoading: boolean;
}

export function AssignDialog({ assignment, assignmentLoading }: Props) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const user = auth?.user;

  const assignTo = assignment
    ? {
        id: assignment?.assignedTo?.id,
        firstName: assignment?.assignedTo?.firstName,
        lastName: assignment?.assignedTo?.lastName,
      }
    : null;

  // console.log(assignment);

  const [searchText, setSearchText] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-list-of-admission-officers", token, searchText],
    queryFn: fetchListOfAdmissionOfficers,
    enabled: !!searchText,
  });

  return (
    <>
      {/* Dialog Trigger */}
      {assignmentLoading ? (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : assignment ? (
        <Button
          onClick={() => setIsOpenDialog(true)}
          variant="outline"
          className="mr-3"
        >
          <CiEdit /> Edit
        </Button>
      ) : (
        <Button onClick={() => setIsOpenDialog(true)} variant="primary">
          <Plus className="mr-2" size={16} /> Assign
        </Button>
      )}

      {/* Dialog Content */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {token && (
            <AssignForm
              assignTo={assignTo}
              setIsOpenDialog={setIsOpenDialog}
              assignToUser={data?.data?.admissionOfficers}
              searchText={searchText}
              setSearchText={setSearchText}
              user={user}
              token={token}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
