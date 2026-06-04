import CommonAppBarMenu, {
  ExtendedFinalMenuItem,
} from "@/components/common/Menu/CommonMenu";
import { FinalMenuItem } from "@/components/common/Menu/utils/AppMenuBarList";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/custom_ui/drawer";
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import Image from "next/image";
import help from "/public/assets/logo/dashboard_management/help.svg";
import notification from "/public/assets/logo/dashboard_management/notification.svg";
interface MainTopHeaderProps {
  MenuList: FinalMenuItem[];
  OthersMenu: {
    homeMenu: ExtendedFinalMenuItem[];
    profileItem: ExtendedFinalMenuItem[];
    logoutItem: ExtendedFinalMenuItem[];
  };
  portalName: string;
}

const MainTopHeader = ({
  MenuList,
  OthersMenu,
  portalName,
}: MainTopHeaderProps) => {
  return (
    // <BreadcrumbProvider>
    <>
      <div className="bg-[#D4D9DF] max-h-[81px] ">
        <div className="flex justify-between md:justify-end items-center px-8 py-2 bg-white ">
          <div className="md:hidden">
            <Drawer direction="left">
              <DrawerTrigger>
                <Menu />
              </DrawerTrigger>
              <DrawerContent className="w-[75%] sm:w-[50%] h-full bg-[#011C28]">
                <div>
                  <CommonAppBarMenu
                    MenuList={MenuList}
                    homeItem={OthersMenu.homeMenu}
                    logoutItem={OthersMenu.logoutItem}
                    profileItem={OthersMenu.profileItem}
                    portalName={portalName}
                  />
                </div>
                <DrawerHeader className="hidden">
                  <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>
                    This action cannot be undone.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="hidden"></DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
          {/* Search Input */}
          {/* <div className=" bg-[#FFFFFF] flex justify-start items-center gap-x-2 w-[100px] sm:w-[150px] md:w-[300px] px-4 py-2 border border-1 border-[#D4D9DF] rounded-md">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent flex-grow outline-none text-black placeholder:text-gray-500"
          />
        </div> */}

          {/* toDo py=3 */}

          <div className="flex gap-x-3 py-[10px]">
            {/* Help Icon */}
            <div className="cursor-pointer">
              <Image src={help} alt="message" width={20} height={20} />
            </div>

            {/* Notification Icon */}
            <div className=" cursor-pointer">
              <Image
                src={notification}
                alt="notification"
                width={20}
                height={20}
              />
            </div>
            <div>{/* <Profile /> */}</div>
          </div>
        </div>
      </div>
    </>
    // </BreadcrumbProvider>
  );
};

export default MainTopHeader;
