/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { CheckModulePermission } from "@/components/common/permission/permision";
import TooltipComponent from "@/components/common/TooltipComponent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuths } from "@/hooks/userContext";
import { getUserBasicInfo } from "@/utils/getUserBasicInfo/getUserBasicInfo";
import Link from "next/link";
import { useState } from "react";
import {
  getPortalCategories,
  getRole,
} from "../../../system-module-permission/_assets/utils/getPortalCategories";
import { TemporaryAccessModal } from "../../../temporary-access-management/_assets/components/page_components/modal/temporary_access_modal";
import { CreateUsers } from "../../interface/CreateUserSchema";
import { AssignPortalModal } from "../modal/assign_portalModal";
import { AssignModuleModal } from "../modal/AssignModuleModal";
import { AssignRoleModal } from "../modal/assignRoleModal";
import ResetPasswordModal from "../modal/ResetPasswordModal";
import SessionTerminationModal from "../modal/session_terminationModal";
import UserName from "./Form/user_name";
import { MfaEnabledDisabled } from "./MFA/MFA";
import CusTooltipComponent from "./tooltip/Tooltip";
import { UpdateUserModal } from "./updateUser/updateUserModal";
import UserStatusChangeModal from "./userStatusChangeModal";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";


interface ModalState {
  type:
    | "assignPortal"
    | "assignRole"
    | "assignModule"
    | "resetPassword"
    | "assignTemporaryModule"
    | null;
  selectedId: string | null;
}

const ListOfUsers = ({
  data,
  isLoading,
  refetch,
  category,
  setCategory,
  filteredUserList,
  isFiltered,
  onFilteredUserUpdate,
  refetchFilteredUserList,
  selectedRows = new Set(),
  setSelectedRows = () => {},
  currentPage,
  setCurrentPage,
}: {
  data: any;
  isLoading: boolean;
  refetch: () => void;
  setCategory: (category: string) => void;
  category: string;
  filteredUserList?: any;
  isFiltered?: boolean;
  onFilteredUserUpdate?: () => void;
  refetchFilteredUserList?: () => void;
  selectedRows?: Set<string>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<string>>>;
  currentPage: number;
  setCurrentPage: (data: number) => void;
}) => {
  const auth = useAuths();
  
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    selectedId: null,
  });
  
  const [assignModuleUsers, setAssignModuleUsers] = useState<any[]>([]);
  const [openUserUpdateModal, setOpenUserUpdateModal] = useState(false);
  const [UpdateUser, setUpdateUser] = useState({});
  const [openSessionTerminationModal, setOpenSessionTerminationModal] = useState(false);

  // Determine data source based on filtering
  let usersToShow: any[] = [];
  let paginationData = {
    page: currentPage,
    total: 0,
    totalPages: 1,
  };

  if (isFiltered) {
    usersToShow = filteredUserList?.users || [];
    paginationData = {
      page: currentPage,
      total: filteredUserList?.total || 0,
      totalPages: filteredUserList?.totalPages || 1,
    };
  } else {
    usersToShow = data?.data || [];
    paginationData = {
      page: currentPage,
      total: data?.total || 0,
      totalPages: data?.totalPages || 1,
    };
  }

  // Convert Set to Array for DynamicTableWithPagination
  const selectedIds = Array.from(selectedRows);

  // Convert Array back to Set for parent component
  const handleSetSelectedIds = (ids: string[]) => {
    setSelectedRows(new Set(ids));
  };

  // Function to open a modal with the correct user ID
  const openModal = (type: ModalState["type"], id: string) => {
    setModalState((prevState) => ({
      ...prevState,
      type,
      selectedId: id,
    }));

    if (
      type === "assignModule" ||
      type === "resetPassword" ||
      type === "assignTemporaryModule" ||
      type === "assignRole"
    ) {
      const userInfo = usersToShow?.find((user) => user.id === id);
      if (userInfo) {
        setAssignModuleUsers([getUserBasicInfo(userInfo)]);
      }
    }
  };

  const openUpdateUserHandel = (user: any) => {
    setOpenUserUpdateModal(true);
    setUpdateUser(user);
    setAssignModuleUsers([getUserBasicInfo(user)]);
  };

  const openSessionTerminationModalHandel = (user: any) => {
    setOpenSessionTerminationModal(true);
    setUpdateUser(user);
    setAssignModuleUsers([getUserBasicInfo(user)]);
  };

  const closeModal = () => {
    setModalState({ type: null, selectedId: null });
  };

  return (
    <div>
      {/* Modals */}
      <UpdateUserModal
        open={openUserUpdateModal}
        setOpen={setOpenUserUpdateModal}
        user={UpdateUser}
        refetchFilteredUserList={refetchFilteredUserList ? refetchFilteredUserList : ""}
        userInfo={assignModuleUsers}
      />

      <AssignPortalModal
        id={`${modalState.selectedId}`}
        category={category}
        isOpen={modalState.type === "assignPortal"}
        closeModal={closeModal}
      />

      <AssignRoleModal
        id={`${modalState.selectedId}`}
        isOpen={modalState.type === "assignRole"}
        closeModal={closeModal}
        refetchFilteredUserList={refetchFilteredUserList}
        userInfo={assignModuleUsers}
      />

      <AssignModuleModal
        id={[`${modalState.selectedId}`]}
        isOpen={modalState.type === "assignModule"}
        closeModal={closeModal}
        userInfo={assignModuleUsers}
      />

      <ResetPasswordModal
        id={`${modalState.selectedId}`}
        isOpen={modalState.type === "resetPassword"}
        closeModal={closeModal}
        userInfo={assignModuleUsers}
      />

      <SessionTerminationModal
        isOpen={openSessionTerminationModal}
        user={UpdateUser}
        setOpenSessionTerminationModal={setOpenSessionTerminationModal}
        userInfo={assignModuleUsers}
      />

      <TemporaryAccessModal
        id={[`${modalState.selectedId}`]}
        isOpen={modalState.type === "assignTemporaryModule"}
        closeModal={closeModal}
        userInfo={assignModuleUsers}
      />

      {/* Dynamic Table */}
      <DynamicTableWithPagination
        data={usersToShow}
        isLoading={isLoading}
        pagination={paginationData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedIds={selectedIds}
        setSelectedIds={handleSetSelectedIds}
        config={{
          columns: [
            {
              key: "userName",
              header: "User Name",
              className: "pl-6 min-w-[100px]",
              render: (user: CreateUsers) => (
                <Link href={`/admin/user-management/${user?.id}`}>
                  <UserName user={user} />
                </Link>
              ),
            },
            {
              key: "id",
              header: "User Account No.",
              className: "whitespace-nowrap max-w-[130px] truncate text-ellipsis",
              render: (user: CreateUsers) => (
                <CusTooltipComponent
                  copy={true}
                  lowercase={true}
                  text={user.id}
                />
              ),
            },
            {
              key: "email",
              header: "Email",
              className: "w-[13%] max-w-[250px] truncate text-ellipsis whitespace-nowrap",
              render: (user: CreateUsers) => (
                <TooltipComponent lowercase={true} text={user?.email} />
              ),
            },
            {
              key: "roles",
              header: "Roles",
              className: "capitalize",
              render: (user: any) => (
                <>
                  {user.portalCategories?.length > 0
                    ? getRole(user.portalCategories)
                    : "Not Assigned"}
                </>
              ),
            },
            {
              key: "portalCategory",
              header: "Portal Category",
              className: "capitalize",
              render: (user: any) => (
                <>
                  {user.portalCategories?.length > 0
                    ? getPortalCategories(user.portalCategories)
                    : "Not Assigned"}
                </>
              ),
            },
            {
              key: "mfa",
              header: "MFA",
              className: "capitalize",
              render: (user: CreateUsers) => <MfaEnabledDisabled user={user} />,
            },
            {
              key: "actions",
              header: "Action",
              className: "pr-6 text-right",
              render: (user: CreateUsers) => (
                <div className="flex gap-2 justify-end items-center">
                  {CheckModulePermission(
                    auth?.permission?.modules,
                    "user-management",
                    "POST"
                  ) && (
                    <UserStatusChangeModal
                      id={user?.id}
                      status={user.userStatus}
                      refetch={refetch}
                      userInfo={user}
                    />
                  )}

                  <div>
                    {CheckModulePermission(
                      auth?.permission?.modules,
                      "user-management",
                      "POST"
                    ) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="py-3 cursor-pointer">...</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-3">
                          <DropdownMenuGroup>
                            <DropdownMenuItem>
                              <div
                                onClick={() => openUpdateUserHandel(user)}
                                className="w-full cursor-pointer"
                              >
                                <span className="cursor-pointer">Update User</span>
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <div
                                className="w-full cursor-pointer"
                                onClick={() => openModal("assignRole", user.id)}
                              >
                                Assign Role
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <button
                                className={`w-full bg-transparent text-start ${
                                  selectedRows.size >= 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
                                }`}
                                disabled={selectedRows.size >= 1}
                                onClick={() => openModal("assignModule", user.id)}
                              >
                                Assign Module
                              </button>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <div
                                className="w-full cursor-pointer"
                                onClick={() => openModal("resetPassword", user.id)}
                              >
                                Reset Password
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <div
                                className="w-full cursor-pointer"
                                onClick={() => openSessionTerminationModalHandel(user)}
                              >
                                Session Termination
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <button
                                className={`w-full bg-transparent ${
                                  selectedRows.size >= 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
                                }`}
                                disabled={selectedRows.size >= 1}
                                onClick={() =>
                                  openModal("assignTemporaryModule", user.id)
                                }
                              >
                                Assign Temporary Access
                              </button>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span>...</span>
                    )}
                  </div>
                </div>
              ),
            },
          ],
        }}
        isCheckBox
      />
    </div>
  );
};

export default ListOfUsers;