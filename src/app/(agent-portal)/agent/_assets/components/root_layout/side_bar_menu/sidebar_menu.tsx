"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import apk_home from "/public/assets/logo/agent/admin/logo.svg";
import application from "/public/assets/logo/agent/agent_applications.svg";
import home from "/public/assets/logo/agent/home.svg";
// import sent from "/public/assets/icons/sent.svg";
import IconShow from "@/app/admin/_assets/components/root_layout/side_bar_menu/iconShow";
import { LogOutAlertModal } from "@/components/common/logOutModal/logOutAlertModal";
import { useAuths } from "@/hooks/userContext";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import user from "/public/assets/logo/agent/user-circle.svg";
import userGroup from "/public/assets/logo/agent/user-group.svg";
import Navigation from "/public/assets/logo/navigation.svg";

interface Item {
  href: string;
  icon: string;
  label: string;
}

// Define types for the permissions array
interface Permission {
  moduleId: string;
  moduleName: string;
  source: string;
  modulePermission: string[];
  permissionType: string;
  permissionStartDate: null | string;
  permissionEndDate: null | string;
}
const createFilteredArray = (
  items: Item[],
  permissions: Permission[],
): Item[] => {
  return items?.filter((item) => {
    // Find the corresponding permission for the current item
    const permission = permissions?.find(
      (perm) => perm?.moduleName === item.label, // Extract module name from href
    );

    // Include the item if the permission exists and modulePermission is not empty
    return permission && permission.modulePermission.length > 0;
  });
};

// Menu items.
const items = [
  {
    href: "/agent/application-management",
    icon: application,
    label: "application-management",
  },
  {
    href: "/agent/sub-agent-management",
    icon: userGroup,
    label: "sub-agent-management",
  },
];

export function AgentSidebarMenu() {
  //localhost:3000/management
  const [navigation, setNavigation] = useState(true);

  const pathName = usePathname();

  const auth = useAuths();

  const moduleList = auth?.permission?.modules;
  const filteredItems = createFilteredArray(items, moduleList);

  return (
    <div
      className={`ml-3 ${
        navigation ? "w-[250px]" : "!min-w-[45px] xl:!min-w-[55px]"
      }  flex-col items-center justify-center my-auto h-[calc(100vh-24px)]  rounded-lg shadow-lg  bg-[#011C28]`}
    >
      <section className="flex flex-col justify-between items-baseline w-full h-full">
        {/* Menu */}
        <div className="relative mx-auto mt-1">
          <div
            className={`flex items-center justify-center gap-2 xl:gap-3 p-2 xl:p-3  rounded-md ${
              pathName == "/" ? "bg-[#002F45] text-[#272E35]" : ""
            } transition-all hover:bg-[#002F45]`}
          >
            <Link href={"/"}>
              <div className="relative z-auto xl:w-6 xl:h-6 w-[18px] h-[18px]">
                <Image
                  src={apk_home}
                  alt="dashboard"
                  className="object-fill absolute w-full h-full text-white"
                  fill
                />
              </div>
            </Link>

            {navigation && (
              <div className="flex gap-2 justify-between items-center w-full">
                <Link href={"/"} className="flex-1 mt-1 text-white text-[12px]">
                  Education Learning Platform
                </Link>
                <Image
                  className="cursor-pointer"
                  onClick={() => setNavigation(!navigation)}
                  src={Navigation}
                  alt="navigation"
                  width={20}
                  height={13}
                />
              </div>
            )}
          </div>
          {!navigation && (
            <div
              onClick={() => setNavigation(!navigation)}
              className="flex absolute top-1 -right-6 z-50 justify-center items-center m-auto w-8 h-8 rounded-full bg-[#013E5B]"
            >
              <ChevronRight className="text-white" />
            </div>
          )}
        </div>
        {/* scroll are */}
        <div className="flex flex-col justify-between px-2 w-full h-[calc(100vh-84px)]">
          <ScrollArea className="h-[calc(100vh-124px)]">
            <div className="flex flex-col gap-y-1 items-center pt-1">
              <Link
                href={"/agent"}
                className={`flex items-center justify-start w-full gap-2 xl:gap-3 p-2 xl:p-3  rounded-md ${
                  pathName == "/agent" ? "bg-[#002F45] text-[#272E35]" : ""
                } transition-all hover:bg-[#002F45]`}
              >
                <IconShow
                  navigation={navigation}
                  path={home}
                  alt="dashboard"
                  name={"Home"}
                />
              </Link>

              {filteredItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex  gap-2 xl:gap-3 w-full items-center justify-start p-2 xl:p-3 rounded-md ${
                    pathName.includes(item.href)
                      ? "bg-[#002F45] text-[#272E35]"
                      : ""
                  } transition-all hover:bg-[#002F45]`}
                >
                  <IconShow
                    navigation={navigation}
                    path={item.icon}
                    alt={item.label}
                    name={item.label}
                  />
                </Link>
              ))}
            </div>
          </ScrollArea>

          {/* Profile */}
          <div className="flex flex-col justify-start items-baseline pb-2 mt-7 space-y-1 w-full min-h-[120px]">
            <Link
              href={"/agent/profile"}
              className={`flex items-center justify-start gap-2 xl:gap-3 p-2 xl:p-3 w-full  rounded-md ${
                pathName == "/agent/profile"
                  ? "bg-[#002F45] text-[#272E35]"
                  : ""
              } transition-all hover:bg-[#002F45]`}
            >
              <IconShow
                navigation={navigation}
                path={user}
                alt={"profile"}
                name={"Profile"}
              />
            </Link>
            <LogOutAlertModal
              navigation={navigation}
              logoutPath="/agent/login"
            />
          </div>
        </div>
      </section>
    </div>
    // <section className="flex flex-col justify-between items-center w-full h-full rounded-lg shadow-lg min-w-[64px] bg-[#011C28]">
    //   {/* Menu */}
    //   <div className="flex flex-col gap-y-1 pt-1">
    //     <Link
    //       href={"/"}
    //       className={`flex items-center justify-center p-3 rounded-md ${
    //         pathName == "/" ? "bg-[#002F45] text-[#272E35]" : ""
    //       } transition-all hover:bg-[#002F45]`}
    //     >
    //       <Image src={apk_home} alt="dashboard" width={24} height={24} />
    //     </Link>
    //     <Link
    //       href={"/agent"}
    //       className={`flex items-center justify-center p-3 rounded-md ${
    //         pathName == "/agent" ? "bg-[#002F45] text-[#272E35]" : ""
    //       } transition-all hover:bg-[#002F45]`}
    //     >
    //       <Image src={home} alt="dashboard" width={24} height={24} />
    //     </Link>
    //     {filteredItems.map((item, index) => (
    //       <Link
    //         key={index}
    //         href={item.href}
    //         className={`flex items-center justify-center p-3 rounded-md ${
    //           pathName == item.href ? "bg-[#002F45] text-[#272E35]" : ""
    //         } transition-all hover:bg-[#002F45]`}
    //       >
    //         {/* <div className="relative w-7 h-7"> */}
    //         <Image src={item.icon} alt="dashboard" width={24} height={24} />
    //         {/* </div> */}
    //       </Link>
    //     ))}

    //     <Link
    //       href={"/agent/profile"}
    //       className={`flex items-center justify-center p-3 rounded-md ${
    //         pathName == "/" ? "bg-[#002F45] text-[#272E35]" : ""
    //       } transition-all hover:bg-[#002F45]`}
    //     >
    //       <Image src={user} alt="dashboard" width={24} height={24} />
    //     </Link>
    //   </div>

    //   {/* Profile */}
    //   <div className="flex flex-col gap-3 justify-center items-end p-4">
    //     <Link
    //       href="/agent/password"
    //       className={`flex items-center justify-center p-3 rounded-md ${
    //         pathName == "/password" ? "bg-[#002F45] text-[#272E35]" : ""
    //       } transition-all hover:bg-[#002F45]`}
    //     >
    //       <Image src={security} alt="dashboard" width={28} height={29} />
    //     </Link>

    //     {/* <Link
    //       href="/agent"
    //       className={`flex items-center justify-center p-3 rounded-md ${
    //         pathName == "/password" ? "bg-[#002F45] text-[#272E35]" : ""
    //       } transition-all hover:bg-[#002F45]`}
    //     > */}
    //     {/* <div className="relative w-7 h-7"> */}
    //     <LogOutAlertModal navigation={false} logoutPath="/agents/login" />

    //     {/* </div> */}
    //     {/* </Link> */}
    //   </div>
    // </section>
  );
}
