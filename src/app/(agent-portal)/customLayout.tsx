"use client";
import { buildFinalMenuStructure } from "@/components/common/Menu/utils/AppMenuBarList";
import { AppBarSubNestedMenu } from "@/components/jsonData/AppBarSubMenuList/AppBarSubNestedMenu";
import { AppBarModuleListWithIconPath } from "@/components/jsonData/MenuOrModuleList/moduleListIconWithPath";
import MainLayout from "@/components/Layout/commonLayout";
import { useAuths } from "@/hooks/userContext";
import InactivityTracker from "@/utils/userInactivityTracking/useIdleTimer_inactivity_tracking";
import { useParams, usePathname } from "next/navigation";
import { useBreadcrumb } from "../hook/breadcrumb/useBreadcrumb";
import { AgentSubSidebarMenu } from "./agent/application-management/[id]/_assets/components/sub_side_bar_menu";
import HomeLogo from "/public/assets/logo/agent/home.svg";
import {
  default as LogoutIcon,
  default as Profile,
} from "/public/assets/logo/agent/user-circle.svg";
const CusAgentLayout = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuths();
  // console.log("auth", auth);
  const portalName = "agent";

  const pathname = usePathname();
  const { breadcrumbs } = useBreadcrumb();

  const { id } = useParams();
  const isHeaderFull =
    // pathname === "/agent" ||
    // pathname === "/admin/profile" ||
    // pathname === "/agent/sub-agent-management" ||
    // pathname === "/agent/application-management" ||
    // pathname === "/agent/password" ||
    // pathname === `/agent/application-management/${id}`;
    pathname.startsWith(`/agent/application-management/${id}`);

  // pathname === "/agent/profile";

  const LoginPage = pathname === "/agent/login";

  InactivityTracker("/agent/login", 10); // Now uses debounced idle detection

  const moduleList = auth?.permission?.modules;

  //final menu list ()
  const MenuList = buildFinalMenuStructure(
    moduleList,
    AppBarModuleListWithIconPath.agent,
    AppBarSubNestedMenu.agent
  );

  // Others Menu
  const OthersMenu = {
    homeMenu: [
      {
        href: "/agent",
        label: "Home",
        icon: HomeLogo,
      },
    ],
    profileItem: [
      {
        href: "/agent/profile",
        label: "Profile",
        icon: Profile,
      },
    ],
    logoutItem: [
      {
        href: "/agent/login",
        label: "Logout",
        icon: LogoutIcon,
      },
    ],
  };

  if (LoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <MainLayout
        isHeaderFull={isHeaderFull}
        breadcrumbs={breadcrumbs}
        MenuList={MenuList}
        OthersMenu={OthersMenu}
        portalName={portalName}
        subSideBar={<AgentSubSidebarMenu />}
      >
        {children}
      </MainLayout>
    </>
  );
};

export default CusAgentLayout;
