"use client";
import { useState } from "react";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { BellRing } from 'lucide-react';
import { useAuths } from "@/hooks/userContext";

export function SendPaymentReminderEmail({ emails }: { emails: string[] }) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { editAccess } = useAuths();

  const handleOpen = () => setOpen(!open);

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      console.log("📤 Sending Payment Reminder emails to:", emails);
      await new Promise((res) => setTimeout(res, 1200));

      console.log("✅ Payment Reminder emails sent successfully!");
      setOpen(false);
    } catch (error) {
      console.error("❌ Failed to send Payment Reminder emails:", error);
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
          // icon={<BellRing className="ml-auto" />}
          buttonContent="Send Payment Reminder"
        />
      }
      style="min-w-[40%]"
    >
      <div className="space-y-6">
        <p className="text-lg font-semibold leading-none tracking-tight">
          Send Payment Email Reminder
        </p>

        <p className="text-sm text-gray-600">
          You’re about to send reminder emails to{" "}
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