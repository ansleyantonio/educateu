"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import document_validation from "/public/assets/icons/document_validation.svg";
import notes from "/public/assets/icons/note.svg";
import profile from "/public/assets/icons/profile.svg";
import mailbox from "/public/assets/logo/agent/admin/mailbox.svg";
import Phone from "/public/assets/logo/agent/admin/smart-phone-01.svg";
// import communication from "/public/assets/icons/smart_phone.svg";
import appointment from "/public/assets/icons/appointment.svg";
import assignment from "/public/assets/icons/assignments.svg";
import bookmark_check from "/public/assets/icons/bookmark_check.svg";
import credibility from "/public/assets/icons/credibility.svg";
import application_list from "/public/assets/icons/document_validation.svg";
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
  // "business-development-management": [
  //   {
  //     title: "Agent",
  //     href: "/admin/business-development-management",
  //     icon: User,
  //   },
  //   {
  //     title: "Agent Requests",
  //     href: "/admin/business-development-management/agent-request",
  //     icon: systemModule,
  //   },
  //   {
  //     title: "Agent Settings",
  //     href: "/admin/business-development-management/agent-setting",
  //     icon: mailbox,
  //   },
  // ],

  // "user-management": [
  //   {
  //     title: "User List",
  //     href: "/admin/user-management",
  //     icon: User,
  //   },
  //   // {
  //   //   title: "System Module & Permission",
  //   //   href: "/admin/user-management/system-module-permission",
  //   //   icon: systemModule,
  //   // },
  //   {
  //     title: "Role Management",
  //     href: "/admin/user-management/role-management",
  //     icon: mailbox,
  //   },
  //   {
  //     title: "Temporary Access Management",
  //     href: "/admin/user-management/temporary-access-management",
  //     icon: Assignments,
  //   },
  //   {
  //     title: "Audit and Logging",
  //     href: "/admin/user-management/audit-logging",
  //     icon: Phone,
  //   },
  // ],

  // "course-management": [
  //   {
  //     title: "Course Session",
  //     href: "/admin/course-management/course-session",
  //     icon: User,
  //   },
  //   {
  //     title: "Advance Course",
  //     href: "/admin/course-management/advance-course",
  //     icon: systemModule,
  //   },
  //   {
  //     title: "Professional Certificate Course",
  //     href: "/admin/course-management/professional-certificate-course",
  //     icon: mailbox,
  //   },
  //   {
  //     title: "Create CPD",
  //     href: "/admin/course-management/create-cpd",
  //     icon: Assignments,
  //   },
  //   {
  //     title: "Course List",
  //     href: "/admin/course-management/course-list",
  //     icon: Phone,
  //   },
  // ],

  admission: [
    {
      title: "Profile",
      href: "/admin/admissions/admission/[userId]/profile",
      icon: profile,
    },
    {
      title: "Document",
      href: "/admin/admissions/admission/[userId]/document",
      icon: document_validation,
    },
    {
      title: "Assigns",
      href: "/admin/admissions/admission/[userId]/assigns",
      icon: assignment,
    },
    {
      title: "Letters",
      href: "/admin/admissions/admission/[userId]/letters",
      icon: mailbox,
    },
    {
      title: "Notes",
      href: "/admin/admissions/admission/[userId]/notes",
      icon: notes,
    },
    {
      title: "Invitations",
      href: "/admin/admissions/admission/[userId]/invitations",
      icon: invitations,
    },
    {
      title: "Credibility",
      href: "/admin/admissions/admission/[userId]/credibility",
      icon: credibility,
    },
    {
      title: "Checks",
      href: "/admin/admissions/admission/[userId]/checks",
      icon: bookmark_check,
    },
    {
      title: "Bookings",
      href: "/admin/admissions/admission/[userId]/bookings",
      icon: appointment,
    },
    {
      title: "Submissions",
      href: "/admin/admissions/admission/[userId]/submissions",
      icon: folder_check,
    },
    {
      title: "Application log",
      href: "/admin/admissions/admission/[userId]/applicationLog",
      icon: LicenseDraft,
    },
  ],

  "additional-file-check": [
    {
      title: "Profile",
      href: "/admin/admissions/additional-file-check/[userId]/profile",
      icon: profile,
    },
    {
      title: "Document",
      href: "/admin/admissions/additional-file-check/[userId]/document",
      icon: document_validation,
    },
    {
      title: "Letters",
      href: "/admin/admissions/additional-file-check/[userId]/letters",
      icon: mailbox,
    },
    {
      title: "Notes",
      href: "/admin/admissions/additional-file-check/[userId]/notes",
      icon: notes,
    },
    {
      title: "Invitations",
      href: "/admin/admissions/additional-file-check/[userId]/invitations",
      icon: invitations,
    },
    {
      title: "Assigns",
      href: "/admin/admissions/additional-file-check/[userId]/assigns",
      icon: assignment,
    },
    {
      title: "Credibility",
      href: "/admin/admissions/additional-file-check/[userId]/credibility",
      icon: credibility,
    },
    {
      title: "Checks",
      href: "/admin/admissions/additional-file-check/[userId]/checks",
      icon: bookmark_check,
    },
    {
      title: "Bookings",
      href: "/admin/admissions/additional-file-check/[userId]/bookings",
      icon: appointment,
    },
    {
      title: "Audit Log",
      href: "/admin/admissions/additional-file-check/[userId]/audit-log",
      icon: appointment,
    },
  ],

  interview: [
    {
      title: "Calendar",
      href: "/admin/interview/calendar",
      icon: Phone,
    },
    {
      title: "Application List",
      href: "/admin/interview/application-list",
      icon: application_list,
    },
  ],
};

export default AdminSubMenuItems;
