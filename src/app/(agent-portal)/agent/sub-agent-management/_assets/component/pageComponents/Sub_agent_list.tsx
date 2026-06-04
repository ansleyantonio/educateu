/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// const Sub_agent_list = () => {
//   return <div></div>;
// };

// export default Sub_agent_list;
import { MfaEnabledDisabled } from "@/app/admin/user-management/_assets/components/page_components/MFA/MFA";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { SubAgent } from "../../interface/subAgentRegister";
import { UpdateSubAgent } from "./updateDialog";

// Define the Agent interface
interface AuditLog {
  id?: string;
  action?: string;
  timestamp?: string;
}

interface User {
  id: string;
  email: string;
  mobile: string;
  username: string;
  firstName: string;
  lastName: string;
  userStatus: "DEACTIVATED" | "PENDING" | "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  auditLogs: AuditLog[];
}

interface Pagination {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export function Sub_agent_list({
  data,
  isLoading,
  currentPage,
  setCurrentPage,
}: {
  data: UserListResponse;
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (data: number) => void;
}) {
  // console.log("all agent list ", data);
  const [open, setOpen] = useState(false);
  const [subAgent, setSubAgent] = useState({} as SubAgent);
  // console.log("subAgent", subAgent);

  const handelListItemClick = (subAgent: SubAgent) => {
    setSubAgent(subAgent);
    setOpen(true);
  };

  console.log("subAgent", data?.users);
  return (
    <div className="w-full">
      {/* Dialog for updating Sub-Agent */}
      <UpdateSubAgent subAgent={subAgent} open={open} setOpen={setOpen} />

      <Table className="border border-collapse table-auto">
        <TableHeader className="bg-gray-50">
          <TableRow>
            {/* <TableHead>
              <Checkbox />
            </TableHead> */}
            <TableHead className="pl-4" onClick={() => setOpen(true)}>
              Name
            </TableHead>
            <TableHead>Company Name</TableHead>
            {/* <TableHead>Role</TableHead> */}
            <TableHead>Mobile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>MFA</TableHead>
            <TableHead>Number of Submitted Applications</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px] lg:min-h-[350px] ">
              <DataLoader />
            </div>
          ) : data?.users?.length === 0 ? (
            <div className="min-h-[250px] lg:min-h-[350px] ">
              <NoDataComponent />
            </div>
          ) : (
            data?.users?.map((agent: any) => (
              <TableRow className="bg-white" key={agent?.id}>
                {/* <TableCell className="font-medium">
                  <Checkbox />
                </TableCell> */}
                <TableCell
                  className="pl-4 font-medium capitalize cursor-pointer"
                  onClick={() => handelListItemClick(agent)}
                >
                  {agent?.firstName + " " + agent?.lastName}
                </TableCell>
                <TableCell> {agent?.companyName}</TableCell>
                {/* <TableCell>{agent.role.name}</TableCell> */}
                <TableCell>{agent.mobile}</TableCell>
                <TableCell>{agent.userStatus}</TableCell>
                <TableCell>
                  <MfaEnabledDisabled user={agent} />
                </TableCell>

                <TableCell>{agent?.totalApplications || 0}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && data?.pagination?.totalPages > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="">
                <CusPagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={data?.pagination?.totalPages || 0}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
