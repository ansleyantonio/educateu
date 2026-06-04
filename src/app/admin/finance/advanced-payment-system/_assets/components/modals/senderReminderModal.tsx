"use client";
import { useState, useEffect } from "react";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import invitations from "/public/assets/icons/shear.svg";
import onFormError from "@/utils/formError";
import { useAuths } from "@/hooks/userContext";
import { FormProvider, useForm } from "react-hook-form";
import { ChevronRight } from "lucide-react";
import { CustomField } from "@/components/common/fields/cusInputField";

interface ReminderFormValues {
  message: string;
}

export function SenderReminderModal() {
  const [open, setOpen] = useState(false);
  const { editAccess } = useAuths();

  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  const handleOpen = () => {
    form.reset({ message: ""});
    form.clearErrors();
    setOpen(!open);
  };

  function onSubmit(values: ReminderFormValues) {
    console.log("Values ", values);
  }

  useEffect(() => {
    form.reset({ message: ""});
    form.clearErrors();
  }, [setOpen]);

  return (
    <DialogWrapper
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          btnSize="lg"
          handleOpen={handleOpen}
          variant="outline"
          imageSrc={invitations}
          btnStyle="font-semibold text-gray-600 w-full"
          lastIcon={<ChevronRight className="ml-auto" />}
          buttonContent={`Sender Reminder`}
        />
      }
      style="min-w-[45%]"
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <p className="text-lg font-semibold leading-none tracking-tight">
            Send a Reminder
          </p>
          <CustomField.TextArea
            form={form}
            name="message"
            placeholder={
              "E.g., “Please review and reverify your payment details.”"
            }
            optional={false}
          />
          <div className="flex gap-x-3 justify-end items-center">
            <ActionButton
              type="submit"
              // isPending={createAdvanceCourseMutation?.isPending}
              loadingContent="Sending..."
              buttonContent="Send Reminder"
            />
            <ActionButton
              handleOpen={() => setOpen(false)}
              variant="outline"
              buttonContent="Cancel"
            />
          </div>
        </form>
      </FormProvider>
    </DialogWrapper>
  );
}
