import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentRequestProps, PendingAgent } from "../../type";
import { Button } from "@/components/ui/custom_ui/button";
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApproveAgentRequest } from "../../controller/queryRequest";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

interface DeclinedDialogProps {
  unPublishModalOpen: boolean;
  setUnPublishModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: PendingAgent | undefined;
}

export default function DeclinedDialog({
  unPublishModalOpen,
  setUnPublishModalOpen,
  user,
}: DeclinedDialogProps) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (data: AgentRequestProps) => ApproveAgentRequest(data),
    onSuccess: (data) => {
      console.log("data", data);

      queryClient.invalidateQueries({ queryKey: ["agents-request"] });
      toast.success(data?.message);
      setUnPublishModalOpen(false);
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
      userStatus: "DEACTIVATED",
      userID: user.id,
    };

    approveMutation.mutate(payload);
  };

  return (
    <Dialog open={unPublishModalOpen} onOpenChange={setUnPublishModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline Agent Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Are you sure you want to decline{" "}
            <span className="font-semibold">
              {user?.firstName} {user?.lastName}
            </span>
            ’s agent request?
          </p>
          {/* Buttons for confirm/cancel can go here */}
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setUnPublishModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  Declining...
                  <Loader className="mr-2 w-4 h-4 animate-spin" />
                </>
              ) : (
                "Decline Request"
              )}
            </Button>{" "}
          </div>{" "}
        </div>
      </DialogContent>
    </Dialog>
  );
}
