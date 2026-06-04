/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckModulePermission } from "@/components/common/permission/permision";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "lucide-react";
import UpdateRoleModal from "./role_update/update_role_modal";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

interface RoleData {
  id: string;
  name: string;
  portalCategoryId: string;
  portalCategory: { id: string; name: string };
  userCount: number;
  roleModules: any[];
}

interface RolemanagementTableProps {
  isRoleDataLoading: boolean;
  rolesData: RoleData[];
  token: string;
  auth: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pagination: any;
}

export function RolemanagementTable({
  token,
  rolesData,
  isRoleDataLoading,
  auth,
  currentPage,
  setCurrentPage,
  pagination,
}: RolemanagementTableProps) {
  return (
    <DynamicTableWithPagination
      data={rolesData || []}
      isLoading={isRoleDataLoading}
      pagination={pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      config={{
        columns: [
          {
            key: "name",
            header: "Role Name",
            className: "pl-6 capitalize",
            render: (item: any) => (
              <span className="capitalize">{item.name}</span>
            ),
          },
          {
            key: "portalCategory",
            header: "Portal",
            render: (item: any) => (
              <span className="capitalize">
                {item.portalCategory?.name ?? "-"}
              </span>
            ),
          },
          {
            key: "roleModules",
            header: "System Module",
            className: "max-w-[350px]",
            render: (item: any) => (
              <div
                className="max-w-[350px] truncate"
                title={
                  item.roleModules
                    ?.map((module: any) => module.module.name)
                    .join(", ") || "-"
                }
              >
                <span className="truncate block">
                  {item.roleModules
                    ?.map((module: any) => module.module.name)
                    .join(", ") || "-"}
                </span>
              </div>
            ),
          },
          {
            key: "userCount",
            header: "No. of Users",
            render: (item: any) => <span>{item.userCount ?? "-"}</span>,
          },
          {
            key: "actions",
            header: "Action",
            className: "text-right pr-8",
            render: (item: any) => (
              <div className="flex justify-end mr-6">
                {CheckModulePermission(
                  auth?.permission?.modules,
                  "user-management",
                  "POST"
                ) ? (
                  <UpdateRoleModal item={item} token={token} />
                ) : (
                  <span>...</span>
                )}
              </div>
            ),
          },
        ],
        emptyMessage: "No roles found.",
      }}
    />
  );
}
