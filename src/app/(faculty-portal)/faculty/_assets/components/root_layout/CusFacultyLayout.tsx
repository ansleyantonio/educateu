"use client";
import InactivityTracker from "@/utils/userInactivityTracking/useIdleTimer_inactivity_tracking";
import { usePathname } from "next/navigation";

import { useBreadcrumb } from "@/app/hook/breadcrumb/useBreadcrumb";
import { buildFinalMenuStructure } from "@/components/common/Menu/utils/AppMenuBarList";
import { AppBarSubNestedMenu } from "@/components/jsonData/AppBarSubMenuList/AppBarSubNestedMenu";
import { AppBarModuleListWithIconPath } from "@/components/jsonData/MenuOrModuleList/moduleListIconWithPath";
import MainLayout from "@/components/Layout/commonLayout";
import { useAuths } from "@/hooks/userContext";
import HomeLogo from "/public/assets/logo/agent/home.svg";
import {
  default as LogoutIcon,
  default as Profile,
} from "/public/assets/logo/agent/user-circle.svg";

const CusFacultyLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { breadcrumbs } = useBreadcrumb();

  const portalName = "faculty";

  const isHeaderFull =
    pathname.startsWith("/faculty/admission") &&
    pathname !== "/faculty/admission";

  const LoginPage = pathname === "/faculty/login";

  InactivityTracker("/faculty/login", 10); // Now uses debounced idle detection

  const auth = useAuths();

  const moduleList = auth?.permission?.modules;

  //final menu list ()
  const MenuList = buildFinalMenuStructure(
    moduleList,
    AppBarModuleListWithIconPath.faculty,
    AppBarSubNestedMenu.faculty
  );

  // Others Menu
  const OthersMenu = {
    homeMenu: [
      {
        href: "/faculty",
        label: "Home",
        icon: HomeLogo,
      },
    ],
    profileItem: [
      {
        href: "/faculty/profile",
        label: "Profile",
        icon: Profile,
      },
    ],
    logoutItem: [
      {
        href: "/faculty/login",
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
      subSideBar={<div></div>}
    >
      {children}
    </MainLayout>
  );
};

export default CusFacultyLayout;
