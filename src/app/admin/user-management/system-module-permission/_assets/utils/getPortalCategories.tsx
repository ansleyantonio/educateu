/* eslint-disable @typescript-eslint/no-explicit-any */
export function getPortalCategories(data: any) {
  return data?.map((item: any) => item.portalCategoryName).join(",");
  // return data.map((item: any) => item.portalCategory.name).join(",");
}

export function getRole(data: any) {
  // return data
  //   ?.map(
  //     (item: any) =>
  //       `category: ${item.portalCategoryName}, role: ${item.roles
  //         .map((role: any) => role.roleName)
  //         .join(", ")}`
  //   )
  //   .join(" | ");
  return data
    .flatMap((item: any) => item.roles.map((role: any) => role.roleName))
    .join(",");
}
