/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

interface ApprovedDialogProps {
  generalFileCheckStatus: string;
}

export default function GeneralApprovedDialog({ user, open, setOpen }: any) {
  const params = useParams();
  const auth = useAuths();
  const token = auth?.user?.token;
  const queryClient = useQueryClient();

  const updateApplicationMutation = useApiMutation({
    // safe: false,
    path: `admission/profile/application/${params.slug}`,
    method: "POST",
    onSuccess: (data) => {
      setOpen(false);
      if (data?.statusCode === 200) {
        showToast("success", "Successfully updated!");
        queryClient.invalidateQueries({
          queryKey: ["single-application-data"],
        });
      } else {
        showToast("error", data?.message || "Something went wrong!");
      }
    },
    onError: (error) => {
      showToast("error", error || "Something went wrong!");
    },
  });

  const handleApprove = () => {
    if (!params?.slug || !token) {
      toast.error("Missing user ID or token.");
      return;
    }

    const updateBody = {
      generalFileCheckStatus: "APPROVED",
      stage: "CHECK",
    };

    updateApplicationMutation.mutate(updateBody);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="hidden mr-4">
        <Button variant="outline">Confirm General Check</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proceed for General Check</DialogTitle>
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
