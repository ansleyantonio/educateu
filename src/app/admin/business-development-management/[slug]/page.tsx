/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import axios, { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import CusTooltipComponent from "../../user-management/_assets/components/page_components/tooltip/Tooltip";
import { AgentEditModal } from "../_assets/components/page_components/agents/agentEditModal";
import AgentStatusButton from "../_assets/components/page_components/agents/agentStatusButton";
import AgentStatusChangeModal from "../_assets/components/page_components/agents/statusChange";
import ListOfUserLOaderLoader from "../_assets/components/page_components/loading_page/listOfUserList";
import { fetchSingleAgent } from "../_assets/query_contorller/fetchSingleAgent";
import { Agent } from "../_assets/schema/viewAgentListType";
import user from "/public/assets/icons/profile.svg";
import toast from "react-hot-toast";
import { ReviewAgreementDialogConfirmation } from "./_assets/component/review_aggrement_dialog_confirmation";
import { CopyWithIcon } from "@/utils/CopyButton";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import AgreementModal from "./_assets/component/page_component/agent_agreement_modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAgentFormSchema } from "../create-new-agent/_assets/interface/CreateAgentSchema";
import z from "zod";
import ActionButton from "@/components/common/button/actionButton";

// ================== Agreement Modal with Table ==================


// ================== Main Component ==================
const AgentProfile = ({ params }: { params: { slug: string } }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [agent, setAgent] = useState<Agent | undefined>(undefined);
  const [editSource, setEditSource] = useState<"edit" | "renew" | null>(null);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [terminateDialog, setTerminateDialog] = useState<"terminate" | "download" | undefined>();

  const auth = useAuths();
  const queryClient = useQueryClient();
  const token = auth?.user?.token || "";
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];
  const accessLevel = getUserAccess(permissions);
  const canEdit = accessLevel === "full-access";

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-single-agent", { token, id: params.slug }],
    queryFn: fetchSingleAgent,
  });
  const userData = data?.data?.user;

  const handelAgentEdit = (agent: Agent, source: "edit" | "renew") => {
    queryClient.invalidateQueries({ queryKey: ["fetch-single-agent-details"] });
    setAgent(agent);
    setEditSource(source);
    setIsOpen(true);
  };

  const renewAgentAgreementMutation = useMutation({
    mutationFn: (agentId: string) =>
      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/renew/${agentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    onSuccess: () => {
      toast.success("Agent agreement renewed successfully!");
      queryClient.invalidateQueries({ queryKey: ["fetch-single-agent"] });
    },
    onError: (error: AxiosError) => {
      if (error?.response) toast.error((error.response.data as { message: string })?.message);
    },
  });


  
  const { data: agentDetails, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["fetch-single-agent-details", params.slug],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/${params.slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!token && !!params.slug, // ✅ only fetch when agent id is valid
    staleTime: 1000 * 10,
  });

  return (
    <>
      {/* Edit Modal */}
      <AgentEditModal agent={agent} isOpen={isOpen} setOpen={setIsOpen} source={editSource}/>

      {/* Agreement Modal */}
      <AgreementModal
        id={params?.slug}
        isOpen={agreementModalOpen}
        setIsOpen={setAgreementModalOpen}
        awardingBodies={userData?.awardingBodyTemplates || []}
        token={token}
        buttonOption={terminateDialog}
      />


      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-230px)]">
          <ListOfUserLOaderLoader />
        </div>
      ) : (
        <PageWithBreadcrumb
          items={[
            { title: "Home", href: "/admin" },
            { title: "Business Development Management", href: "/admin/business-development-management/agent" },
            { title: "Agents", href: `/admin/business-development-management/agent` },
            { title: `${userData?.firstName || ""} ${userData?.lastName || ""}` },
          ]}
        >
          <ScrollArea className="w-full h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 mr-2 gap-2">
              <div className="flex gap-9 items-center">
                <Image src={user} className="p-3 rounded-full bg-[#F2F4F7]" alt="Agent Profile" width={60} height={60} />
                <div>
                  <h2 className="text-lg font-bold">{userData?.firstName} {userData?.lastName}</h2>
                  <p className="!text-xs text-gray-600 flex">
                    ID:
                    <span className="cursor-pointer text-xs max-w-[120px] truncate">
                      <CusTooltipComponent copy={true} lowercase={true} text={userData?.id} />
                    </span>
                    <CopyWithIcon color="[#013E5B]" text={userData?.id} />
                  </p>
                </div>
                {userData?.userStatus && <AgentStatusButton btnName={userData.userStatus} />}
              </div>
              <div>
              <ActionButton variant="icon" icon={<Pencil size={18} />} buttonContent="Edit Profile" handleOpen={() => canEdit && handelAgentEdit(agentDetails?.data?.user, "edit")} disabled={!canEdit}>
              </ActionButton>
              </div>
            </div>

            {/* Company Information */}
            <Card className="mt-5 rounded-md">
              <CardHeader className="py-3 mb-3 bg-[#F5F7F9]"><CardTitle>Company Information</CardTitle></CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div><p className="text-sm text-gray-600">Agent Company Name:</p><p>{userData?.companyName || "N/A"}</p></div>
                <div><p className="text-sm text-gray-600">Company Address:</p><p>{userData?.address || "N/A"}</p></div>
              </CardContent>
            </Card>

            {/* Agent Details */}
            <Card className="my-5 rounded-md">
              <CardHeader className="py-3 mb-3 bg-[#F5F7F9]"><CardTitle>Agent Details</CardTitle></CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div><p className="text-sm text-gray-600">Type of Agent:</p><p>{userData?.agentType || "N/A"}</p></div>
                <div><p className="text-sm text-gray-600">Students Enrolled:</p><p>{data?.data?.totalApplications ?? "0"}</p></div>
                <div><p className="text-sm text-gray-600">Date Joined:</p><p>{userData?.startDate ? new Date(userData.startDate).toLocaleDateString() : "N/A"}</p></div>
                <div><p className="text-sm text-gray-600">Expiry Date:</p><p>{userData?.endDate ? new Date(userData.endDate).toLocaleDateString() : "N/A"}</p></div>
                <div><p className="text-sm text-gray-600">Email:</p><p>{userData?.email}</p></div>
                <div><p className="text-sm text-gray-600">Agreement Status:</p><p>{userData?.agreementStatus ? "Active" : "Inactive"}</p></div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mb-4 flex justify-end items-center mr-3 space-x-4">
              <Button
                onClick={() =>{setTerminateDialog("terminate");setAgreementModalOpen(true);}}
                type="button"
                className="bg-black text-white hover:bg-red-600"
                disabled={!canEdit}
              >
                Terminate Agreement
              </Button>
              <Button type="button" variant="outline" onClick={() => {setTerminateDialog("download");setAgreementModalOpen(true);}}>
                View Agreement
              </Button>
            </div>

             <AgentStatusChangeModal id={userData?.id} status={userData?.userStatus} />

            <ReviewAgreementDialogConfirmation
              params={{ slug: params.slug }}
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              renewAgentAgreementMutation={renewAgentAgreementMutation}
            />
          </ScrollArea>
        </PageWithBreadcrumb>
      )}
    </>
  );
};

export default AgentProfile;
