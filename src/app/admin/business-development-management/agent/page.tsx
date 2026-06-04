"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MfaEnabledDisabled } from "../../user-management/_assets/components/page_components/MFA/MFA";
import CusTooltipComponent from "../../user-management/_assets/components/page_components/tooltip/Tooltip";
import AgentFilter from "../_assets/components/page_components/agentFilter";
import { AgentEditModal } from "../_assets/components/page_components/agents/agentEditModal";
import AgentStatusButton from "../_assets/components/page_components/agents/agentStatusButton";
import AgentStatusChangeModal from "../_assets/components/page_components/agents/statusChange";
import UserInfo from "../_assets/components/page_components/agents/userInfo";
import AgentUserLoginConfirmationModal from "../_assets/components/page_components/modal/AgentUserLoginConfirmationModal";
import type { Agent } from "../_assets/schema/viewAgentListType";
import { LogFormatDate } from "../_assets/utils/dateFormate";
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";

const Agent = () => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];
  const { user } = useAuths();
  const token = user?.token;
  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const [searchText, setSearchText] = useState("");
  const [agentType, setAgentType] = useState("");
  const [status, setStatus] = useState("");

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const canEdit = getUserAccess(permissions) === "full-access";

  const [limit, setLimit] = useState("10");
  const [isOpen, setIsOpen] = useState(false);
  const [agent, setAgent] = useState<Agent | undefined>(undefined);
  const queryClient = useQueryClient();
  const { data, isLoading } = useFetchData({
    path: "business-development-management",
    method: "GET",
    queryKey: "fetch-list-of-agents",
    filterData: {
      page: currentPage,
      pageSize: limit,
      name: searchText,
      agentType: agentType == "all" ? "" : agentType,
      status: status == "all" ? "" : status,
    },
  });
  
  const { data:agentDetails, isLoading: isLoadingAgents } = useFetchData({
    path: `business-development-management/${agent?.id}`,
    method: "GET",
    queryKey: "fetch-single-agent-details",
    enabled: !!token && !!agent?.id,
  });

  const handleAgentEdit = (agent: Agent) => {
    setAgent(agent);
    if (canEdit) {
      setIsOpen(true);
    } else {
      queryClient.invalidateQueries({
        queryKey: ["fetch-single-agent-details"],
      });
      setIsOpen(false);
    }
  };

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Business Development Management",
        //   href: "/admin/business-development-management/agent",
        // },
        { title: "Agent" },
      ]}
    >
      <div>
        {/* search plus filter */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2 justify-start items-center basis-1/4">
            <h1 className="text-lg font-bold tracking-wide leading-5 text-[#192128]">
              Agents
            </h1>
            <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full text-nowrap">
              {data?.data?.pagination?.totalAgents === 1
                ? "1 Agent"
                : `${data?.data?.pagination?.totalAgents} Agents`}
            </span>
          </div>
          <div className="flex flex-wrap xl:flex-nowrap gap-2">
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <AgentFilter
              setAgentType={setAgentType}
              setStatus={setStatus}
              setLimit={setLimit}
              total={data?.data?.pagination?.totalAgents || 1}
              setCurrentPage={setCurrentPage}
            />
            <div
              className={`flex items-center py-2 px-4 rounded-md text-white ${
                hasPostAndDeletePermission
                  ? "bg-[#013E5B] hover:bg-[#002d42] cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <Link
                href="/admin/business-development-management/create-new-agent"
                className={` flex items-center gap-x-2 ${
                  !hasPostAndDeletePermission ? "pointer-events-none" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Create New Agent</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="pt-4">
          {/* {isLoadingAgents ? (
            <div className="flex justify-center items-center h-[calc(100vh-230px)]">
              <ListOfUserLOaderLoader />
            </div>
          ) : (
          )} */}
          <AgentEditModal
            agent={agentDetails?.data?.user}
            isOpen={isOpen}
            setOpen={setIsOpen}
            isLoading={isLoadingAgents}
          />

          <DynamicTableWithPagination
            isLoading={isLoading}
            data={data?.data?.agents || []}
            pagination={data?.data?.pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            config={{
              columns: [
                {
                  key: "id",
                  header: "ID",
                  render: (user) => (
                    <Link
                      href={`/admin/business-development-management/${user.id}`}
                    >
                      <CusTooltipComponent copy text={user.id} />
                    </Link>
                  ),
                },
                {
                  key: "agent",
                  header: "Agent",
                  render: (user) => (
                    <Link
                      href={`/admin/business-development-management/${user.id}`}
                    >
                      <UserInfo user={user} />
                    </Link>
                  ),
                },
                {
                  key: "login",
                  header: "Login",
                  render: (user) =>
                    user.auditLog ? LogFormatDate(user.auditLog) : "-",
                },
                {
                  key: "status",
                  header: "Status",
                  render: (user) =>
                    user.userStatus ? (
                      <AgentStatusButton btnName={user.userStatus} />
                    ) : (
                      <p className="ml-5">-</p>
                    ),
                },
                {
                  key: "mfa",
                  header: "MFA",
                  render: (user) => <MfaEnabledDisabled user={user} />,
                },
                {
                  key: "action",
                  header: "Action",
                  render: (user) => (
                    <ResponsiveButtonGroup>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleAgentEdit(user)}
                          disabled={!canEdit}
                          className={`${
                            canEdit
                              ? "hover:border-blue-700 border-[#E1E5E7]"
                              : "cursor-not-allowed opacity-50"
                          }`}
                        >
                          <Image
                            src={fileEdit}
                            alt="Edit"
                            width={18}
                            height={18}
                          />
                        </Button>
                        <AgentStatusChangeModal
                          id={user.id}
                          status={user.userStatus}
                          disabled={!canEdit}
                        />
                        <AgentUserLoginConfirmationModal
                          id={user.id}
                          canEdit={canEdit}
                          firstName={user?.firstName}
                          lastName={user?.lastName}
                        />
                      </div>
                    </ResponsiveButtonGroup>
                  ),
                },
              ],
            }}
          />
          {/* <AgentList
            data={data?.data}
            isLoading={isLoading}
            accessLevel={getUserAccess(permissions)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          /> */}
        </div>
        {/* </ScrollArea> */}
      </div>
    </PageWithBreadcrumb>
  );
};

export default Agent;
