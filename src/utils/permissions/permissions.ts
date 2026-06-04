export function getUserAccess(permissions: string[]): "full-access" | "read-only" | "no-access" | "delete-access"{
  const hasGet = permissions.includes("GET");
  const hasEdit = permissions.includes("POST");
  const hasDelete = permissions.includes("DELETE");

  if (!hasGet) return "no-access";

  if ((hasGet && hasEdit) || (hasGet && hasEdit && hasDelete)) return "full-access";

  if (hasGet && hasDelete) return "delete-access";

  return "read-only";
}