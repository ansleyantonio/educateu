/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import Image from "next/image";
import advice from "/public/assets/logo/dashboard_management/advice.svg";
import analytics from "/public/assets/logo/dashboard_management/analytics.svg";
import application from "/public/assets/logo/dashboard_management/application.svg";
import calender from "/public/assets/logo/dashboard_management/calender.svg";
import communication from "/public/assets/logo/dashboard_management/communication.svg";
import document from "/public/assets/logo/dashboard_management/document.svg";
import done from "/public/assets/logo/dashboard_management/done.svg";
import home from "/public/assets/logo/dashboard_management/home.png";
import pending from "/public/assets/logo/dashboard_management/pending.svg";
import project from "/public/assets/logo/dashboard_management/project.svg";
// Menu items.
const items = [
  {
    title: "Course Selection",
    // href: "/management/application",
    icon: application,
  },
  {
    title: "Personal Information",
    // href: "/management",
    icon: home,
  },
  {
    title: "Academic Background",
    // href: "/management/project",
    icon: project,
  },
  {
    title: "Personal Statement",
    // href: "/management/application",
    icon: application,
  },
  {
    title: "Disabilities and Accessibilities",
    // href: "/management/calender",
    icon: calender,
  },
  {
    title: "Next of Kin",
    // href: "/management/documents",
    icon: document,
  },
  {
    title: "Funds",
    // href: "/management/analytics",
    icon: analytics,
  },
  {
    title: "References",
    // href: "/management/communication",
    icon: communication,
  },
  {
    title: "Criminal Background",
    // href: "/management/advice",
    icon: advice,
  },
  {
    title: "Supporting Documents",
    // href: "/management/advice",
    icon: advice,
  },
];

export function SubSidebarMenu({
  completeStepList,
  step,
  handelNextSubSideMenu,
}: // completedStep,
// handelNextSubSideMenu,
{
  completeStepList: any;
  step: number;
  handelNextSubSideMenu: any;
  // handelNextSubSideMenu: any;
}) {
  //localhost:3000/management
  // const pathName = usePathname();

  // console.log("completeStepList sidebar", completeStepList);
  return (
    <section className="w-full">
      {/* <div className="flex gap-x-1 justify-start items-center py-4 px-2 mt-3">
        <div className="relative w-5 h-5">
          <Image
            src={applicants}
            alt="done"
            fill
            className="object-fill absolute"
          />
        </div>
        <h2>Applicants</h2>
      </div> */}
      <hr />
      {/* menu and search box */}
      <ScrollArea className=" w-full h-[calc(100vh-120px)] 2xl:h-full">
        <div className="">
          {/* Menu */}
          <div className="flex overflow-hidden flex-col pb-5 space-y-1">
            {items.map((item, index: number) => (
              <div
                key={item.title}
                onClick={() => {
                  // if (completedStep > index) {
                  handelNextSubSideMenu(index);
                  // }
                }}
                //   href={item.href}
                className={`rounded-none flex justify-between items-center px-4 py-2  transition-all hover:bg-[#dbdddf] cursor-pointer ${
                  step === index + 1 ? "bg-[#EDEFF0]" : "cursor-pointer"
                } `}
              >
                {/* <item?.icon className="w-6 h-6 text-red-800" /> */}
                <div className="flex gap-x-3">
                  <Image
                    src={item.icon}
                    alt="dashboard"
                    // className="text-red-800"
                    width={20}
                    height={20}
                  />
                  <span className={`capitalize text-sm  leading-5 `}>
                    {item.title}
                  </span>
                </div>

                {completeStepList.includes((index + 1).toString()) ? (
                  <div className="relative w-5 h-5">
                    <Image
                      src={done}
                      alt="done"
                      fill
                      className="object-fill absolute"
                    />
                  </div>
                ) : (
                  <div className="relative w-5 h-5">
                    <Image
                      src={pending}
                      alt="done"
                      fill
                      className="object-fill absolute"
                    />
                  </div>
                )}

                {/* {step > index + 1 ? (
                  <div className="relative w-5 h-5">
                    <Image
                      src={done}
                      alt="done"
                      fill
                      className="object-fill absolute"
                    />
                  </div>
                ) : step === index + 1 ? null : (
                  <div className="relative w-5 h-5">
                    <Image
                      src={pending}
                      alt="done"
                      fill
                      className="object-fill absolute"
                    />
                  </div>

                  // <Image src={pending} alt="pending" width={20} height={20} />
                )} */}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}
