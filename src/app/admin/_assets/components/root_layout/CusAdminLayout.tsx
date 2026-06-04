"use client";
import InactivityTracker from "@/utils/userInactivityTracking/useIdleTimer_inactivity_tracking";
import { usePathname } from "next/navigation";

import { useBreadcrumb } from "@/app/hook/breadcrumb/useBreadcrumb";
import { buildFinalMenuStructure } from "@/components/common/Menu/utils/AppMenuBarList";
import { AppBarSubNestedMenu } from "@/components/jsonData/AppBarSubMenuList/AppBarSubNestedMenu";
import { AppBarModuleListWithIconPath } from "@/components/jsonData/MenuOrModuleList/moduleListIconWithPath";
import MainLayout from "@/components/Layout/commonLayout";
import { useAuths } from "@/hooks/userContext";
import { AdminSubSidebarMenu } from "./subSideBar/subSideBar";
import HomeLogo from "/public/assets/logo/agent/home.svg";
import {
  default as LogoutIcon,
  default as Profile,
} from "/public/assets/logo/agent/user-circle.svg";

const CusAdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { breadcrumbs } = useBreadcrumb();
  const portalName = "admin";
  const pathname = usePathname();
  const isHeaderFull =
    // pathname === "/admin" ||
    // pathname === "/admin/password" ||
    (pathname.startsWith("/admin/admissions/admission") &&
      pathname !== "/admin/admissions/admission") ||
    (pathname.startsWith("/admin/admissions/additional-file-check") &&
      pathname !== "/admin/admissions/additional-file-check");
  // pathname === "/admin/wellbeing" ||
  // pathname === "/admin/pre-screening" ||
  // pathname === "/admin/profile";

  const LoginPage = pathname === "/admin/login";

  InactivityTracker("/admin/login", 10); // Now uses debounced idle detection

  const auth = useAuths();

  const moduleList = auth?.permission?.modules;

  //final menu list ()
  const MenuList = buildFinalMenuStructure(
    moduleList,
    AppBarModuleListWithIconPath.admin,
    AppBarSubNestedMenu.admin
  );

  // Others Menu
  const OthersMenu = {
    homeMenu: [
      {
        href: "/admin",
        label: "Home",
        icon: HomeLogo,
      },
    ],
    profileItem: [
      {
        href: "/admin/profile",
        label: "Profile",
        icon: Profile,
      },
    ],
    logoutItem: [
      {
        href: "/admin/login",
        label: "Logout",
        icon: LogoutIcon,
      },
    ],
  };

  if (LoginPage) {
    return <>{children}</>;
  }

  return (
    <MainLayout
      isHeaderFull={isHeaderFull}
      breadcrumbs={breadcrumbs}
      MenuList={MenuList}
      OthersMenu={OthersMenu}
      portalName={portalName}
      subSideBar={<AdminSubSidebarMenu />}
    >
      {children}
    </MainLayout>
  );
};

export default CusAdminLayout;
