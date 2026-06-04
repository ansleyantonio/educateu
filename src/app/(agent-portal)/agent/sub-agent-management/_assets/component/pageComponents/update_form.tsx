/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { updateSubAgentFormSchema } from "../../interface/subAgentCreateSchema";
import UpdateFormField from "./update_form_field";

const UpdateForm = ({ setOpen, subAgent }: { setOpen: any; subAgent: any }) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const id = auth?.user?.userId;

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof updateSubAgentFormSchema>>({
    resolver: zodResolver(updateSubAgentFormSchema),
    defaultValues: {
      firstName: subAgent?.firstName || "",
      lastName: subAgent?.lastName || "",
      username: subAgent?.username || "",
      email: subAgent?.email || "",
      companyName: subAgent?.companyName || "",
      address: subAgent?.address || "",
      internalReference: subAgent?.internalReference || "",
      mobile: subAgent?.mobile || "",
      userStatus: subAgent?.userStatus,
    },
  });

  // createNewSubAgentMutation

  const updateSubAgentMutation = useApiMutation({
    path: `sub-agent-management/${subAgent?.id}`,
    method: "PATCH",
    dataType: "application/json",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-All-sub-agents"] });
    },
    onError: (error: any) => {
      showToast("error", error);
    },
  });

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof updateSubAgentFormSchema>) {
    updateSubAgentMutation.mutate(values);
    // console.log("updatee", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UpdateFormField form={form} />
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
            disabled={updateSubAgentMutation?.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {updateSubAgentMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )}
            update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateForm;
