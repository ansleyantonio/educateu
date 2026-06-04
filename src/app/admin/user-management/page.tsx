"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { CheckModulePermission } from "@/components/common/permission/permision";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/custom_ui/customCard";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { AssignModuleModal } from "./_assets/components/modal/AssignModuleModal";
import ExcelModal from "./_assets/components/modal/excelModal";
import { CreateUser } from "./_assets/components/page_components/createUserModal";
import { FilterUserList } from "./_assets/components/page_components/filterUserListSideBar";
import ListOfUsers from "./_assets/components/page_components/ListOfUsers";
import { fetchFilterLists } from "./_assets/query_controller/fetchFilterList";
import { TemporaryAccessModal } from "./temporary-access-management/_assets/components/page_components/modal/temporary_access_modal";

type ModulePermission = "GET" | "POST" | "DELETE";

type Module = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type UserPortalCategoryModule = {
  id: string;
  userId: string;
  portalCategoryId: string;
  moduleId: string;
  modulePermission: ModulePermission[];
  permissionType: "ROLE" | "PERMANENT";
  permissionStartDate: string | null;
  permissionEndDate: string | null;
  manualRevocation: boolean;
  createdAt: string;
  updatedAt: string;
  module: Module;
};

type UserRole = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
  address: string | null;
  emailVerified: boolean;
  passwordChanged: boolean;
  createdAt: string;
  updatedAt: string;
  userStatus: "ACTIVE" | "INACTIVE";
  isForceLogout: boolean;
  userRoles: UserRole[];
  userPortalCategoryModules: UserPortalCategoryModule[];
};

type UsersResponse = {
  users: User[];
};

const AdminUserManagement = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [userFilterData, setUserFilterData] = useState(null);
  // const [filteredUserList, setFilteredUserList] = useState<any[] | null>(null);
  const [filteredUserList, setFilteredUserList] = useState<{
    totalRecords: number;
    data: UsersResponse;
  } | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isBulkUploadModal, setIsBulUploadModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState("10");

  const [
    openLotOfModuleModuleAssignModal,
    setOpenLotOfModuleModuleAssignModal,
  ] = useState(false);

  const [openLotOfTemporaryAssignModal, setOpenLotOfTemporaryAssignModal] =
    useState(false);

  const user = useAuths();
  const token = user?.user?.token;

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  console.log(limit);

  const closeModal = () => {
    setOpenLotOfModuleModuleAssignModal(false);
  };

  const HandelAssignModule = () => {
    setOpenLotOfModuleModuleAssignModal(true);
  };

  const HandelAssignTemporaryModule = () => {
    setOpenLotOfTemporaryAssignModal(true);
  };

  const closeTemporaryModal = () => {
    setOpenLotOfTemporaryAssignModal(false);
  };

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  // console.log("USER MANAGEMENT",hasPostAndDeletePermission);

  const handleBulkUploadModal = () => {
    setIsBulUploadModal(true);
  };

  // console.log("userFilterData in User Field", filteredUserList?.totalRecords);

  const [category, setCategory] = useState("");
  // const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  // const params = useSearchParams();
  // const page = params.get("page") || 1;
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const { data, isLoading, refetch } = useFetchData({
    filterData: { page: currentPage, category, search: searchText },
    queryKey: "fetch-list-of-users",
    method: "GET",
    path: "user-management/user/users",
  });

  const handleClearFilters = () => {
    setFilteredUserList(null);
    setIsFiltered(false);
  };

  const refetchFilteredUserList = async () => {
    if (!userFilterData || !token) return;

    try {
      const response = await fetchFilterLists({ body: userFilterData, token });
      const newData = response?.data || [];

      setFilteredUserList(newData);
      setIsFiltered(true);
    } catch (error) {
      console.error("Failed to refetch filtered user list:", error);
    }
  };

  // useEffect(() => {
  //   setCurrentPage(page);
  // }, [page]);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home" },
        // { title: "User Management", href: "/admin/user-management" },
        { title: "User" },
      ]}
    >
      <div>
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#272E35]">
            Users
          </h1>
          <div className="flex gap-3 items-center flex-wrap">
            <Button
              variant="primary"
              disabled={selectedRows.size < 1 || !hasPostAndDeletePermission}
              onClick={() => {
                if (!hasPostAndDeletePermission) return;
                HandelAssignModule();
              }}
              className={
                !hasPostAndDeletePermission
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            >
              Assign Module
            </Button>

            <TemporaryAccessModal
              id={Array.from(selectedRows)}
              category={category}
              lotOfUser={true}
              isOpen={openLotOfTemporaryAssignModal}
              closeModal={closeTemporaryModal}
            />

            <Button
              variant="primary"
              disabled={selectedRows.size < 1 || !hasPostAndDeletePermission}
              onClick={() => {
                if (!hasPostAndDeletePermission) return;
                HandelAssignTemporaryModule();
              }}
              className={
                !hasPostAndDeletePermission
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            >
              Assign Temporary Access
            </Button>

            {CheckModulePermission(
              user?.permission?.modules,
              "user-management",
              "POST"
            ) && <CreateUser />}

            <Button
              variant="outline"
              onClick={handleBulkUploadModal}
              disabled={!hasPostAndDeletePermission}
              className={`${
                !hasPostAndDeletePermission
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                pointerEvents: !hasPostAndDeletePermission ? "auto" : "auto",
              }}
            >
              Bulk Upload
            </Button>
          </div>
        </div>

        <Card>
          {/* search plus filter */}
          <div className="flex flex-wrap gap-2 justify-between items-center py-4 px-6">
            <div className="flex gap-2 justify-start items-center">
              <h1 className="text-base font-bold leading-6 text-black">
                User List
              </h1>
              <button className="flex gap-x-2 items-center py-1 px-2 text-xs rounded-full text-[#013E5B] bg-[#F0F9FF]">
                {/* {data?.totalUsers || 0} users */}
                {/* {filteredUserList?.totalRecords ? filteredUserList?.totalRecords : data?.totalUsers} Users */}
                {isFiltered
                  ? filteredUserList?.totalRecords ?? 0
                  : data?.totalUsers ?? 0}{" "}
                Users
              </button>
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
            <div className="flex gap-3 items-center flex-wrap">
              {isFiltered && (
                // Clear Filter
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserFilterData(null);
                    setFilteredUserList(null);
                    setIsFiltered(false);
                  }}
                >
                  Filter Clear
                </Button>
              )}
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                setLimit={setLimit}
                totalItems={data?.totalUsers}
                setCurrentPage={setCurrentPage}
              />

              {/* Filter */}
              <Button
                onClick={() => setIsOpenModal(true)}
                variant="outline"
                size="sm"
                className="p-2 h-10 font-semibold text-[#555F6D]"
              >
                <HiOutlineFilter size={25} color="#555F6D" />
                Filter
              </Button>

              <FilterUserList
                setUserFilterData={setUserFilterData}
                setIsOpenModal={setIsOpenModal}
                isOpenModal={isOpenModal}
                onFilterResult={(response) => {
                  const newData = response?.data || [];
                  setFilteredUserList(newData);
                  setIsFiltered(true);
                }}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* list of users */}
          <div>
            <ListOfUsers
              category={category}
              setCategory={setCategory}
              // data={filteredUserList? filteredUserList : data}
              data={data}
              filteredUserList={filteredUserList}
              isFiltered={isFiltered}
              isLoading={isLoading}
              refetch={refetch}
              refetchFilteredUserList={refetchFilteredUserList}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </Card>
        <ExcelModal
          isOpen={isBulkUploadModal}
          onClose={() => setIsBulUploadModal(false)}
          onUploadSuccess={() => {
            if (isFiltered) {
              refetchFilteredUserList();
            } else {
              refetch();
            }
          }}
        />
        <AssignModuleModal
          id={Array.from(selectedRows)}
          category={category}
          lotOfUser={true}
          isOpen={openLotOfModuleModuleAssignModal}
          closeModal={closeModal}
          onAssignSuccess={() => setSelectedRows(new Set())}
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default AdminUserManagement;
