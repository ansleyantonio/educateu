/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import CusTooltipComponent from "@/app/admin/user-management/_assets/components/page_components/tooltip/Tooltip";

import { MfaEnabledDisabled } from "@/app/admin/user-management/_assets/components/page_components/MFA/MFA";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuths } from "@/hooks/userContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Agent } from "../../schema/viewAgentListType";
import { LogFormatDate } from "../../utils/dateFormate";
import { AgentEditModal } from "./agents/agentEditModal";
import AgentStatusButton from "./agents/agentStatusButton";
import AgentStatusChangeModal from "./agents/statusChange";
import UserInfo from "./agents/userInfo";
import AgentUserLoginConfirmationModal from "./modal/AgentUserLoginConfirmationModal";
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";

type AccessLevel = "full-access" | "read-only" | "no-access" | "delete-access";

const AgentList = ({
  isLoading,
  data,
  accessLevel,
  currentPage,
  setCurrentPage,
}: {
  data: any;
  isLoading: boolean;
  accessLevel?: AccessLevel;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [agent, setAgent] = useState<Agent | undefined>(undefined);

  const canEdit = accessLevel === "full-access";

  const auth = useAuths();

  const handelAgentEdit = (agent: Agent) => {
    setAgent(agent);
    if (canEdit) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // console.log("data- data", data);

  return (
    <div>
      <AgentEditModal agent={agent} isOpen={isOpen} setOpen={setIsOpen} />

      <Table className="border border-collapse  bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4">ID</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Login</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>MFA</TableHead>
            <TableHead className="pr-4 text-s">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : data?.agents?.length < 1 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            data?.agents?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="pl-4 text-blue-500 capitalize">
                  <Link
                    href={`/admin/business-development-management/${user.id}`}
                  >
                    <CusTooltipComponent copy text={user.id} />
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/business-development-management/${user.id}`}
                  >
                    <UserInfo user={user} />
                  </Link>
                </TableCell>
                <TableCell>
                  {user.auditLog ? LogFormatDate(user.auditLog) : "-"}
                </TableCell>
                <TableCell>
                  {user.userStatus ? (
                    <AgentStatusButton btnName={user.userStatus} />
                  ) : (
                    <p className="ml-5">-</p>
                  )}
                </TableCell>
                <TableCell>
                  <MfaEnabledDisabled user={user} />
                </TableCell>
                <TableCell className="pr-4 right-0 min-w-[140px]">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handelAgentEdit(user)}
                      disabled={!canEdit}
                      className={`${
                        canEdit
                          ? "hover:border-blue-700 border-[#E1E5E7]"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <Image src={fileEdit} alt="Edit" width={18} height={18} />
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && data?.agents?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <CusPagination
                  totalPages={data.pagination?.totalPages || 1}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default AgentList;
