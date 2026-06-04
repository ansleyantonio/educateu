"use client";

import { usePathname } from "next/navigation";
import { useAuths } from "@/hooks/userContext";

interface ModulePermission {
  moduleId: string;
  moduleName: string;
  modulePermission: string[];
  permissionType: string;
  permissionStartDate: string | null;
  permissionEndDate: string | null;
  manualRevocation: boolean;
}

export const useMatchedModule = (): ModulePermission | undefined => {
  const pathname = usePathname();
  const user = useAuths();

  const pathSegments = pathname?.split("/").filter(Boolean);

  const matchedModule = user?.permission?.modules?.find((mod: ModulePermission) =>
    pathSegments?.includes(mod.moduleName)
  );

  return matchedModule;
};