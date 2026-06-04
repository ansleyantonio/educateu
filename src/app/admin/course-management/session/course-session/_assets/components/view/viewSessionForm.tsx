/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Form } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import Form_field from "../formField/formField";
import { ISessionForm } from "../../schemas/CreateSessionFormSchema";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import ActionButton from "@/components/common/button/actionButton";
import ConnectCourseForm from "../connectCourse/connectCourseForm";
import { UseFormReturn } from "react-hook-form";
import OverrideWarningDialog from "../overrideModal/overrideModal";

interface ISessionProps {
  form: UseFormReturn<any>;
  data: ISessionForm & { id: string };
  setOpen: any;
  isEditMode: boolean;
  sessionId: string;
}

const ViewSessionForm = ({
  form,
  data,
  setOpen,
  isEditMode,
  sessionId,
}: ISessionProps) => {
  const queryClient = useQueryClient();

  // Single source of truth for form values

  const updateSessionMutation = useApiMutation({
    method: "PATCH",
    path: `session/${data?.id}`,
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({ queryKey: ["fetch-session-list"] });
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Form_field isEditMode={isEditMode} form={form} />
          <ConnectCourseForm isEditMode={isEditMode} form={form} />
        </div>
      </form>
      {/* Submit buttons */}
      {!isEditMode && (
        <div className="flex gap-x-3 justify-end items-center mt-9">
          <ActionButton
            handleOpen={() => setOpen(false)}
            buttonContent="Cancel"
            type="button"
            variant="outline"
          />

          {/* Modal for Active Session Warning */}
          <OverrideWarningDialog
            form={form}
            sessionId={sessionId}
            mutation={updateSessionMutation.mutate}
            btnText="Update"
            isPending={updateSessionMutation.isPending}
          />
        </div>
      )}
    </Form>
  );
};

export default ViewSessionForm;
