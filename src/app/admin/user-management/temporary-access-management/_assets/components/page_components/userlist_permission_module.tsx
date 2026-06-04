/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import AgentPagination from "@/app/(agent-portal)/agent/application-management/_assets/components/page_components/pagination";
import ListOfUserLOaderLoader from "@/app/admin/user-management/_assets/components/page_components/loading_page/listOfUserList";
import {
  CreateUsers,
  UserListType,
} from "@/app/admin/user-management/_assets/interface/CreateUserSchema";
import { CheckModulePermission } from "@/components/common/permission/permision";
import TooltipComponent from "@/components/common/TooltipComponent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
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
import { getPortalCategories, getRole } from "../../utils/getPortalCategories";
import { TemporaryAccessListBySingleUser } from "./modal/listOfTemporaryBySingleUserModal";
import { TemporaryAccessModal } from "./modal/temporary_access_modal";
interface ModalState {
  type: "assignPortal" | "assignRole" | "assignModule" | null;
  selectedId: string | null;
}

interface ListOfUsersProps {
  data: UserListType;
  isLoading: boolean;
  selectedRows: Set<string>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
  auth: any;
}

const UserListOfPermissionModule = ({
  data,
  isLoading,
  selectedRows,
  auth,
  setSelectedRows,
}: ListOfUsersProps) => {
  console.log("Selected Rows", typeof selectedRows);
  // Toggle selection for individual row
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prevSelectedRows) => {
      const newSelectedRows = new Set(prevSelectedRows);
      newSelectedRows.has(id)
        ? newSelectedRows.delete(id)
        : newSelectedRows.add(id);
      return newSelectedRows;
    });
  };

  // Toggle selection for all rows
  const toggleSelectAll = () => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.size === data?.data?.length
        ? new Set()
        : new Set(data?.data?.map((item) => item.id)),
    );
  };

  // modal open -------------
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    selectedId: null,
  });

  const closeModal = () => {
    setModalState({ type: null, selectedId: null });
  };

  const openModal = (type: ModalState["type"], id: string) => {
    setSelectedRows(new Set());
    setModalState((prevState) => ({
      ...prevState,
      type,
      selectedId: id,
    }));
  };

  return (
    <div className="">
      <TemporaryAccessModal
        id={[`${modalState.selectedId}`]}
        isOpen={modalState.type === "assignModule"}
        closeModal={closeModal}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-230px)]">
          <ListOfUserLOaderLoader />
        </div>
      ) : (
        <ScrollArea className="w-full border-none 2xl:h-full h-[calc(100vh-280px)]">
          {data?.data?.length === 0 ? (
            <div className="flex justify-center items-center h-[calc(100vh-230px)]">
              <span>No data found</span>
            </div>
          ) : (
            <ScrollArea className="w-full border-none 2xl:h-full h-[calc(100vh-280px)]">
              {data?.data?.length === 0 ? (
                <div className="flex justify-center items-center h-[calc(100vh-230px)]">
                  <span>No data found</span>
                </div>
              ) : (
                <Table className="border-r border-b border-collapse bg-[#FFFFFF]">
                  <TableHeader className="bg-[#F5F7F9]">
                    <TableRow>
                      <TableHead className="pl-6 w-[30px]">
                        <Checkbox
                          checked={selectedRows?.size === data?.data?.length} // Proper select all logic
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      {/* <TableHead>User Access</TableHead> */}
                      <TableHead className="">Portal Category</TableHead>

                      <TableHead>Roles</TableHead>
                      <TableHead className="pr-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.map((user: CreateUsers) => (
                      <TableRow key={user.id}>
                        <TableCell className="pl-6 w-[25px]">
                          <Checkbox
                            checked={selectedRows.has(user.id)}
                            onCheckedChange={() => toggleRowSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <TemporaryAccessListBySingleUser user={user} />
                        </TableCell>
                        <TableCell className="overflow-hidden whitespace-nowrap max-w-[270px] truncate text-ellipsis">
                          <TooltipComponent lowercase={true} text={user?.email}>
                            {/* <span className="block truncate">{user?.id}</span> */}
                          </TooltipComponent>
                        </TableCell>
                        {/* <TableCell className="2xl:pr-10 w-[135px] 2xl:w-[170px]"> */}
                        {/*   <UserAccessBadge accessType={`Full Access`} /> */}
                        {/* </TableCell> */}
                        <TableCell className="capitalize">
                          {(user as any).portalCategories?.length > 0
                            ? getPortalCategories(
                                (user as any).portalCategories,
                              )
                            : "Not Assigned"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {(user as any).portalCategories?.length > 0
                            ? getRole((user as any).portalCategories)
                            : "Not Assigned"}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {CheckModulePermission(
                            auth?.permission?.modules,
                            "user-management",
                            "POST",
                          ) ? (
                            <Button
                              variant="primary"
                              className="!py-1 !px-2"
                              // className="py-1 px-2 text-xs font-medium text-white rounded-md bg-[#3B82F6] hover:bg-[#3B82F6]/80"
                              onClick={() => openModal("assignModule", user.id)}
                            >
                              Assign Temporary Access
                            </Button>
                          ) : (
                            <span>...</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          )}
        </ScrollArea>
      )}
      {data?.data?.length > 0 && (
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>
                <AgentPagination totalPages={data.totalPages} />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
};

export default UserListOfPermissionModule;
