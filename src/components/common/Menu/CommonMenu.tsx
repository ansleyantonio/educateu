// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { LogOutAlertModal } from "@/components/common/logOutModal/logOutAlertModal";
// import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
// import { ChevronsLeft, ChevronsRight } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { AppMenuItem } from "./components/MenuItem";
// import { FinalMenuItem } from "./utils/AppMenuBarList";
// import apk_home from "/public/assets/logo/agent/admin/logo.svg";

// export interface ExtendedFinalMenuItem extends Omit<FinalMenuItem, "icon"> {
//   icon?: { src: string | undefined };
// }

// const CommonAppBarMenu = ({
//   MenuList,
//   homeItem,
//   logoutItem,
//   profileItem,
//   portalName,
// }: {
//   MenuList: FinalMenuItem[];
//   logoutItem: ExtendedFinalMenuItem[];
//   profileItem: ExtendedFinalMenuItem[];
//   homeItem: ExtendedFinalMenuItem[];
//   portalName?: string;
// }) => {
//   const pathname = usePathname();
//   const [navigation, setNavigation] = useState(true);

//   // after logout redirect path
//   const redirectPath = logoutItem[0].href;

//   return (
//     <div className="relative">
//       <div
//         className={`ml-3 ${
//           navigation ? "w-[260px]" : "!min-w-[45px] xl:!min-w-[55px]"
//         }flex-col items-center justify-center my-auto h-[calc(100vh-24px)] rounded-lg shadow-lg bg-[#011C28]`}
//       >
//         <section className="flex flex-col justify-between items-baseline w-full h-full">
//           {/* Top header */}
//           <div className="relative mx-auto mt-1 w-full">
//             <div className="flex items-center justify-center gap-2 xl:gap-3 p-2 xl:p-3 rounded-md">
//               <div className="relative w-full flex items-center justify-between">
//                 {/* Logo and Text */}
//                 <div className="flex items-center gap-2 xl:gap-3 flex-1">
//                   <Link href={"/"}>
//                     <div className="relative z-auto xl:w-6 xl:h-6 w-[18px] h-[18px]">
//                       <Image
//                         src={apk_home}
//                         alt="dashboard"
//                         className="object-fill absolute w-full h-full text-white"
//                         fill
//                       />
//                     </div>
//                   </Link>

//                   {navigation && (
//                     <Link
//                       href={"/"}
//                       className="flex-1 mt-1 text-white text-[12px] line-clamp-1"
//                     >
//                       Education Learning Platform
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Menu and scroll area */}
//           <div className="flex flex-col justify-between px-2 w-full h-[calc(100vh-84px)]">
//             <ScrollArea className="h-[calc(100vh-124px)]">
//               <div className="flex flex-col gap-y-1 items-center pt-1">
//                 {/* Dashboard/Home */}
//                 <Link
//                   href={`${homeItem[0].href}`}
//                   className={`flex items-center justify-start w-full gap-2 xl:gap-3 p-2 xl:p-3 rounded-md ${
//                     pathname === `/${portalName}` ? "bg-[#002F45]" : ""
//                   } hover:bg-[#002F45] transition-all`}
//                 >
//                   <Image
//                     src={`${homeItem[0]?.icon?.src}`}
//                     alt="Home"
//                     width={24}
//                     height={24}
//                   />
//                   {navigation && (
//                     <span className="text-sm text-white">
//                       {homeItem[0].label}
//                     </span>
//                   )}
//                 </Link>

//                 {/* Dynamic Menus */}
//                 {MenuList.map((item: any) => (
//                   <div key={item.href || item.label} className="w-full">
//                     <AppMenuItem item={item} navigation={navigation} />
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>

//             {/* Profile and Logout */}
//             <div className="flex flex-col justify-start items-baseline pb-1 mt-7 space-y-1 w-full min-h-[120px]">
//               <Link
//                 href={`/${portalName}/profile`}
//                 className={`flex items-center justify-start gap-2 xl:gap-3 p-2 xl:p-3 w-full rounded-md ${
//                   pathname === `/${portalName}/profile` ? "bg-[#002F45]" : ""
//                 } hover:bg-[#002F45] transition-all`}
//               >
//                 <Image
//                   src={`${profileItem[0]?.icon?.src}`}
//                   alt="profile"
//                   width={24}
//                   height={24}
//                 />
//                 {navigation && (
//                   <span className="text-sm text-white">
//                     {profileItem[0].label}
//                   </span>
//                 )}
//               </Link>
//               <LogOutAlertModal
//                 navigation={navigation}
//                 logoutPath={`${logoutItem[0].href}`}
//               />
//             </div>
//           </div>
//         </section>
//       </div>

//       {/* External Toggle Button - Outside Sidebar */}
//       <button
//         onClick={() => setNavigation(!navigation)}
//         className={`absolute top-6 hidden -translate-y-1/2 ${
//           navigation ? "-right-6" : "-right-6"
//         } md:flex items-center justify-center w-6 h-12 rounded-r-lg bg-[#011C28] transition-all min-w-[30px] duration-300 ease-in-out shadow-lg z-50 group`}
//         aria-label={navigation ? "Collapse sidebar" : "Expand sidebar"}
//       >
//         {navigation ? (
//           <ChevronsLeft className="text-white w-5 h-5 transition-transform duration-700 group-hover:scale-110 animate-[bounce-left_5s_ease-in-out_infinite]" />
//         ) : (
//           <ChevronsRight className="text-white w-5 h-5 transition-transform duration-700 group-hover:scale-110 animate-[bounce-right_5s_ease-in-out_infinite]" />
//         )}
//       </button>

//       <style jsx>{`
//         @keyframes bounce-left {
//           0%, 100% {
//             transform: translateX(0);
//           }
//           50% {
//             transform: translateX(-4px);
//           }
//         }

//         @keyframes bounce-right {
//           0%, 100% {
//             transform: translateX(0);
//           }
//           50% {
//             transform: translateX(4px);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CommonAppBarMenu;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogOutAlertModal } from "@/components/common/logOutModal/logOutAlertModal";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppMenuItem } from "./components/MenuItem";
import { FinalMenuItem } from "./utils/AppMenuBarList";
import apk_home from "/public/assets/logo/agent/admin/logo.svg";
import EducateLogo from "/public/assets/logo/navigation.svg";
export interface ExtendedFinalMenuItem extends Omit<FinalMenuItem, "icon"> {
  icon?: { src: string | undefined };
  // src?: string;
}

const CommonAppBarMenu = ({
  MenuList,
  homeItem,
  logoutItem,
  profileItem,
  portalName,
}: {
  MenuList: FinalMenuItem[];
  logoutItem: ExtendedFinalMenuItem[];
  profileItem: ExtendedFinalMenuItem[];
  homeItem: ExtendedFinalMenuItem[];
  portalName?: string;
}) => {
  const pathname = usePathname();

  const [navigation, setNavigation] = useState(true);

  // after logout redirect path
  const redirectPath = logoutItem[0].href;
  return (
    <>
      <div
        className={`ml-3 ${
          navigation ? "w-[260px]" : "!min-w-[45px] xl:!min-w-[55px]"
        }flex-col items-center justify-center my-auto h-[calc(100vh-24px)] rounded-lg shadow-lg bg-[#011C28]`}
      >
        <section className="flex flex-col justify-between items-baseline w-full h-full">
          {/* Top header */}
          <div className="relative mx-auto mt-1 w-full">
            <div
              className={`flex items-center justify-center gap-2 xl:gap-3 p-2 xl:p-3 rounded-md ${
                pathname === "/" ? "bg-[#002F45]" : ""
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
                  <Link
                    href={"/"}
                    className="flex-1 mt-1 text-white text-[12px]"
                  >
                    Education Learning Platform
                  </Link>
                  <Image
                    className="hidden cursor-pointer md:block"
                    onClick={() => setNavigation(!navigation)}
                    src={EducateLogo}
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

          {/* Menu and scroll area */}
          <div className="flex flex-col justify-between px-2 w-full h-[calc(100vh-84px)]">
            <ScrollArea className="h-[calc(100vh-124px)]">
              <div className="flex flex-col gap-y-1 items-center pt-1">
                {/* Dashboard/Home */}
                <Link
                  href={`${homeItem[0].href}`}
                  className={`flex items-center justify-start w-full gap-2 xl:gap-3 p-2 xl:p-3 rounded-md ${
                    pathname === `/${portalName}` ? "bg-[#002F45]" : ""
                  } hover:bg-[#002F45] transition-all`}
                >
                  <Image
                    src={`${homeItem[0]?.icon?.src}`}
                    alt="Home"
                    width={24}
                    height={24}
                  />
                  {navigation && (
                    <span className="text-sm text-white">
                      {homeItem[0].label}
                    </span>
                  )}
                </Link>

                {/* Dynamic Menus */}
                {MenuList.map((item: any) => (
                  <div key={item.href || item.label} className="w-full">
                    <AppMenuItem item={item} navigation={navigation} />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Profile and Logout */}
            <div className="flex flex-col justify-start items-baseline pb-1 mt-7 space-y-1 w-full min-h-[120px]">
              <Link
                href={`/${portalName}/profile`}
                className={`flex items-center justify-start gap-2 xl:gap-3 p-2 xl:p-3 w-full rounded-md ${
                  pathname === `/${portalName}/profile` ? "bg-[#002F45]" : ""
                } hover:bg-[#002F45] transition-all`}
              >
                <Image
                  src={`${profileItem[0]?.icon?.src}`}
                  alt="profile"
                  width={24}
                  height={24}
                />
                {navigation && (
                  <span className="text-sm text-white">
                    {profileItem[0].label}
                  </span>
                )}
              </Link>
              <LogOutAlertModal
                navigation={navigation}
                logoutPath={`${logoutItem[0].href}`}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CommonAppBarMenu;
