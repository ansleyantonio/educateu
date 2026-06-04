/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SessionSchema } from "../../schemas/CreateSessionFormSchema";
import Form_field from "../formField";

const DuplicateSessionForm = ({
  data,
  setOpen,
}: {
  setOpen: (v: boolean) => void;
  data: any;
}) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof SessionSchema.createSession>>({
    resolver: zodResolver(SessionSchema.createSession),
    defaultValues: {
      name: data?.name,
      startTime: new Date(data?.startTime),
      endTime: new Date(data?.endTime),
      status: data?.status,
    },
    mode: "onChange",
  });

  // createNewSubAgentMutation
  const createSessionMutation = useApiMutation({
    method: "POST",
    path: "session",
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetch-session-list"] });
      showToast("success", data);
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error || "Something went wrong!");
      }
    },
  });

  function onSubmit(values: z.infer<typeof SessionSchema.createSession>) {
    const body = RemoveEmptyFields(values);
    createSessionMutation.mutate({ ...body, name: body.name?.trim() });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Form_field form={form} />
        </div>

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={createSessionMutation?.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {createSessionMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DuplicateSessionForm;
