import { useState } from "react";
import toast from "react-hot-toast";
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

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    // applicationId: any;
    // refetch?: () => void;
  }

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm
  }: ConfirmationDialogProps) {

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="capitalize">Pre Screening Confirmation</DialogTitle>
          <DialogDescription>
              Are you sure you want to update the history outcome?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <Button
            onClick={onClose}
            className="capitalize"
            size={"sm"}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
                onConfirm();
                onClose(); 
            }}
            className="capitalize bg-[#013E5B] hover:bg-[#73b7d6] text-white"
            size={"sm"}
            variant="outline"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
