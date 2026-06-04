/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateAgentFormSchema } from "@/app/admin/business-development-management/create-new-agent/_assets/interface/CreateAgentSchema";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Agent } from "../../../schema/viewAgentListType";
import Form_field from "./updateForm";

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  setOpen: (value: boolean) => void;
  agent: Agent | undefined;
  source?: "edit" | "renew" | null;
}

export function AgentEditModal({ isOpen, setOpen, agent, source, isLoading }: Props) {
  const { user } = useAuths();
  const token = user?.token as string;
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof updateAgentFormSchema>>({
    resolver: zodResolver(updateAgentFormSchema),
    defaultValues: {
      username: agent?.username ?? "",
      firstName: agent?.firstName ?? "",
      lastName: agent?.lastName ?? "",
      email: agent?.email ?? "",
      mobile: agent?.mobile ?? "",
      agentType:
        agent?.agentType === "internal" || agent?.agentType === "external"
          ? agent.agentType
          : "internal",
      awardingBodyTemplates: agent?.awardingBodyTemplates ?? [], // ✅ always safe default
      commissionGroupId: agent?.commissionGroupId ?? "",
      companyName: agent?.companyName ?? "",
      startDate: agent?.startDate ? new Date(agent.startDate) : undefined,
      endDate: agent?.endDate ? new Date(agent.endDate) : undefined,
      address: agent?.address ?? "",
      note: agent?.note ?? "",
      agreementStatus: !!agent?.agreementStatus,
    },
    mode: "onChange",
  });
// ✅ Only reset once when agentDetails is fetched
useEffect(() => {
  if(isLoading){
queryClient.invalidateQueries({ queryKey: ["fetch-list-of-agents"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-single-agent-details"] });
  }
  if (agent) {
    form.reset({
      username: agent.username ?? "",
      firstName: agent.firstName ?? "",
      lastName: agent.lastName ?? "",
      email: agent.email ?? "",
      mobile: agent.mobile ?? "",
      agentType:
        agent.agentType === "internal" || agent.agentType === "external"
          ? agent.agentType
          : "internal",
      commissionGroupId: agent.commissionGroupId ?? "",
      awardingBodyTemplates: agent?.awardingBodyTemplates ?? [],
      companyName: agent.companyName ?? "",
      startDate: agent.startDate ? new Date(agent.startDate) : undefined,
      endDate: agent.endDate ? new Date(agent.endDate) : undefined,
      address: agent.address ?? "",
      note: agent.note ?? "",
      agreementStatus: !!agent.agreementStatus,
    });
  }
  // ✅ Only run when agentDetails changes
}, [agent, form, isLoading, queryClient]);

  // Mutation logic stays unchanged
  const editAgentMutation = useApiMutation({
    method: "PATCH",
    path: `business-development-management/${agent?.id}`,
    onSuccess: () => {
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-agents"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-single-agent-details"] });
      toast.success("Successfully updated agent user!");
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error);
      }
    },
  });

  // ------------------------- real time check --------------------------------
  const username = useWatch({ control: form.control, name: "username" });
  const email = useWatch({ control: form.control, name: "email" });

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user/?userid=${agent?.id}&username=${username}&email=${email}&portal=agent`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.exists;
  };

  const useCheckUserExistence = (field: string, value: string) =>
    useQuery({
      queryKey: ["check-user", field, value],
      queryFn: () => checkUserExistence(field, value),
      enabled: !!value,
      staleTime: 1000 * 10,
    });

  const usernameQuery = useCheckUserExistence("username", form.watch("username") || "");
  const emailQuery = useCheckUserExistence("email", form.watch("email") || "");
  const mobileQuery = useCheckUserExistence("mobile", form.watch("mobile") || "");

  function onSubmit(values: z.infer<typeof updateAgentFormSchema>) {
    editAgentMutation.mutate(values);
  }

  return (
    <Dialog onOpenChange={setOpen} open={isOpen}>
      <DialogTrigger asChild className="hidden" />
      <DialogContent className="min-w-[85%] max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{source === "renew" ? "Renew Agreement" : "Edit profile"}</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Form_field
                usernameQuery={usernameQuery}
                emailQuery={emailQuery}
                mobileQuery={mobileQuery}
                form={form}
                // source={source ?? undefined}
              />
              <div className="flex gap-x-3 justify-end items-center">
                <ActionButton buttonContent="Submit" loadingContent="Submitting..."  isPending={editAgentMutation?.isPending} type="submit"/>
              </div>
            </form>
          </Form>

        <DialogFooter className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
