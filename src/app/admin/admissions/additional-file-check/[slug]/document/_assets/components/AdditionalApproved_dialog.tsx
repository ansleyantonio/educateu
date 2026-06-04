/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

interface ApprovedDialogProps {
  additionalFileCheckStatus: string;
}

export default function AdditionalApprovedDialog({ user, open, setOpen }: any) {
  const params = useParams();
  const auth = useAuths();
  const token = auth?.user?.token;
  const queryClient = useQueryClient();

  // console.log("user in approved token", user);
  // console.log("user in approved id", params.slug);

  const updateApplicationMutation = useMutation({
    mutationFn: (newApplication: ApprovedDialogProps) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admission/profile/application/${params.slug}`,
        newApplication,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },

    onSuccess: (data: any) => {
      setOpen(false);
      if (data?.data?.statusCode === 200) {
        toast.success("Successfully updated profile!");
        queryClient.invalidateQueries({
          queryKey: ["single-application-data"],
        });
      }
      // toast.error(data?.message);
    },
    onError: (error) => {
      toast.error("Failed to updated profile!");
    },
  });

  const handleApprove = () => {
    if (!params?.slug || !token) {
      toast.error("Missing user ID or token.");
      return;
    }

    const updateBody = {
      additionalFileCheckStatus: "APPROVED",
      // stage: "CHECK",
    };

    updateApplicationMutation.mutate(updateBody);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="mr-4 hidden">
        <Button variant="outline">Confirm Additional Check</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proceed for Additional Check</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            Please confirm that you have reviewed and verified all the
            required documents.
          </p>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              // disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={updateApplicationMutation.isPending}
            >
              {updateApplicationMutation.isPending ? (
                <>
                  Confirm...
                  <Loader className="mr-2 w-4 h-4 animate-spin" />
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
