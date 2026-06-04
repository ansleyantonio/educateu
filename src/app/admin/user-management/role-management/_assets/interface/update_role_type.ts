import { UseFormReturn } from "react-hook-form";
import { RoleData } from "./role_type";

// Types
export type UIPermission = "Read" | "Write" | "Delete";
export type DBPermission = "GET" | "POST" | "DELETE";

// Mapping between UI permissions and database permissions
export const permissionMapping: Record<UIPermission, DBPermission> = {
  Read: "GET",
  Write: "POST",
  Delete: "DELETE",
};

export interface RoleModule {
  moduleName: string;
  moduleId: string;
  categoryId: string;
  modulePermissions: DBPermission[];
}

export interface updateRoleFormProps {
  form: UseFormReturn<RoleFormValues>;
  activeRole: RoleData;
  data: RoleModule[];
}

export interface RoleFormValues {
  roleName: string;
  modules: {
    [moduleId: string]: {
      selected: boolean;
      moduleName: string;
      permissions: {
        [permission in UIPermission]?: boolean;
      };
      categoryId: string;
    };
  };
}

export interface UpdatedRoleBody {
  roleName: string;
  modules: UpdateRoleModule[];
}

export interface UpdateRoleRequest {
  updatedRole: UpdatedRoleBody;
  token: string;
  roleId: string;
}

export interface UpdateRoleModule {
  moduleName: string;
  moduleId: string;
  categoryId: string;
  modulePermission: DBPermission[];
}
