import { I_UpdateUserForm } from "@/app/admin/user-management/_assets/interface/CreateUserSchema";

export const UpdateUserDefaultValues = (
  defaults: Partial<I_UpdateUserForm> = {}
): I_UpdateUserForm => {
  return {
    firstName: defaults.firstName || "",
    lastName: defaults.lastName || "",
    username: defaults.username || "",
    email: defaults.email || "",
    mobile: defaults.mobile || "",
    // photo: defaults.photo ?? "",
    // websiteUrl: defaults.websiteUrl ?? "",
    // RoleId: defaults.RoleId ?? undefined,
  };
};
