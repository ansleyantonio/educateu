// import security from "/public/assets/logo/agent/security-password.svg";
import mailbox from "/public/assets/logo/agent/admin/mailbox.svg";
// import communication from "/public/assets/icons/smart_phone.svg";
import Assignments from "/public/assets/logo/agent/admin/assignments.svg";
import systemModule from "/public/assets/logo/agent/admin/document-validation.svg";
import Phone from "/public/assets/logo/agent/admin/smart-phone-01.svg";
import User from "/public/assets/logo/agent/admin/user_1.svg";
import Honor from "/public/assets/logo/honor.svg";
// import communication from "/public/assets/icons/smart_phone.svg";
import application_list from "/public/assets/icons/document_validation.svg";
type SubMenuItem = {
  title: string;
  href: string;
  icon: string;
  order?: number;
};

type SubMenuItems = {
  [key: string]: SubMenuItem[];
};
const AdminSubMenuItems: SubMenuItems = {
  "business-development-management": [
    {
      title: "Agent",
      href: "/admin/business-development-management/agent",
      icon: User,
      order: 1,
    },
    {
      title: "Agent Requests",
      href: "/admin/business-development-management/agent-request",
      icon: systemModule,
      order: 2,
    },
    {
      title: "Agent Settings",
      href: "/admin/business-development-management/agent-setting",
      icon: mailbox,
      order: 3,
    },
    {
      title: "Awarding Body",
      href: "/admin/business-development-management/awarding-body",
      icon: Honor,
      order: 4,
    },
    {
      title: "Audit Log",
      href: "/admin/business-development-management/audit-log",
      icon: Phone,
      order: 5,
    },
  ],

  "user-management": [
    {
      title: "User List",
      href: "/admin/user-management",
      icon: User,
      order: 1,
    },
    // {
    //   title: "System Module & Permission",
    //   href: "/admin/user-management/system-module-permission",
    //   icon: systemModule,
    // },
    {
      title: "Role Management",
      href: "/admin/user-management/role-management",
      icon: mailbox,
      order: 3,
    },
    {
      title: "Temporary Access Management",
      href: "/admin/user-management/temporary-access-management",
      icon: Assignments,
      order: 4,
    },
    {
      title: "Audit and Logging",
      href: "/admin/user-management/audit-logging",
      icon: Phone,
      order: 5,
    },
  ],
  "enrollment-management": [
    {
      title: "Diploma Enrollment List",
      href: "/admin/enrollment-management/diploma-enrollment-list",
      icon: User,
      order: 1,
    },

    {
      title: "Degree Enrollment list",
      href: "/admin/enrollment-management/degree-enrollment-list",
      icon: mailbox,
      order: 2,
    },
    {
      title: "Notification Settings",
      href: "/admin/enrollment-management/notification-settings",
      icon: Assignments,
      order: 3,
    },
  ],
  lessons: [
    {
      title: "lessons",
      href: "/admin/course-management/lessons",
      icon: Phone,
      order: 1,
    },
  ],
  module: [
    // {
    //   title: "Advance Modules",
    //   href: "/admin/course-management/module/advance-modules",
    //   icon: systemModule,
    //   order: 1,
    // },
    {
      title: "Degree Modules",
      href: "/admin/course-management/module/degree-modules",
      icon: systemModule,
      order: 2,
    },
    {
      title: "Diploma Modules",
      href: "/admin/course-management/module/diploma-modules",
      icon: systemModule,
      order: 3,
    },
    {
      title: "Professional Certificate module",
      href: "/admin/course-management/module/professional-certificate-modules",
      icon: mailbox,
      order: 4,
    },
    {
      title: "CPD Modules",
      href: "/admin/course-management/module/cpd-modules",
      icon: Assignments,
      order: 5,
    },
  ],

  session: [
    {
      title: "Course Session",
      href: "/admin/course-management/session/course-session",
      icon: User,
      order: 1,
    },
  ],

  courses: [
    // {
    //   title: "Advance Course",
    //   href: "/admin/course-management/course/advance-course",
    //   icon: systemModule,
    //   order: 1,
    // },
    {
      title: "degree Course",
      href: "/admin/course-management/courses/degree-course",
      icon: systemModule,
      order: 2,
    },
    {
      title: "diploma Course",
      href: "/admin/course-management/courses/diploma-course",
      icon: systemModule,
      order: 3,
    },
    {
      title: "Professional Certificate Course",
      href: "/admin/course-management/courses/professional-certificate-course",
      icon: mailbox,
      order: 4,
    },
    {
      title: "CPD Course",
      href: "/admin/course-management/courses/cpd-course",
      icon: Assignments,
      order: 5,
    },
    // {
    //   title: "Course List",
    //   href: "/admin/course-management/course/course-list",
    //   icon: Phone,
    // },
  ],

  assessments: [
    {
      title: "Assessment",
      href: "/admin/course-management/assessments/assessment",
      icon: Phone,
      order: 1,
    },
    {
      title: "Rubrics",
      href: "/admin/course-management/assessments/rubrics",
      icon: Phone,
      order: 2,
    },
  ],

  interview: [
    {
      title: "Calendar",
      href: "/admin/admissions/interview/calendar",
      icon: Phone,
      order: 1,
    },
    {
      title: "Application List",
      href: "/admin/admissions/interview/application-list",
      icon: application_list,
      order: 2,
    },
  ],
  // "external-portal-users": [
  //   {
  //     title: "Faculty Management sd",
  //     href: "/admin/external-portal-users/faculty-management",
  //     icon: Phone,
  //     order: 1,
  //   },
  //   // {
  //   //   title: "Finance Management",
  //   //   href: "/admin/external-portal-users/all-faculty",
  //   //   icon: Phone,
  //   //   order: 2,
  //   // },
  // ],
  "advanced-course-fee": [
    {
      title: "Degree Course Fee",
      href: "/admin/finance/advanced-course-fee/degree",
      icon: Phone,
      order: 1,
    },
    {
      title: "Diploma Course Fee",
      href: "/admin/finance/advanced-course-fee/diploma",
      icon: application_list,
      order: 2,
    },
  ],

  "certificate-course-fee": [
    {
      title: "CPD Course Fee",
      href: "/admin/finance/certificate-course-fee/cpd",
      icon: Phone,
      order: 1,
    },
    {
      title: "Professional Certificate Course Fee",
      href: "/admin/finance/certificate-course-fee/professional",
      icon: application_list,
      order: 2,
    },
  ],
};

const FacultySubMenuItems: SubMenuItems = {};
const AgentSubMenuItems: SubMenuItems = {};

export const AppBarSubNestedMenu = {
  admin: AdminSubMenuItems,
  agent: AgentSubMenuItems,
  faculty: FacultySubMenuItems,
};
