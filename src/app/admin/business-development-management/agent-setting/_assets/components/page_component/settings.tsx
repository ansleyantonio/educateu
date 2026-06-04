/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CommissionSettingsTemplate } from "./commission-settings-template";
import { EnviromentSettings } from "./enviroment-settings";
import { AgreementNotifications } from "./aggrement-notifications";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";

export default function Settings() {
  const matchedModule = useMatchedModule();

  // const hasPostAndDeletePermission =
  //   matchedModule?.modulePermission.includes("POST") ||
  //   matchedModule?.modulePermission.includes("DELETE");
  const permissions = matchedModule?.modulePermission || [];
  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  return (
    <>
      <PageWithBreadcrumb
        items={[
          { title: "Home", href: "/admin" },
          // {
          //   title: "Business Development Management",
          //   href: "/admin/business-development-management/agent",
          // },
          { title: "Agent Settings" },
        ]}
      >
        <ScrollArea className="border-none h-[calc(100vh-150px)]">
          <div className="flex flex-col mt-6">
            <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#192128]">
              Agent Settings
            </h1>
            <CommissionSettingsTemplate
              hasPostAndDeletePermission={hasPostAndDeletePermission}
            />
            <EnviromentSettings
              hasPostAndDeletePermission={hasPostAndDeletePermission}
            />
            <AgreementNotifications
              hasPostAndDeletePermission={hasPostAndDeletePermission}
            />
          </div>
        </ScrollArea>
      </PageWithBreadcrumb>
    </>
  );
}
