import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/custom_ui/button";
import toast from "react-hot-toast";
import { MutationFunction, UseMutationResult } from "@tanstack/react-query";

interface ReviewAgreementDialogConfirmationProps {
  params: { slug: string };
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renewAgentAgreementMutation: UseMutationResult<unknown, unknown, string, unknown>; // Adjusted typing for mutation
}

export function ReviewAgreementDialogConfirmation({
  params,
  isOpen,
  setIsOpen,
  renewAgentAgreementMutation,
}: ReviewAgreementDialogConfirmationProps) {
  // console.log("PArams", typeof params.slug);

  const [isRenewing, setIsRenewing] = useState(false);

  const handleCloseDialog = () => {
    setIsOpen(false); 
  };

  const handleConfirmRenew = () => {
    const agentId = params.slug;
    if (agentId) {
      setIsRenewing(true);
      renewAgentAgreementMutation.mutate(agentId, {
        onSuccess: () => {
          setIsRenewing(false); 
          handleCloseDialog();
        },
        onError: () => {
          setIsRenewing(false);
        },
      });
    } else {
      toast.error("No agent selected");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-xl font-bold">Are you sure?</h2>
        </DialogHeader>
        <div className="text-sm">
          <p>Do you really want to renew the agreement for this agent?</p>
        </div>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            onClick={handleCloseDialog}
            variant="outline"
            disabled={isRenewing}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmRenew} disabled={isRenewing}>
            {isRenewing ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}