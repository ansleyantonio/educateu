"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import group_user from "/public/assets/icons/user_group.svg";
import profile from "/public/assets/icons/profile.svg";
import document_validation from "/public/assets/icons/document_validation.svg";
import mailbox from "/public/assets/icons/mailbox.svg";
import notes from "/public/assets/icons/note.svg";
import communication from "/public/assets/icons/smart_phone.svg";
import invitations from "/public/assets/icons/invitations.svg";
import assignment from "/public/assets/icons/assignments.svg";
import credibility from "/public/assets/icons/credibility.svg";
import bookmark_check from "/public/assets/icons/bookmark_check.svg";
import appointment from "/public/assets/icons/appointment.svg";
import folder_check from "/public/assets/icons/folder_check.svg";
import pre_screen from "/public/assets/icons/pre_screen.svg";
import interview from "/public/assets/icons/interview.svg";
import calendar from "/public/assets/icons/calendar.svg";

import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";

// Menu items
const items = [
  {
    title: "Profile",
    href: "/admission/applicants/[userId]/profile",
    icon: profile,
  },
  {
    title: "Document",
    href: "/admission/applicants/[userId]/document",
    icon: document_validation,
  },
  {
    title: "Letters",
    href: "/admission/applicants/[userId]/letters",
    icon: mailbox,
  },
  {
    title: "Notes",
    href: "/admission/applicants/[userId]/notes",
    icon: notes,
  },
  {
    title: "Communication",
    href: "/admission/applicants/[userId]/communication",
    icon: communication,
  },
  {
    title: "Invitations",
    href: "/admission/applicants/[userId]/invitations",
    icon: invitations,
  },
  {
    title: "Assigns",
    href: "/admission/applicants/[userId]/assigns",
    icon: assignment,
  },
  {
    title: "Credibility",
    href: "/admission/applicants/[userId]/credibility",
    icon: credibility,
  },
  {
    title: "Checks",
    href: "/admission/applicants/[userId]/checks",
    icon: bookmark_check,
  },
  {
    title: "Bookings",
    href: "/admission/applicants/[userId]/bookings",
    icon: appointment,
  },
  {
    title: "Submissions",
    href: "/admission/applicants/[userId]/submissions",
    icon: folder_check,
  },
  {
    title: "Pre-Screening",
    href: "/admission/applicants/[userId]/pre_screening",
    icon: pre_screen,
  },
  {
    title: "Interviews",
    href: "/admission/applicants/[userId]/interviews",
    icon: interview,
  },
  {
    title: "Calendar",
    href: "/admission/applicants/[userId]/calendar",
    icon: calendar,
  },
];

export function AdmissionToggleMenuBar({ slug }: { slug: string }) {
  const pathName = usePathname();

  return (
    <section className="w-full h-screen border-r">
      {/* logo */}
      <div className="p-4">
        <div className="flex gap-3 items-center mb-4">
          <Link className="h-[24px] w-[24px]" href="/">
            <Image src={group_user} alt="dashboard" width={100} height={100} />
          </Link>
          <p>Applicants</p>
        </div>
        <hr />
      </div>
      {/* menu and search box */}
      <div className="p-4">
        {/* Menu */}
        <ScrollArea className="w-full h-[calc(100vh-20px)]">
          {/* overflow-y-auto */}
          <div className="flex flex-col gap-y-1 pb-5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href.replace("[userId]", slug)} // Replace [userId] with the actual slug
                className={`rounded-lg flex gap-x-3  px-4 py-2 ${
                  pathName === item.href.replace("[userId]", slug)
                    ? "bg-[#F0F9FF] text-[#002742]"
                    : "text-[#272E35]"
                } transition-all hover:bg-[#dbdddf]`}
              >
                <Image src={item.icon} alt="dashboard" width={20} height={20} />
                <span
                  className={`capitalize text-sm  leading-5 ${
                    pathName === item.href.replace("[userId]", slug)
                      ? "text-[#002742] font-semibold"
                      : "text-[#272E35] font-normal"
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
