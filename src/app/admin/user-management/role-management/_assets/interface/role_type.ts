export interface RoleData {
  roleId: string;
  roleName: string;
  categoryId: string;
  categoryName: string;
  systemModule: string;
  userCount: number;
}
export interface NewRole {
  token: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformedData: any;
}
