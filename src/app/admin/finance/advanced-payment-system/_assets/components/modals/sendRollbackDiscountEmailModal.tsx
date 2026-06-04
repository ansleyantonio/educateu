"use client";
import { useState } from "react";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { BadgePoundSterling } from 'lucide-react';
import { useAuths } from "@/hooks/userContext";

export function SendRollbacDiscountEmailModal({ emails }: { emails: string[] }) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { editAccess } = useAuths();

  const handleOpen = () => setOpen(!open);

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      console.log("📤 Sending Rollback Discount Emails to:", emails);
      await new Promise((res) => setTimeout(res, 1200));

      console.log("✅ Rollback Discount Emails sent successfully!");
      setOpen(false);
    } catch (error) {
      console.error("❌ Failed to send Rollback Discount Emails:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DialogWrapper
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          disabled={!editAccess || emails.length === 0}
          btnSize="lg"
          handleOpen={handleOpen}
          variant="outline"
          btnStyle="font-semibold text-gray-600"
          // icon={<BadgePoundSterling className="ml-auto" />}
          buttonContent="Send Rollback Discount Email"
        />
      }
      style="min-w-[40%]"
    >
      <div className="space-y-6">
        <p className="text-lg font-semibold leading-none tracking-tight">
          Send Rollback Discount Email
        </p>

        <p className="text-sm text-gray-600">
          You’re about to send rollback discount emails to{" "}
          <span className="font-semibold">{emails.length}</span>{" "}
          recipient{emails.length > 1 ? "s" : ""}.
        </p>

        <div className="flex justify-end gap-3">
          <ActionButton
            onClick={handleSendEmail}
            isPending={isSending}
            loadingContent="Sending..."
            buttonContent="Send Now"
          />
          <ActionButton
            handleOpen={() => setOpen(false)}
            variant="outline"
            buttonContent="Cancel"
          />
        </div>
      </div>
    </DialogWrapper>
  );
}