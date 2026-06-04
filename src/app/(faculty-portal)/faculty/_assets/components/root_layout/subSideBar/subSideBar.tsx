// "use client";
// import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
// import Image from "next/image";
// import Link from "next/link";
// import { useParams, usePathname } from "next/navigation";
// import applicants from "/public/assets/logo/dashboard_management/applicants.svg";
// import { useEffect, useRef, useState } from "react";
// import { getApplicantStatusCookie } from "@/lib/applicanStageCookie";

// export function FacultySubSidebarMenu() {
//   const pathName = usePathname();
//   const { slug } = useParams();
//   const moduleName = pathName.split("/")[2];
//   const items = FacultySubMenuItems[moduleName];

//   const [applicantStatus, setApplicantStatus] = useState<boolean>(false);
//   const prevStatusRef = useRef<boolean>(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const currentStatus = getApplicantStatusCookie();

//       if (currentStatus !== prevStatusRef.current) {
//         prevStatusRef.current = currentStatus;
//         setApplicantStatus(currentStatus);
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="px-2 w-full">
//       <div className="flex gap-x-1 justify-start items-center py-4 px-2">
//         <div className="relative w-5 h-5">
//           <Image
//             src={applicants}
//             alt="done"
//             fill
//             className="object-fill absolute"
//           />
//         </div>
//         {moduleName == "user-management" && <h2> User Management</h2>}
//         {moduleName == "course-management" && <h2>course management </h2>}
//         {moduleName == "business-development-management" && (
//           <h2>Business Development</h2>
//         )}
//         {moduleName == "admission" && <h2>Applicants</h2>}

//         {moduleName == "additional-file-check" && (
//           <h2>Additional File Check</h2>
//         )}

//         {moduleName == "interview" && <h2>Interview</h2>}
//       </div>
//       <hr />
//       {/* menu and search box */}
//       <ScrollArea className="mt-6 w-full h-full">
//         <div className="">
//           {/* Menu */}
//           <div className="flex overflow-hidden flex-col pb-5 space-y-1">
//             {items?.map((item) => {
//               const href =
//                 moduleName === "admission" ||
//                 moduleName === "additional-file-check"
//                   ? item.href.replace("[userId]", slug as string)
//                   : item.href;

//               const isActive =
//                 moduleName == "admission" || moduleName == "course-management"
//                   ? pathName.includes(href)
//                   : pathName === href;

//               const restrictedTitles = [
//                 "Letters",
//                 "Notes",
//                 "Invitations",
//                 "Credibility",
//                 "Checks",
//                 "Bookings",
//                 "Submissions",
//               ].includes(item.title);

//               const isAssigned = applicantStatus ? false : restrictedTitles;

//               return (
//                 <Link
//                   href={href}
//                   key={item.title}
//                   className={`rounded-md ${
//                     isActive ? "bg-[#F0F9FF] text-[#002742]" : ""
//                   } flex justify-between items-center px-4 py-2 transition-all hover:bg-[#d5dee4] cursor-pointer ${
//                     moduleName === "admission" && isAssigned
//                       ? "text-black opacity-50 cursor-not-allowed pointer-events-none"
//                       : " "
//                   }`}
//                 >
//                   <div className="flex gap-x-3">
//                     <Image src={item.icon} alt="icon" width={20} height={20} />
//                     <span className="text-sm leading-5 capitalize">
//                       {item.title}
//                     </span>
//                   </div>
//                   {/* Conditional rendering for step status */}
//                   {/* TOTO */}
//                   {/* {item.title === "Agent Requests" && (
//                     <div className="flex-col justify-center items-center p-1 rounded-full bg-[#F5F8FF]">
//                       <div className="w-5 h-5 text-center rounded-full text-[#2759CD]">
//                         {10}
//                       </div>
//                     </div>
//                   )} */}
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       </ScrollArea>
//     </section>
//   );
// }
