/* eslint-disable @typescript-eslint/no-explicit-any */
export function filterPermissionsData(data: any) {
  return {
    userId: data.userId,
    portalCategories: data.portalCategories
      .map((category: any) => {
        const filteredModules = category.modules.filter(
          (module: any) => module?.modulePermission?.length > 0,
        );
        return filteredModules.length > 0
          ? {
              portalCategoryId: category.portalCategoryId,
              permissionType: category.permissionType,
              permissionStartDate: category.permissionStartDate,
              permissionEndDate: category.permissionEndDate,
              // days: category.days,
              manualRevocation: category.manualRevocation,
              modules: filteredModules,
            }
          : null;
      })
      .filter((category: any) => category !== null),
  };
}
