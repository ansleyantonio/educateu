/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from "react";
import CommonAppBarMenu, {
  ExtendedFinalMenuItem,
} from "../common/Menu/CommonMenu";
import { FinalMenuItem } from "../common/Menu/utils/AppMenuBarList";
import MainContentWithHeader from "./MainContentWithHeader";

interface CommonLayoutProps {
  children: React.ReactNode;
  isHeaderFull?: boolean;
  breadcrumbs: any;
  MenuList: FinalMenuItem[];
  OthersMenu: {
    homeMenu: ExtendedFinalMenuItem[];
    profileItem: ExtendedFinalMenuItem[];
    logoutItem: ExtendedFinalMenuItem[];
  };
  portalName: string;
  subSideBar?: ReactNode;
}

const MainLayout = ({
  children,
  isHeaderFull,
  breadcrumbs,
  MenuList,
  OthersMenu,
  portalName,
  subSideBar,
}: CommonLayoutProps) => {
  return (
    <>
      <div className="flex overflow-hidden h-screen">
        {/* Sidebar */}
        <aside className="hidden justify-between items-center h-screen md:flex max-w-[260px]">
          <CommonAppBarMenu
            homeItem={OthersMenu.homeMenu}
            logoutItem={OthersMenu.logoutItem}
            profileItem={OthersMenu.profileItem}
            MenuList={MenuList}
            portalName={portalName}
          />
        </aside>

        {/*  content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-w-0`}
        >
          <div className="flex min-w-0">
            {isHeaderFull && (
              // Sub Sidebar
              <div className="w-fit xl:min-w-64">
                {/* dynamic sub side bar component */}
                {subSideBar}
                {/* <AdminSubSidebarMenu /> */}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <MainContentWithHeader
                breadcrumbs={breadcrumbs}
                MenuList={MenuList}
                OthersMenu={OthersMenu}
                portalName={portalName}
              >
                {children}
              </MainContentWithHeader>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
