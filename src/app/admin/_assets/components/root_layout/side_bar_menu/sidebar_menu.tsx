"use client";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useAuths } from "@/hooks/userContext";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import IconShow from "./iconShow";
import checks from "/public/assets/icons/check_file.svg";
import interview from "/public/assets/icons/conversation.svg";
import wellbeing from "/public/assets/icons/healtcare.svg";
import application from "/public/assets/icons/notebook.svg";
import pre_screening from "/public/assets/icons/pre_screening.svg";
import courseManagement from "/public/assets/logo/agent/admin/course_management.svg";
import development from "/public/assets/logo/agent/admin/development.svg";
import apk_home from "/public/assets/logo/agent/admin/logo.svg";
import UserManagement from "/public/assets/logo/agent/admin/userManagement.svg";
import home from "/public/assets/logo/agent/home.svg";
// import security from "/public/assets/logo/agent/security-password.svg";
import { LogOutAlertModal } from "@/components/common/logOutModal/logOutAlertModal";
import user from "/public/assets/logo/agent/user-circle.svg";
import Navigation from "/public/assets/logo/navigation.svg";

// Define types for the items array
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
  { href: "/admin/admission", icon: application, label: "admission" },
  { href: "/admin/wellbeing", icon: wellbeing, label: "wellbeing" },
  {
    href: "/admin/additional-file-check",
    icon: checks,
    label: "additional-file-check",
  },
  {
    href: "/admin/pre-screening",
    icon: pre_screening,
    label: "pre-screening",
  },
  {
    href: "/admin/interview",
    icon: interview,
    label: "interview",
  },
  {
    href: "/admin/business-development-management",
    icon: development,
    label: "business-development-management",
  },
  {
    href: "/admin/course-management",
    icon: courseManagement,
    label: "course-management",
  },
  {
    href: "/admin/user-management",
    icon: UserManagement,
    label: "user-management",
  },
];

export function AdminSidebarMenu() {
  const [navigation, setNavigation] = useState(true);
  const pathName = usePathname();

  const auth = useAuths();

  const moduleList = auth?.permission.modules;
  const filteredItems = createFilteredArray(items, moduleList);

  // You can trigger a reload when the component mounts:
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasReloaded");

    if (filteredItems.length < 1 && !hasReloaded) {
      sessionStorage.setItem("hasReloaded", "true");
      window.location.reload();
    }
  }, [filteredItems]);

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
                href={"/admin"}
                className={`flex items-center justify-start w-full gap-2 xl:gap-3 p-2 xl:p-3  rounded-md ${
                  pathName == "/admin" ? "bg-[#002F45] text-[#272E35]" : ""
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
              href={"/admin/profile"}
              className={`flex items-center justify-start gap-2 xl:gap-3 p-2 xl:p-3 w-full  rounded-md ${
                pathName == "/admin/profile"
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
              logoutPath="/admin/login"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
