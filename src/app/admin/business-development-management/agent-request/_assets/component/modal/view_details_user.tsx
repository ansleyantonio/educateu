"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchAgentDetails } from "../../controller/queryRequest";
import { useAuths } from "@/hooks/userContext";
import { Loader2 } from "lucide-react";

interface DetailsDialogProps {
  isViewDetailsOpen: boolean;
  setIsViewDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userID: string | undefined;
}

export default function ViewDetailsUser({
  isViewDetailsOpen,
  setIsViewDetailsOpen,
  userID,
}: DetailsDialogProps) {
  const auth = useAuths();
  const token = auth?.user?.token;

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-user-details", { token, userID }],
    queryFn: fetchAgentDetails,
    enabled: !!userID,
  });

  const user = data?.data?.user;
  const totalApplications = data?.data?.totalApplications;
  const totalSubagents = data?.data?.totalSubagents;

  return (
    <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
      <DialogContent className="overflow-hidden overflow-y-auto max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Agent Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 text-sm text-gray-800">
            {/* Personal Info */}
            <Section title="Personal Information">
              <Detail
                label="Full Name"
                value={`${user?.firstName} ${user?.lastName}`}
              />
              <Detail label="Email" value={user?.email} />
              <Detail label="Mobile" value={user?.mobile} />
              <Detail label="Username" value={user?.username} />
              <Detail label="Address" value={user?.address} />
            </Section>

            {/* Status Info */}
            <Section title="Account & Status">
              <Detail label="User Status" value={user?.userStatus} />
              <Detail
                label="Email Verified"
                value={user?.emailVerified ? "Yes" : "No"}
              />
              <Detail
                label="Total Applications"
                value={totalApplications ?? 0}
              />
              <Detail label="Total Subagents" value={totalSubagents ?? 0} />
            </Section>

            {/* Agreement Info */}
            <Section title="Agreement Details">
              <Detail label="Company Name" value={user?.companyName ?? "N/A"} />
              <Detail
                label="Agreement Status"
                value={
                  user?.agreementStatus === null
                    ? "N/A"
                    : user?.agreementStatus
                      ? "Active"
                      : "Inactive"
                }
              />
              <Detail
                label="Agreement Expiry"
                value={user?.aggrementExpiryDate ?? "N/A"}
              />
              <Detail label="Start Date" value={user?.startDate ?? "N/A"} />
              <Detail label="End Date" value={user?.endDate ?? "N/A"} />
              <Detail
                label="Potential Payment"
                value={
                  user?.potentialPayment ? `$${user.potentialPayment}` : "N/A"
                }
              />
              <Detail
                label="Commission Rate"
                value={user?.commitionRate ?? "N/A"}
              />
            </Section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Detail block
function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-1">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="col-span-2">{value}</span>
    </div>
  );
}

// Section wrapper with title
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border shadow-sm">
      <h4 className="mb-3 text-base font-semibold text-gray-900">{title}</h4>
      <div className="divide-y divide-gray-200">{children}</div>
    </div>
  );
}
