"use client";
import checks from "/public/assets/icons/check_file.svg";
import interview from "/public/assets/icons/conversation.svg";
import wellbeing from "/public/assets/icons/healtcare.svg";
import application from "/public/assets/icons/notebook.svg";
import pre_screening from "/public/assets/icons/pre_screening.svg";
import Settings from "/public/assets/icons/settings.svg";
import courseManagement from "/public/assets/logo/agent/admin/course_management.svg";
import development from "/public/assets/logo/agent/admin/development.svg";
import UserManagement from "/public/assets/logo/agent/admin/userManagement.svg";
import honor from "/public/assets/logo/agent/honor.svg";
import userGroup from "/public/assets/logo/agent/user-group.svg";

// import security from "/public/assets/logo/agent/security-password.svg";

// N.B label name means menu name

const adminModuleItemsList = [
  // admission ----------------------------start -------------------
  {
    href: "/admin/admissions/admission",
    icon: application,
    label: "admission",
    customLabelName: "Applications",
    order: 1,
  },
  {
    href: "/admin/admissions/additional-file-check",
    icon: checks,
    label: "additional-file-check",
    customLabelName: "Additional File Check",
    order: 2,
  },
  {
    href: "/admin/admissions/wellbeing",
    icon: wellbeing,
    label: "wellbeing",
    customLabelName: "Wellbeing",
    order: 3,
  },

  {
    href: "/admin/admissions/pre-screening",
    icon: pre_screening,
    label: "pre-screening",
    customLabelName: "Pre screening",
    order: 4,
  },
  {
    href: "/admin/admissions/interview",
    icon: interview,
    label: "interview",
    customLabelName: "Interview",
    order: 5,
  },
  // admission ----------------------------End -------------------

  {
    href: "/admin/business-development-management",
    icon: development,
    label: "business-development-management",
    customLabelName: "Business Development Management",
    order: 6,
  },

  // course management ---------------------------------start -------------------
  {
    href: "/admin/course-management/session",
    icon: courseManagement,
    label: "session",
    customLabelName: "Session",
    order: 8,
  },
  {
    href: "/admin/course-management/courses",
    icon: courseManagement,
    label: "courses",
    customLabelName: "Courses",
    order: 9,
  },

  {
    href: "/admin/course-management/module",
    icon: courseManagement,
    label: "module",
    customLabelName: "Module",
    order: 10,
  },
  {
    href: "/admin/course-management/lessons",
    icon: courseManagement,
    label: "lessons",
    customLabelName: "Lessons",
    order: 11,
  },
  {
    href: "/admin/course-management/assessments",
    icon: courseManagement,
    label: "assessments",
    customLabelName: "Assessments",
    order: 12,
  },
  // course management -----------------------------end--------------------------

  // finance management ------------------------------------start----------------
  {
    href: "/admin/finance/certificate-course-fee",
    icon: UserManagement,
    label: "certificate-course-fee",
    customLabelName: "Certificate Course Fee",
    order: 14,
  },
  {
    href: "/admin/finance/advanced-course-fee",
    icon: UserManagement,
    label: "advanced-course-fee",
    customLabelName: "Advanced Course Fee",
    order: 15,
  },
  {
    href: "/admin/finance/advanced-payment-system",
    icon: UserManagement,
    label: "advanced-payment-system",
    customLabelName: "Advanced Payment System",
    order: 16,
  },
  {
    href: "/admin/finance/commission-payments",
    icon: UserManagement,
    label: "commission-payments",
    customLabelName: "Commission Payments",
    order: 17,
  },
  // {
  //   href: "/admin/finance/payment-processing-system",
  //   icon: UserManagement,
  //   label: "payment-processing-system",
  //   customLabelName: "Payment Processing System",
  //   order: 18,
  // },
  {
    href: "/admin/finance/finance-settings",
    icon: UserManagement,
    label: "finance-settings",
    customLabelName: "Finance Settings",
    order: 19,
  },
  {
    href: "/admin/finance/promotional-codes",
    icon: UserManagement,
    label: "promotional-codes",
    customLabelName: "Promotional Code",
    order: 20,
  },
  {
    href: "/admin/finance/promotional-codes",
    icon: UserManagement,
    label: "promotional-codes",
    customLabelName: "Promotional Codes",
    order: 21,
  },

  {
    href: "/admin/finance/payment-history",
    icon: UserManagement,
    label: "payment-history",
    customLabelName: "Payment History",
    order: 22,
  },

  {
    href: "/admin/finance/agent-overview",
    icon: UserManagement,
    label: "agent-overview",
    customLabelName: "Agent Overview",
    order: 22,
  },

  // finance management ------------------------------------end------------------
  {
    href: "/admin/enrollment-management",
    icon: UserManagement,
    label: "enrollment-management",
    customLabelName: "Enrollment Management",
    order: 23,
  },
  // student roaster ----------------------------------------start ---------------
  // {
  //   href: "/admin/student-roaster/roaster",
  //   icon: courseManagement,
  //   label: "roaster",
  //   order: 23,
  // },
  {
    href: "/admin/student-roaster/registry",
    icon: courseManagement,
    label: "registry",
    customLabelName: "Registry",
    order: 24,
  },
  {
    href: "/admin/student-roaster/support",
    icon: courseManagement,
    label: "support",
    customLabelName: "Support",
    order: 25,
  },
  {
    href: "/admin/external-portal-users/faculty-management",
    icon: UserManagement,
    label: "faculty-management",
    customLabelName: "faculty-management",
    order: 26,
  },
  {
    href: "/admin/user-management",
    icon: UserManagement,
    label: "user-management",
    customLabelName: "User Management",
    order: 27,
  },
  // student roaster ----------------------------------------end ---------------
  //System Settings
  {
    href: "/admin/system-settings",
    icon: Settings,
    label: "system-settings",
    customLabelName: "System Settings",
    order: 28,
  },
];

// Menu items.
const agentModuleItemsList = [
  {
    href: "/agent/application-management",
    icon: application,
    label: "application-management",
    customLabelName: "Application Management",
    order: 1,
  },
  {
    href: "/agent/sub-agent-management",
    icon: userGroup,
    label: "sub-agent-management",
    customLabelName: "Sub-Agent Management",
    order: 2,
  },
  {
    href: "/agent/agent-awarding-bodies",
    icon: honor,
    label: "agent-awarding-bodies",
    customLabelName: "awarding-body",
    order: 3,
  },
  {
    href: "/agent/commissions",
    icon: honor,
    label: "commissions",
    customLabelName: "Commissions",
    order: 4,
  },
];

const facultyModuleItemsList = [
  // {
  //   href: "/admin/course-management/session",
  //   icon: courseManagement,
  //   label: "session",
  // },
  {
    href: "/faculty/course-management/faculty-course-module",
    icon: courseManagement,
    label: "faculty-course-module",
    customLabelName: "Module",
    order: 1,
  },
  // {
  //   href: "/faculty/course-management/lesson",
  //   icon: courseManagement,
  //   label: "lesson",
  //   order: 2,
  // },
];

export const AppBarModuleListWithIconPath = {
  admin: adminModuleItemsList,
  agent: agentModuleItemsList,
  faculty: facultyModuleItemsList,
};
