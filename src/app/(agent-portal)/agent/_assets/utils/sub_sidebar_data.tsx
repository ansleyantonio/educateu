"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import document_validation from "/public/assets/icons/document_validation.svg";
import notes from "/public/assets/icons/note.svg";
import profile from "/public/assets/icons/profile.svg";
import mailbox from "/public/assets/logo/agent/admin/mailbox.svg";
// import communication from "/public/assets/icons/smart_phone.svg";
import appointment from "/public/assets/icons/appointment.svg";
import folder_check from "/public/assets/icons/folder_check.svg";

interface SubMenuItems {
  [key: string]: {
    title: string;
    href: string;
    icon: any;
  }[];
}
const AgentSubMenuItems: SubMenuItems = {
  "application-management": [
    {
      title: "Profile",
      href: "/agent/application-management/[userId]/profile",
      icon: profile,
    },
    {
      title: "Document",
      href: "/agent/application-management/[userId]/document",
      icon: document_validation,
    },
    {
      title: "Progress",
      href: "/agent/application-management/[userId]/progress",
      icon: mailbox,
    },
    {
      title: "Notes",
      href: "/agent/application-management/[userId]/notes",
      icon: notes,
    },

    {
      title: "Bookings",
      href: "/agent/application-management/[userId]/bookings",
      icon: appointment,
    },
    {
      title: "Info Required",
      href: "/agent/application-management/[userId]/info-required",
      icon: folder_check,
    },
    {
      title: "Audit Log",
      href: "/agent/application-management/[userId]/audit-log",
      icon: folder_check,
    },
  ],
};

export default AgentSubMenuItems;
