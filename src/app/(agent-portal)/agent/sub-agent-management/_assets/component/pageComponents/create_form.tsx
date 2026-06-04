/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { subAgentCreateFormSchema } from "../../interface/subAgentCreateSchema";
import CreateFormField from "./create_form_field";

const CreateForm = ({ setOpen }: { setOpen: any }) => {
  const auth = useAuths();
  const id = auth?.user?.userId;
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof subAgentCreateFormSchema>>({
    resolver: zodResolver(subAgentCreateFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      companyName: "",
      internalReference: "",
      email: "",
      mobile: "",
      reportingTo: id,
      address: "",
      userStatus: "ACTIVE",
    },
  });
  // createNewSubAgentMutation
  const createNewSubAgentMutation = useApiMutation({
    path: `sub-agent-management/register`,
    method: "POST",
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
  function onSubmit(values: z.infer<typeof subAgentCreateFormSchema>) {
    // const createSubAgentData = createSubAgentDataFormatted(values);
    createNewSubAgentMutation.mutate(values);
    console.log("createNewSubAgentMutation", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CreateFormField form={form} />
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
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
            disabled={createNewSubAgentMutation?.isPending}
          >
            {createNewSubAgentMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateForm;
