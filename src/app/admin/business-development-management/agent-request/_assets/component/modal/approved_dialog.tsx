"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentRequestProps, PendingAgent } from "../../type";
import { Button } from "@/components/ui/custom_ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ApproveAgentRequest } from "../../controller/queryRequest";
import { useAuths } from "@/hooks/userContext";
import { Loader } from "lucide-react";

interface ApprovedDialogProps {
  publishModalOpen: boolean;
  setPublishModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: PendingAgent | undefined;
}

export default function ApprovedDialog({
  publishModalOpen,
  setPublishModalOpen,
  user,
}: ApprovedDialogProps) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const queryClient = useQueryClient();

  console.log("user in approved dialog", user);

  const approveMutation = useMutation({
    mutationFn: (data: AgentRequestProps) => ApproveAgentRequest(data),
    onSuccess: (data) => {
      console.log("data", data);
      queryClient.invalidateQueries({ queryKey: ["agents-request"] });
      toast.success(data?.message);
      setPublishModalOpen(false);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const handleApprove = () => {
    if (!user?.id || !token) {
      toast.error("Missing user ID or token.");
      return;
    }

    const payload: AgentRequestProps = {
      token,
      userStatus: "ACTIVE",
      userID: user.id,
    };

    approveMutation.mutate(payload);
  };

  return (
    <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Agent Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            You are about to approve{" "}
            <span className="font-semibold">
              {user?.firstName} {user?.lastName}
            </span>
            ’s agent request. Do you wish to continue?
          </p>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setPublishModalOpen(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  Approving...
                  <Loader className="mr-2 w-4 h-4 animate-spin" />
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
