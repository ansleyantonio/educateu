"use client";
import AgentSubMenuItems from "@/app/(agent-portal)/agent/_assets/utils/sub_sidebar_data";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import applicants from "/public/assets/logo/dashboard_management/applicants.svg";

export function AgentSubSidebarMenu() {
  const pathName = usePathname();
  const { id } = useParams();
  const moduleName = pathName.split("/")[2];

  const items = AgentSubMenuItems[moduleName];

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

        {moduleName == "application-management" && <h2>Applicants</h2>}
      </div>
      <hr />
      {/* menu and search box */}
      <ScrollArea className="mt-6 w-full h-full">
        <div className="">
          {/* Menu */}
          <div className="flex overflow-hidden flex-col pb-5 space-y-1">
            {items?.map((item) => {
              const href =
                moduleName === "application-management"
                  ? item.href.replace("[userId]", id as string)
                  : item.href;

              const isActive = pathName === href;

              return (
                <Link
                  href={href}
                  key={item.title}
                  className={`rounded-md ${
                    isActive ? "bg-[#F0F9FF] text-[#002742]" : ""
                  } flex justify-between items-center px-4 py-2 transition-all hover:bg-[#d5dee4] cursor-pointer`}
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
