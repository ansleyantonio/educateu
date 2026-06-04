/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
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
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
// import { fetchAllAdditionalCheckData } from "../../../../checks/_assets/queryClient/queryController";

export function AdditionalFileCheckModal({
  fieldName,
  applicationIid,
  refetch,
  isShow,
}: {
  fieldName: string;
  applicationIid: string;
  refetch: any;
  isShow: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = useAuths();
  const token = user?.user?.token;
  const queryClient = useQueryClient();
  const id = applicationIid;

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  //

  const { data, isLoading } = useFetchData({
    queryKey: "all-check-data",
    path: `additional-file-check/general-file-checks`,
    method: "GET",
    filterData: {
      applicationId: id,
    },
    enabled: !!id,
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["all-check-data", id, token],
  //   queryFn: fetchAllAdditionalCheckData,
  //   enabled: !!applicationIid,
  // });

  const statusFileVerify =
    data?.data?.generalFileChecks?.supportingDocumentAttachments?.find(
      (item: any) =>
        item.name === fieldName &&
        item.status == "NO_INFORMATION_REQUIRED_ADDITIONAL"
    )?.status;

  // console.log("statusFileVerify", statusFileVerify);
  // console.log("data---aa", data);

  const AdditionalFileCheckMutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/additional-file-check/general-file-checks/${applicationIid}`,
        data, // Note: Where is 'body' coming from? You might want to use 'newApplication' here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: (data: any) => {
      // queryClient.invalidateQueries({
      //   queryKey: ["single-application-data"],
      // });
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
        status: "NO_INFORMATION_REQUIRED_ADDITIONAL",
      },
    ];
    AdditionalFileCheckMutation.mutate(body);
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
            {isShow && (
              <>
                {/* <InformationRequiredModal
                  fieldName={fieldName}
                  applicationIid={applicationIid}
                /> */}

                <DialogTrigger asChild className="">
                  <Button
                    size="sm"
                    variant="outline"
                    // className={`capitalize ${
                    //   statusFileVerify && "border border-green-400"
                    // }`}
                    // disabled={statusFileVerify}
                    className={`capitalize ${
                      statusFileVerify ? "border border-green-400" : ""
                    } ${
                      !hasPostAndDeletePermission
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={statusFileVerify || !hasPostAndDeletePermission}
                  >
                    {statusFileVerify ? "Verified" : "Verify"}
                  </Button>
                </DialogTrigger>
              </>
            )}
          </div>
        </div>
      </div>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Additional File Check
          </DialogTitle>
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
            disabled={AdditionalFileCheckMutation.isPending}
            type="button"
          >
            {AdditionalFileCheckMutation.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
