import express from "express";
import { Response } from "express";

// Payment-related routes
import {
  advancedRouter,
  certificateRouter,
  commissionPaymentRouter,
  paymentRouter,
  promotionalCodeRouter,
  financeSettingsRouter,
} from "../modules/payment/routes";
import AgentCommissionPaymentRouter from "../commissions/routes";
import { adminAgentOverviewRouter } from "../modules/agent-overview/routes";

// Application management routes
import { applicationManagementRouter } from "../modules/application-management/routes";
import { admissionRouter } from "../modules/admission/routes";

// Student management routes
import { studentManagementRouter } from "../modules/student-management/routes";
import { studentEnrollmentRouter } from "../modules/student-enrollment/routes";
import { studentRoasterRouter, supportTicketRouter } from "../modules/student-roaster/routes";

// Course management routes
import { courseRouter } from "../modules/course/routes";
import { awardingBodyRouter } from "../modules/awarding-body/routes";
import { courseModuleRouter } from "../modules/course-module/routes";
import { lessonRouter } from "../modules/lesson/routes";

// Assessment and rubric routes
import { assessmentRouter } from "../modules/assessment/route";
import { rubricRouter } from "../modules/rubric/route";

// Other routes
import { wellbeingRouter } from "../modules/wellbeing/routes";
import { additionalFileCheckRouter } from "../modules/additional-file-check/routes";
import { preScreeningRouter } from "../modules/pre-screening/routes";
import { interviewRouter } from "../modules/interview/routes";
import { sessionRouter } from "../modules/session/routes";
import { facultyCourseModuleRouter } from "../modules/faculty-course-module/routes";
import { facultyCourseLessonRouter } from "../modules/faculty-course-lesson/routes";
import { RequestWithUser } from "../types";
import { studentPortalRouter } from "../student-portal/routes";
import { bankInfoRouter } from "../modules/accounts/routes";
import { facultyAssessmentRouter } from "../modules/faculty-assessment/routes";
import { facultyEcRequestRouter } from "../modules/faculty-ec-request/routes";
import { withdrawalRequestRouter } from "../modules/withdrawal-request/routes";
import { adminNotificationsLogRouter, agentNotificationsLogRouter } from "../modules/notifications-log/routes";
import { emailTemplateRouter } from "../modules/email-template/routes";

/**
 * Register all application routes with the Express app
 */
export const registerRoutes = (app: express.Application) => {
  // Admin Portal routes
  app.use("/additional-file-check", additionalFileCheckRouter);
  app.use("/admission", admissionRouter);
  app.use("/assessments", assessmentRouter);
  app.use("/advanced-course-fee", advancedRouter);
  app.use("/advanced-payment-system", paymentRouter);
  app.use("/agent-overview", adminAgentOverviewRouter);
  app.use("/awarding-bodies", awardingBodyRouter);
  app.use("/certificate-course-fee", certificateRouter);
  app.use("/commission-payments", commissionPaymentRouter);
  app.use("/courses", courseRouter);
  app.use("/course-modules", courseModuleRouter);
  app.use("/enrollment-management", studentEnrollmentRouter);
  app.use("/finance-settings", financeSettingsRouter);
  app.use("/interview", interviewRouter);
  app.use("/lessons", lessonRouter);
  app.use("/payments", paymentRouter);
  app.use("/pre-screening", preScreeningRouter);
  app.use("/promotional-codes", promotionalCodeRouter);
  app.use("/registry", studentRoasterRouter);
  app.use("/rubrics", rubricRouter);
  app.use("/session", sessionRouter);
  app.use("/student-management", studentManagementRouter);
  app.use("/support", studentRoasterRouter);
  app.use("/withdrawal-request", withdrawalRequestRouter);
  app.use("/support-tokens", supportTicketRouter);
  app.use("/wellbeing", wellbeingRouter);
  app.use("/system-settings", bankInfoRouter);
  app.use("/system-settings/email-templates", emailTemplateRouter);
  app.use("/notification-log", adminNotificationsLogRouter);

  // Agent Portal routes
  app.use("/application-management", applicationManagementRouter);
  app.use("/commissions", AgentCommissionPaymentRouter);
  app.use("/commission-payments", AgentCommissionPaymentRouter);
  app.use("/agent-notification-log", agentNotificationsLogRouter);

  // Faculty Portal routes
  app.use("/faculty-ec-request", facultyEcRequestRouter);
  app.use("/faculty-assessment", facultyAssessmentRouter);
  app.use("/faculty-course-module", facultyCourseModuleRouter);
  app.use("/faculty-course-module/courses", courseRouter);
  app.use("/faculty-course-module/session", sessionRouter);
  app.use("/faculty-course-module/course-modules", courseModuleRouter);
  app.use("/faculty-course-module/lessons", lessonRouter);
  app.use("/faculty-course-module/assessments", assessmentRouter);
  app.use("/faculty-course-module/rubrics", rubricRouter);

  app.use("/faculty-course-lesson", facultyCourseLessonRouter);

  // Student Portal routes
  app.use("/student-portal", studentPortalRouter);
};
