"use client";
import { CheckModulePermission } from "@/components/common/permission/permision";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/custom_ui/customCard";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { AssignModuleModal } from "../_assets/components/modal/AssignModuleModal";
import { FilterUserList } from "../_assets/components/page_components/filterUserListSideBar";
import { fetchListOfUsers } from "../_assets/query_controller/fetchAllUsers";
import UserListOfPermissionModule from "./_assets/components/page_components/userlist_permission_module";

const AdminUserPermission = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [userFilterData, setUserFilterData] = useState(null);
  const auth = useAuths();
  const token = auth?.user?.token;

  const params = useSearchParams();
  const page = Number(params.get("page")) || 1;

  // const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(page);
  const [
    openLotOfModuleModuleAssignModal,
    setOpenLotOfModuleModuleAssignModal,
  ] = useState(false);

  const isBlankModuleAssign = category === "" || category === "all";

  const { data, isLoading } = useQuery({
    queryKey: [
      "fetch-list-of-users",
      { page: currentPage, token, category, searchText },
    ],
    queryFn: fetchListOfUsers,
  });

  // useEffect(() => {
  //   setCurrentPage(page);
  // }, [page]);

  const closeModal = () => {
    // console.log("selected id", selectedRows);
    // console.log("selected id array", [...selectedRows]);

    setOpenLotOfModuleModuleAssignModal(false);
  };

  const HandelAssignModule = () => {
    setOpenLotOfModuleModuleAssignModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 h-10 bg-[#FFFFFF]">
        <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#272E35]">
          System Module & Permissions
        </h1>

        {CheckModulePermission(
          auth?.permission?.modules,
          "user-management",
          "POST"
        ) && (
          <AssignModuleModal
            id={Array.from(selectedRows)}
            category={category}
            lotOfUser={true}
            isOpen={openLotOfModuleModuleAssignModal}
            closeModal={closeModal}
          />
        )}
      </div>

      {/* <div className="mt-6 rounded-md border shadow-md border-1 border-[#EAEDF0]"> */}
      <Card>
        {/* search plus filter */}

        <div className="flex gap-1 justify-between items-center py-4 px-6">
          <div className="flex gap-2 justify-start items-center w-full">
            <h1 className="text-base font-bold leading-6 text-[#000000]">
              User List
            </h1>
            <span className="flex gap-x-2 items-center py-1 px-2 text-xs rounded-full text-[#013E5B] bg-[#F0F9FF]">
              {data?.totalUsers || 0} users
            </span>
          </div>

          {/* <div className="flex gap-2 justify-center items-center w-full">
            <div>
              <p>Portal Category</p>
            </div>
            <div>
              <Select
                defaultValue="all"
                onValueChange={(pre) => setCategory(pre)}
              >
                <SelectTrigger className="min-w-[120px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* <div className="flex gap-x-3 justify-start w-full"> */}
          <div className="flex gap-x-3 items-center">
            <CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <Button
              onClick={() => setIsOpenModal(true)}
              variant="outline"
              size="sm"
              className="p-2 ml-auto h-10 font-semibold text-[#555F6D]"
            >
              <HiOutlineFilter size={25} color="#555F6D" />
              Filter
            </Button>
            <FilterUserList
              setUserFilterData={setUserFilterData}
              setIsOpenModal={setIsOpenModal}
              isOpenModal={isOpenModal}
            />

            {!isBlankModuleAssign &&
              CheckModulePermission(
                auth?.permission?.modules,
                "user-management",
                "POST"
              ) && (
                <Button
                  variant="primary"
                  disabled={selectedRows.size < 1}
                  onClick={() => HandelAssignModule()}
                >
                  Assign System Module
                </Button>
              )}
            {/* <Button
                  variant="primary"
                  disabled={selectedRows.size < 1}
                  onClick={() => setIsOpen(true)}
                >
                  Assign System Module
                </Button> */}

            {/* Assign System Module  Dialog */}
            {/* <SystemModuleDialog
              selectedRows={selectedRows}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            /> */}
          </div>
        </div>

        {/* list of users */}
        <div>
          <UserListOfPermissionModule
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            data={data}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminUserPermission;
