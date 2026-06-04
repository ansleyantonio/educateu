/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreadcrumbTopMenu } from "../Breadcrumb/BreadcrumbTopMenu";
import { ExtendedFinalMenuItem } from "../common/Menu/CommonMenu";
import { FinalMenuItem } from "../common/Menu/utils/AppMenuBarList";
import MainTopHeader from "../layout_components/home_page/header/header";

const MainContentWithHeader = ({
  children,
  breadcrumbs,
  MenuList,
  OthersMenu,
  portalName,
}: {
  children: React.ReactNode;
  breadcrumbs: any;
  MenuList: FinalMenuItem[];
  OthersMenu: {
    homeMenu: ExtendedFinalMenuItem[];
    profileItem: ExtendedFinalMenuItem[];
    logoutItem: ExtendedFinalMenuItem[];
  };
  portalName: string;
}) => {
  return (
    <>
      {/* Header */}
      <MainTopHeader
        portalName={portalName}
        MenuList={MenuList}
        OthersMenu={OthersMenu}
      />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <>
          <hr />
          <BreadcrumbTopMenu />
        </>
      )}
      {/* Scrollable main content */}
      <main
        className={`overflow-x-auto overflow-y-auto p-3 w-full bg-gray-50 ${
          breadcrumbs && breadcrumbs?.length > 0
            ? "h-[calc(100vh-7rem)]"
            : "h-[calc(100vh-4rem)]"
        } `}
      >
        {children}
      </main>
    </>
  );
};

export default MainContentWithHeader;
