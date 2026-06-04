/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function GeneralFileCheckModal({
  fieldName,
  applicationIid,
  refetch,
  isShow,
  check,
}: {
  fieldName: string;
  applicationIid: string;
  refetch: any;
  isShow: boolean;
  check: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = useAuths();
  const token = user?.user?.token;
  const queryClient = useQueryClient();

  const matchedModule = useMatchedModule();

  const hasPostAndDeletePermission =
    matchedModule?.modulePermission.includes("POST") ||
    matchedModule?.modulePermission.includes("DELETE");
  // const id = applicationIid;
  //
  // const { data, isLoading } = useQuery({
  //   queryKey: ["all-check-data", id, token],
  //   queryFn: fetchAllCheckData,
  //   enabled: !!applicationIid,
  // });

  // const statusFileVerify =
  //   data?.data?.generalFileChecks?.supportingDocumentAttachments?.find(
  //     (item: any) =>
  //       item.name === fieldName && item.status == "NO_INFORMATION_REQUIRED"
  //   )?.status;

  // console.log("statusFileVerify", statusFileVerify);
  // console.log("data---aa", data);

  const generalFileCheckMutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admission/checks/general-file-checks/${applicationIid}`,
        data, // Note: Where is 'body' coming from? You might want to use 'newApplication' here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["single--file-check-data"],
      });
      console.log("data verify", data);
      refetch();
      if (data?.data?.statusCode === 200) {
        toast.success(data?.data?.message || "Update successful");

        setIsDialogOpen(false);
      } else {
        // console.log("data------", data);
        toast.error(data?.data?.message || "Update failed --");
      }
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        if (
          error.response?.data?.message ==
          "Cannot update general file check status after approval"
        ) {
          toast.error("This file  Already approved ");
        } else {
          toast.error(error.response?.data?.message);
        }
      } else {
        toast.error(error.message || "An error occurred");
      }
    },
  });
  const FileHandelConfirm = () => {
    const body = [
      {
        attachmentName: fieldName,
        status: "NO_INFORMATION_REQUIRED",
      },
    ];
    generalFileCheckMutation.mutate(body);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div>
        <div className="flex justify-between items-center w-full">
          {/* <label className="flex justify-normal items-center gap-x-2 tracking-wide text-[15px] leading-6 font-extrabold text-black capitalize">
            {fieldName}
            {statusFileVerify && (
              <BadgeCheck className="text-green-400 w-5 h-5" />
            )}
          </label> */}
          <div className="flex justify-start gap-x-2 items-center">
            {/* {isShow && ( */}
            <>
              {/* {!check && (
                  <InformationRequiredModal
                    fieldName={fieldName}
                    applicationIid={applicationIid}
                  />
                )} */}

              <DialogTrigger asChild className="">
                <Button
                  size="sm"
                  variant="outline"
                  className={`capitalize`}
                  disabled={!hasPostAndDeletePermission}
                >
                  {"Verify"}
                </Button>
              </DialogTrigger>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="capitalize">General File Check</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed? This action is final and
            cannot be reversed
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 "></div>
        <DialogFooter>
          <Button
            onClick={() => setIsDialogOpen(false)}
            className="capitalize"
            size={"sm"}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={FileHandelConfirm}
            className="capitalize"
            size={"sm"}
            disabled={generalFileCheckMutation.isPending}
            type="button"
          >
            {generalFileCheckMutation.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
