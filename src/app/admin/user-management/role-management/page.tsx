"use client";

import CusPagination from "@/components/common/pagination/paginations";
import { CheckModulePermission } from "@/components/common/permission/permision";
import { Card } from "@/components/ui/custom_ui/customCard";
import { TableFooter } from "@/components/ui/custom_ui/table";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchListOfRoles } from "../_assets/query_controller/fetchListOfRoles";
import CreateRoleModal from "./_assets/component/role_create/create_role_modal";
import { RolemanagementToolbar } from "./_assets/component/role_management_data";
import { RolemanagementTable } from "./_assets/component/role_management_table";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
// import CustomPagination from "@/utils/pagination";

const RoleManagementPage = () => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const params = useSearchParams();
  const page = Number(params.get("page")) || 1;
  //
  const [roleFilterData, setRoleFilterData] = useState(null);

  const [currentPage, setCurrentPage] = useState(page);

  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useQuery({
    queryKey: [
      "fetch-list-of-roles",
      { page: currentPage, searchText, roleFilterData, token },
    ],
    queryFn: fetchListOfRoles,
    enabled: !!page,
  });

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  console.log(limit);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // { title: "User Management", href: "/admin/user-management/role-management" },
        { title: "Role Management",href: "/admin/user-management/role-management" },
      ]}
    >
      <div>
        {/* Header Section */}
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#272E35]">
            Role Management
          </h1>
          {/* <UpdateRoleModal activeRole={activeRole} /> */}

          {/* Create Roles Modal */}
          {CheckModulePermission(
            auth?.permission?.modules,
            "user-management",
            "POST"
          ) && <CreateRoleModal />}

          {/* <RoleManagement /> */}
        </div>
        <Card>
          {/* role management toolbar */}
          <RolemanagementToolbar
            searchText={searchText}
            total={data?.pagination?.total}
            setSearchText={setSearchText}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            setRoleFilterData={setRoleFilterData}
            setCurrentPage={setCurrentPage}
            setLimit={setLimit}
          />
          {/* Role Management Table */}
          {token && (
            <RolemanagementTable
              isRoleDataLoading={isLoading}
              rolesData={data?.data?.roles}
              token={token}
              auth={auth}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pagination={data?.pagination}
            />
          )}
        </Card>
      </div>
    </PageWithBreadcrumb>
  );
};

export default RoleManagementPage;
