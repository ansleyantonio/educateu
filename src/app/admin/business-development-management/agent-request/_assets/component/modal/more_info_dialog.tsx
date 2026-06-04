import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PendingAgent } from "../../type";

interface MoreInfoDialogProps {
  moreIfnoModalOpen: boolean;
  setMoreInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: PendingAgent | undefined;
}

export default function MoreInfoDialog({
  moreIfnoModalOpen,
  setMoreInfoModalOpen,
  user,
}: MoreInfoDialogProps) {
  return (
    <Dialog open={moreIfnoModalOpen} onOpenChange={setMoreInfoModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agent Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Full Name:</span> {user?.firstName}{" "}
            {user?.lastName}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold">Mobile:</span> {user?.mobile}
          </p>
          <p>
            <span className="font-semibold">Username:</span> {user?.username}
          </p>
          {user?.companyName && (
            <p>
              <span className="font-semibold">Company Name:</span>{" "}
              {user.companyName}
            </p>
          )}
          {user?.potentialPayment && (
            <p>
              <span className="font-semibold">Potential Payment:</span> $
              {user.potentialPayment}
            </p>
          )}
          {user?.commitionRate && (
            <p>
              <span className="font-semibold">Commission Rate:</span>{" "}
              {user.commitionRate}
            </p>
          )}
          <p>
            <span className="font-semibold">Email Verified:</span>{" "}
            {user?.emailVerified ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-semibold">Agreement Status:</span>{" "}
            {user?.agreementStatus ? "Active" : "Inactive"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
