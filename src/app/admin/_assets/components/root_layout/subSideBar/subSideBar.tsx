"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { Skeleton } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import AdminSubMenuItems from "../../../utils/sub_sidebar_data";
import applicants from "/public/assets/logo/dashboard_management/applicants.svg";

export function AdminSubSidebarMenu() {
  const pathName = usePathname();
  const { slug } = useParams();

  //TODO:------start
  const exitingPath =
    pathName.includes("additional-file-check") ||
    pathName.includes("admission");
  const number = exitingPath ? 3 : 2;
  const moduleName = pathName.split("/")[number];

  const items = AdminSubMenuItems[moduleName];
  // console.log("items", items);
  // console.log("moduleName", moduleName);
  // console.log("pathName", pathName);

  const { data, isLoading } = useFetchData({
    queryKey: "fetch-applicant-stage",
    path: `admission/profile/application/${slug}/stage`,
  });

  const applicantStatus = ["ASSIGN", "CHECK", "SUBMIT", "OUTCOME"].includes(
    data?.data?.stage ?? "",
  );

  return (
    <section className="px-2 w-full">
      <div className="flex gap-x-1 justify-start items-center py-4 px-2">
        <div className="relative w-5 h-5">
          <Image
            src={applicants}
            alt="done"
            fill
            className="object-fill absolute"
          />
        </div>
        {moduleName == "user-management" && <h2> User Management</h2>}
        {moduleName == "course-management" && <h2>course management </h2>}
        {moduleName == "business-development-management" && (
          <h2>Business Development</h2>
        )}
        {moduleName == "admission" && <h2>Applicants</h2>}

        {moduleName == "additional-file-check" && (
          <h2>Additional File Check</h2>
        )}

        {moduleName == "interview" && <h2>Interview</h2>}
      </div>
      <hr />
      {/* menu and search box */}
      <ScrollArea className="mt-6 w-full h-full">
        <div className="">
          {/* Menu */}
          <div className="flex overflow-hidden flex-col pb-5 space-y-1">
            {items?.map((item) => {
              const href =
                moduleName === "admission" ||
                moduleName === "additional-file-check"
                  ? item.href.replace("[userId]", slug as string)
                  : item.href;

              const isActive =
                moduleName == "admission" || moduleName == "course-management"
                  ? pathName.includes(href)
                  : pathName === href;

              const restrictedTitles = [
                "Letters",
                "Notes",
                "Invitations",
                "Credibility",
                "Checks",
                "Bookings",
                "Submissions",
              ].includes(item.title);

              const isAssigned = applicantStatus ? false : restrictedTitles;

              return isLoading ? (
                // Skeleton Loader
                <div
                  key={item.title}
                  className="flex gap-4 items-center py-2 px-4 w-full"
                >
                  {/* Icon Skeleton */}
                  <Skeleton.Avatar
                    active
                    shape="circle"
                    size={28}
                    className="shrink-0"
                  />

                  {/* Title Skeleton */}
                  <div className="flex-1">
                    <Skeleton
                      active
                      title={false}
                      paragraph={{ rows: 1, width: "80%" }}
                    />
                  </div>
                </div>
              ) : (
                <Link
                  href={href}
                  key={item.title}
                  className={`rounded-md ${
                    isActive ? "bg-[#F0F9FF] text-[#002742]" : ""
                  } flex justify-between items-center px-4 py-2 transition-all hover:bg-[#d5dee4] cursor-pointer ${
                    moduleName === "admission" && isAssigned
                      ? "text-black opacity-50 cursor-not-allowed pointer-events-none"
                      : " "
                  }`}
                >
                  <div className="flex gap-x-3">
                    <Image src={item.icon} alt="icon" width={20} height={20} />
                    <span className="text-sm leading-5 capitalize">
                      {item.title}
                    </span>
                  </div>
                  {/* Conditional rendering for step status */}
                  {/* TOTO */}
                  {/* {item.title === "Agent Requests" && (
                    <div className="flex-col justify-center items-center p-1 rounded-full bg-[#F5F8FF]">
                      <div className="w-5 h-5 text-center rounded-full text-[#2759CD]">
                        {10}
                      </div>
                    </div>
                  )} */}
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}
