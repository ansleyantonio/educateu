/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ISessionForm,
  SessionSchema,
} from "../../schemas/CreateSessionFormSchema";
import { SessionDefaultValue } from "../../utils/sessionValue";
import ConnectCourseForm from "../connectCourse/connectCourseForm";
import Form_field from "../formField/formField";
import OverrideWarningDialog from "../overrideModal/overrideModal";

const CreateSessionForm = ({
  setOpen,
  setSearchText,
}: {
  setOpen: (v: boolean) => void;
  setSearchText: (data: string) => void;
}) => {
  const queryClient = useQueryClient();

  const form = useForm<ISessionForm>({
    resolver: zodResolver(SessionSchema.createSession),
    defaultValues: SessionDefaultValue(),
    mode: "onChange",
  });

  const createSessionMutation = useApiMutation({
    method: "POST",
    path: "session",
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetch-session-list"] });
      showToast("success", data);
      form.reset();
      setOpen(false);
      setSearchText("");
    },
    onError: (error: any) => {
      showToast("error", error);
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Form_field form={form} />
            <ConnectCourseForm isEditMode={false} form={form} />
          </div>

          {/* Submit buttons */}
          <div className="flex gap-x-3 justify-end items-center">
            <ActionButton
              handleOpen={() => setOpen(false)}
              buttonContent="Cancel"
              type="button"
              variant="outline"
            />
            {/* Modal for Active Session Warning */}
            <OverrideWarningDialog
              form={form}
              mutation={createSessionMutation.mutate}
              btnText="Create"
              isPending={createSessionMutation.isPending}
            />
          </div>
        </form>
      </Form>
    </>
  );
};

export default CreateSessionForm;
