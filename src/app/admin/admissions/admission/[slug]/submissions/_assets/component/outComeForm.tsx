/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/custom_ui/button";
import { Form } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CustomField } from "@/components/common/fields/cusInputField";

const FormSchema = z
  .object({
    outcome: z.string({
      required_error: "Please select an outcome.",
    }),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.outcome === "APPROVED_CONDITIONAL" && !data.note) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Conditional offer details are required.",
        path: ["conditionalInfo"],
      });
    }
  });

interface OutComeFormProps {
  setIsOpenDialog: (value: boolean) => void;
  id: string;
}

export function OutComeForm({ setIsOpenDialog, id }: OutComeFormProps) {
  const params = useParams();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  // Watch the current outcome
  const outcome = form.watch("outcome");

  // Outcome mutation
  const outComeMutation = useApiMutation({
    method: "POST",
    path: `admission/submissions/outcome/${params.slug}`,
    onSuccess: (data) => {
      showToast("success", data);
      setIsOpenDialog(false);
      queryClient.invalidateQueries({
        queryKey: ["single-application-data"],
      });
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  // Note mutation
  const noteMutation = useApiMutation({
    path: `admission/notes/application?applicationId=${id}`,
    method: "POST",
    dataType: "application/json",
    onSuccess: (data) => {
      if (data.statusCode === 200) {
        showToast("success", data);
        queryClient.invalidateQueries({ queryKey: ["public_note"] });
        setIsOpenDialog(false);
      } else {
        showToast("error", data);
      }
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { outcome, note } = data;

    if (outcome === "APPROVED_CONDITIONAL") {
      noteMutation.mutate({ note, visibility: "PUBLIC" });
    }
    outComeMutation.mutate({ outcome });
  }

  const options = [
    { label: "Rejected", value: "REJECTED" },
    { label: "Conditional Offer", value: "APPROVED_CONDITIONAL" },
    { label: "Unconditional Offer", value: "APPROVED_UNCONDITIONAL" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomField.SelectField
          placeholder="Select Outcome"
          name="outcome"
          options={options}
          form={form}
          onValueChange={(value: string) => {
            form.setValue("outcome", value);
            if (value !== "APPROVED_CONDITIONAL") {
              form.setValue("note", "");
            }
          }}
        />

        {/* Only show text area when Conditional Offer is selected */}
        {outcome === "APPROVED_CONDITIONAL" && (
          <CustomField.TextArea
            placeholder="Enter the conditional offer details"
            name="note"
            form={form}
          />
        )}

        <div className="flex gap-4 justify-end items-center pt-2">
          <Button
            type="button"
            onClick={() => setIsOpenDialog(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
