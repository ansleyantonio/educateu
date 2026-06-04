/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { AlertTriangle } from "lucide-react";
import type { UseMutateFunction } from "@tanstack/react-query";
import { useState } from "react";
import { ISessionForm } from "../../schemas/CreateSessionFormSchema";
import { UseFormReturn } from "react-hook-form";

interface Props<TData = any, TVariables = any> {
  mutation: UseMutateFunction<TData, unknown, TVariables, unknown>;
  sessionId?: string;
  btnText: string;
  isPending: boolean;
  form: UseFormReturn<any>;
  loadingContent?: string;
}

const OverrideWarningDialog = ({
  form,
  sessionId,
  mutation,
  btnText,
  isPending,
  loadingContent,
}: Props) => {
  const [open, setOpen] = useState(false);

  // Fetch currently active session
  const { data } = DataFetcher.fetchAcademicSessions({
    path: "session?status=ACTIVE",
  });

  const activeSession = data?.data?.sessions?.[0] || null;

  /* Check if we need to override */
  const shouldOverride = (formData: ISessionForm) => {
    return (
      activeSession?.status === "ACTIVE" &&
      formData?.status === "ACTIVE" &&
      sessionId !== activeSession?.id
    );
  };

  /* Main onSubmit logic */
  const onSubmit = (formValues: ISessionForm) => {
    if (shouldOverride(formValues)) {
      // If conflict exists → show confirmation modal
      setOpen(true);
    } else {
      // No conflict → run mutation directly
      runMutation(formValues);
    }
  };

  /* Run mutation*/
  const runMutation = (payload: ISessionForm) => {
    mutation(payload);
    setOpen(false);
  };

  /* Final confirmation after user clicks "Override" */
  const confirmOverride = () => {
    const formValues = form.getValues();
    runMutation(formValues);
  };

  return (
    <>
      {/* Main form submit button */}
      <ActionButton
        buttonContent={btnText}
        loadingContent={loadingContent ?? btnText}
        type="button"
        variant="primary"
        handleOpen={form.handleSubmit(onSubmit)}
        isPending={isPending}
      />

      {/* Warning Dialog */}
      <DialogWrapper
        title={
          <p className="flex gap-2 items-center text-yellow-600">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Active Session Warning
          </p>
        }
        open={open}
        handleOpen={() => setOpen(!open)}
        style="min-w-[45%]"
      >
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="flex gap-3 items-start p-3 bg-yellow-50 rounded-md border border-yellow-300">
            <p className="text-sm text-yellow-700">
              An <strong>active session</strong> already exists. Creating
              another one will override its status. Do you want to continue?
            </p>
          </div>

          {/* Active session details */}
          {activeSession && (
            <div className="overflow-y-auto p-3 max-h-40 bg-gray-50 rounded border">
              <div className="py-1 text-sm text-gray-700">
                <span className="font-semibold">{activeSession.name}</span> —{" "}
                <span className="text-green-500">{activeSession.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex gap-2 justify-end pt-4">
          <ActionButton
            buttonContent="Cancel"
            type="button"
            variant="outline"
            handleOpen={() => setOpen(false)}
          />
          <ActionButton
            buttonContent={`Override ${btnText}`}
            loadingContent={btnText}
            type="button"
            variant="primary"
            handleOpen={confirmOverride}
            isPending={isPending}
          />
        </div>
      </DialogWrapper>
    </>
  );
};

export default OverrideWarningDialog;
