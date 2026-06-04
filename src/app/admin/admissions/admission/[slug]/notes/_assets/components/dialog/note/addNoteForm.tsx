/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { CustomField } from "@/components/common/fields/cusInputField";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/custom_ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { addNoteFormSchema, NoteFormValues } from "../../../schema/noteSchema";

interface AddNoteFormProps {
  setIsOpenDialog: (value: boolean) => void;
  token: string;
  setTabValue: (value: string) => void;
}

export default function AddNoteForm({
  setIsOpenDialog,
  token,
  setTabValue,
}: AddNoteFormProps) {
  const queryClient = useQueryClient();
  const applicationId = usePathname().split("/")[4];
  console.log("applicationId", applicationId);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(addNoteFormSchema),
    defaultValues: {
      note: "",
      visibility: undefined,
    },
  });

  const visibility = useWatch({
    control: form.control,
    name: "visibility",
  });

  const statusKey =
    visibility === "PRIVATE"
      ? "get-applicant-private-note"
      : "get-applicant-public-note";

  const noteMutation = useApiMutation({
    path: `admission/notes/application?applicationId=${applicationId}`,
    method: "POST",
    dataType: "application/json",
    onSuccess: (data) => {
      if (data.statusCode === 200) {
        showToast("success", data);
        const addNoteType =
          visibility === "PRIVATE" ? "private_note" : "public_note";
        setTabValue(addNoteType);
        queryClient.invalidateQueries({ queryKey: [statusKey] });
        setIsOpenDialog(false);
      } else {
        showToast("error", data);
      }
    },
    onError: (error: any) => {
      console.error("add note error:", error);
      showToast("error", error);
    },
  });

  const onSubmit = (data: NoteFormValues) => {
    noteMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Visibility */}
        <CustomField.SelectField
          form={form}
          name="visibility"
          placeholder="Select Note Type"
          labelName="Note Type"
          options={[
            { value: "PRIVATE", label: "Private" },
            { value: "PUBLIC", label: "Public" },
          ]}
          optional={false}
        />

        {/* Note */}
        <CustomField.TextArea
          form={form}
          name="note"
          labelName="Note"
          placeholder="Enter your Note"
          optional={false}
        />

        {/* Submit button */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpenDialog(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={noteMutation.isPending}
            variant="primary"
            size="sm"
            type="submit"
          >
            Submit
            {noteMutation.isPending && <Loader2Icon className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
