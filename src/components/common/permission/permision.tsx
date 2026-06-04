export function CheckModulePermission(
  modules: {
    moduleId: string;
    moduleName: string;
    modulePermission: string[];
    permissionType: string;
    permissionStartDate: string | null;
    permissionEndDate: string | null;
    manualRevocation: boolean;
  }[],
  moduleName: string,
  permission: string
): boolean {
  // console.log("modules", modules);
  // console.log("moduleName", moduleName);
  // console.log("permission", permission);
  // Find the module by name
  const foundModule = modules?.find((m) => m.moduleName === moduleName);

  // Check if module exists and contains the required permission
  return foundModule
    ? foundModule?.modulePermission?.includes(permission)
    : false;
}
