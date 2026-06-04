"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import document_validation from "/public/assets/icons/document_validation.svg";
import notes from "/public/assets/icons/note.svg";
import profile from "/public/assets/icons/profile.svg";
import mailbox from "/public/assets/logo/agent/admin/mailbox.svg";
// import communication from "/public/assets/icons/smart_phone.svg";
import appointment from "/public/assets/icons/appointment.svg";
import assignment from "/public/assets/icons/assignments.svg";
import bookmark_check from "/public/assets/icons/bookmark_check.svg";
import credibility from "/public/assets/icons/credibility.svg";
import folder_check from "/public/assets/icons/folder_check.svg";
import invitations from "/public/assets/icons/invitations.svg";
import LicenseDraft from "/public/assets/icons/license-draft.svg";
// import interview from "/public/assets/icons/interview.svg";
// import calendar from "/public/assets/icons/calendar.svg";

interface SubMenuItems {
  [key: string]: {
    title: string;
    href: string;
    icon: any;
  }[];
}

const AdminSubMenuItems: SubMenuItems = {
  admission: [
    {
      title: "Profile",
      href: "/admin/admissions/[userId]/profile",
      icon: profile,
    },
    {
      title: "Document",
      href: "/admin/admissions/[userId]/document",
      icon: document_validation,
    },
    {
      title: "Assigns",
      href: "/admin/admissions/[userId]/assigns",
      icon: assignment,
    },
    {
      title: "Letters",
      href: "/admin/admissions/[userId]/letters",
      icon: mailbox,
    },
    {
      title: "Notes",
      href: "/admin/admissions/[userId]/notes",
      icon: notes,
    },
    {
      title: "Invitations",
      href: "/admin/admissions/[userId]/invitations",
      icon: invitations,
    },
    {
      title: "Credibility",
      href: "/admin/admissions/[userId]/credibility",
      icon: credibility,
    },
    {
      title: "Checks",
      href: "/admin/admissions/[userId]/checks",
      icon: bookmark_check,
    },
    {
      title: "Bookings",
      href: "/admin/admissions/[userId]/bookings",
      icon: appointment,
    },
    {
      title: "Submissions",
      href: "/admin/admissions/[userId]/submissions",
      icon: folder_check,
    },
    {
      title: "Application log",
      href: "/admin/admissions/[userId]/applicationLog",
      icon: LicenseDraft,
    },
  ],

  "additional-file-check": [
    {
      title: "Profile",
      href: "/admin/additional-file-check/[userId]/profile",
      icon: profile,
    },
    {
      title: "Document",
      href: "/admin/additional-file-check/[userId]/document",
      icon: document_validation,
    },
    {
      title: "Letters",
      href: "/admin/additional-file-check/[userId]/letters",
      icon: mailbox,
    },
    {
      title: "Notes",
      href: "/admin/additional-file-check/[userId]/notes",
      icon: notes,
    },
    {
      title: "Invitations",
      href: "/admin/additional-file-check/[userId]/invitations",
      icon: invitations,
    },
    {
      title: "Assigns",
      href: "/admin/additional-file-check/[userId]/assigns",
      icon: assignment,
    },
    {
      title: "Credibility",
      href: "/admin/additional-file-check/[userId]/credibility",
      icon: credibility,
    },
    {
      title: "Checks",
      href: "/admin/additional-file-check/[userId]/checks",
      icon: bookmark_check,
    },
    {
      title: "Bookings",
      href: "/admin/additional-file-check/[userId]/bookings",
      icon: appointment,
    },
  ],
};

export default AdminSubMenuItems;

export const SubSideBarMenuList = {
  admin: AdminSubMenuItems,
};
