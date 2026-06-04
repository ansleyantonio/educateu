"use client";
import AgentPagination from "@/app/(agent-portal)/agent/application-management/_assets/components/page_components/pagination";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useState } from "react";
import {
  AgentRequest,
  PendingAgent,
} from "../../../agent-request/_assets/type";
import EmailStatus from "./email_status";
import ApprovedDialog from "./modal/approved_dialog";
import DeclinedDialog from "./modal/declined_dialog";
import MoreInfoDialog from "./modal/more_info_dialog";
import ViewDetailsUser from "./modal/view_details_user";
import publish from "/public/assets/icons/publish.svg";
import refresh from "/public/assets/icons/refresh.svg";
import unpublish from "/public/assets/icons/un_publish.svg";
import image from "/public/assets/logo/dashboard_management/image.png";

interface AgentListProps {
  data: AgentRequest;
  isLoading: boolean;
}

const AgentRequestTable = ({ data, isLoading }: AgentListProps) => {
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [unPublishModalOpen, setUnPublishModalOpen] = useState(false);
  const [moreIfnoModalOpen, setMoreInfoModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const [userID, setUserID] = useState<string>();
  const [user, setUser] = useState<PendingAgent>();
  const { pendingAgents, pagination } = data || [];
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRowSelection = (id: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const toggleSelectAll = () => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.size === pendingAgents.length
        ? new Set()
        : new Set(pendingAgents.map((agent: PendingAgent) => agent.id))
    );
  };

  const isRowSelected = (id: string) => selectedRows.has(id);

  return (
    <div>
      <ApprovedDialog
        publishModalOpen={publishModalOpen}
        setPublishModalOpen={setPublishModalOpen}
        user={user}
      />
      <DeclinedDialog
        unPublishModalOpen={unPublishModalOpen}
        setUnPublishModalOpen={setUnPublishModalOpen}
        user={user}
      />
      <MoreInfoDialog
        moreIfnoModalOpen={moreIfnoModalOpen}
        setMoreInfoModalOpen={setMoreInfoModalOpen}
        user={user}
      />
      <ViewDetailsUser
        isViewDetailsOpen={isViewDetailsOpen}
        setIsViewDetailsOpen={setIsViewDetailsOpen}
        userID={userID}
      />

      <Card>
        <ScrollArea className="w-full border-none overflow-y-auto 2xl:h-full !h-[calc(100vh-330px)]">
          {isLoading ? (
            <div className="min-h-[250px] lg:min-h-[350px]">
              <DataLoader />
            </div>
          ) : pagination?.totalPendingAgents <= 0 ? (
            <div className="min-h-[250px] lg:min-h-[350px]">
              <NoDataComponent />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === pagination?.totalPendingAgents
                      }
                      onChange={toggleSelectAll}
                      aria-label="Select all applicants"
                      className="mt-1 ml-5 w-4 h-4 !rounded-lg"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>View Details</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Email Verification</TableHead>
                  <TableHead>Approval</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pendingAgents.map((agent: PendingAgent) => (
                  <TableRow
                    key={agent.id}
                    className={`${
                      isRowSelected(agent.id)
                        ? "bg-blue-50"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isRowSelected(agent.id)}
                        onChange={() => toggleRowSelection(agent.id)}
                        aria-label={`Select agent ${agent.firstName}`}
                        className="mt-1 ml-5 w-4 h-4"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-3 items-center">
                        <Image
                          src={image}
                          alt="Agent Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold">
                            {agent.firstName} {agent.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => {
                          setUserID(agent.id);
                          setIsViewDetailsOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </TableCell>

                    <TableCell>
                      {agent.aggrementExpiryDate
                        ? new Date(
                            agent.aggrementExpiryDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <EmailStatus emailVerified={agent.emailVerified} />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-x-2">
                        <div
                          onClick={() => {
                            setUser(agent);
                            setPublishModalOpen(true);
                          }}
                          className="py-2 px-3 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer hover:border-blue-700 active:scale-95 border-[#E1E5E7]"
                        >
                          <Image
                            src={publish}
                            alt="eye"
                            width={17}
                            height={17}
                          />
                        </div>

                        <div
                          onClick={() => {
                            setUser(agent);
                            setUnPublishModalOpen(true);
                          }}
                          className="py-2 px-3 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer hover:border-blue-700 active:scale-95 border-[#E1E5E7]"
                        >
                          <Image
                            src={unpublish}
                            alt="eye"
                            width={17}
                            height={17}
                          />
                        </div>

                        <div
                          onClick={() => {
                            setUser(agent);
                            setMoreInfoModalOpen(true);
                          }}
                          className="py-2 px-3 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer hover:border-blue-700 active:scale-95 border-[#E1E5E7]"
                        >
                          <Image
                            src={refresh}
                            alt="eye"
                            width={17}
                            height={17}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {pagination?.totalPendingAgents > 0 && (
          <Table>
            <TableFooter>
              <TableRow>
                <TableCell>
                  <AgentPagination totalPages={pagination?.totalPages} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AgentRequestTable;
