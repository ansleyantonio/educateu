/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/custom_ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { addNoteFormSchema, NoteFormValues } from "../../../schema/noteSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addNoteController } from "../../../queryClient/queryController";
import { usePathname } from "next/navigation";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

interface AddNoteFormProps {
  setIsOpenDialog: (valu: boolean) => void;
  token: string;
}

export default function AddNoteForm({
  setIsOpenDialog,
  token,
}: AddNoteFormProps) {
  const queryClient = useQueryClient();
  const applicationId = usePathname().split("/")[3];

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(addNoteFormSchema),
    defaultValues: {
      note: "",
    },
  });

  const noteMutation = useApiMutation({
  path: `admission/notes/application?applicationId=${applicationId}`, // Adjust based on your addNoteController endpoint
  method: "POST",
  onSuccess: (data) => {
    if (data.statusCode === 200) {
      queryClient.invalidateQueries({ queryKey: ["get-applicant-note"] });
      toast.success(data?.message);
      setIsOpenDialog(false);
    } else {
      toast.error(data?.message);
    }
  },
  onError: (error) => {
    console.error("Add note error:", error);
    toast.error(error || "Failed to add note");
  },
});

  const onSubmit = (data: NoteFormValues) => {
    const body = {
      body: data,
      applicationId: applicationId,
    };
    noteMutation.mutate(body);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <div className="relative">
                  <textarea
                    {...field}
                    className="py-2 px-3 w-full text-sm rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
                    rows={12}
                    placeholder="Enter your note"
                  />
                  <FormMessage />
                </div>
              )}
            />
          )}
        />

        {/* Submit button */}
        <div className="flex gap-6 justify-end">
          <Button variant="outline" onClick={() => setIsOpenDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
