/* eslint-disable @typescript-eslint/no-explicit-any */ export interface Role {
  id: string;
  name: string;
  application: string[];
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  roleData: any | null;
  role: Role;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  address: string;
  userRoles: UserRole[];
  userStatus: string;
  activityStatus: string | null;
  applicationCreateStatus: "enable" | "disable";
}

export interface AuthResponse extends Partial<User> {
  userId: string;
  token: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  portName?: string;
  username?: string;
  roleName?: string;
  passwordChanged?: boolean;
  permission?:any;
}

export interface PortalList {
  roleId: string;
  roleName: string;
  portalName: string;
  portalCategoryId: string;
}

export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  modulePermission: string[];
  permissionType: string;
  permissionStartDate: string | null;
  permissionEndDate: string | null;
  manualRevocation: boolean;
}