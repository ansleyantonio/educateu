import axios from "axios";
import prisma from "../prismaClient";
import { logError } from "../middlewares/errorHandler";
import { backgroundAsyncWrapper } from "./asyncWrapper";

export const getUserIdFromApplication = async (applicationId: string): Promise<string[]> => {
  try {
    const applicationData = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        userPortalCategoryRoleApplications: {
          select: {
            userPortalCategoryRole: {
              select: {
                userPortalCategory: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!applicationData?.userPortalCategoryRoleApplications) {
      return [];
    }
    return [
      ...new Set(
        applicationData.userPortalCategoryRoleApplications
          .map((app) => app.userPortalCategoryRole.userPortalCategory.userId)
          .filter(Boolean) as string[],
      ),
    ];
  } catch (error) {
    logError(error);
    return [];
  }
};
export const getAdmissionOfficerId = async (applicationId: string): Promise<string | null> => {
  const applicationData = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      userPortalCategoryRoleApplications: {
        where: {
          userPortalCategoryRole: {
            role: {
              name: "admission-officer",
            },
          },
        },
        select: {
          userPortalCategoryRole: {
            select: {
              userPortalCategory: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!applicationData?.userPortalCategoryRoleApplications?.[0]) {
    return null;
  }
  return applicationData.userPortalCategoryRoleApplications[0].userPortalCategoryRole.userPortalCategory.userId;
};

export const getAllAdmissionUsers = async (): Promise<string[]> => {
  const users = await prisma.user.findMany({
    where: {
      userPortalCategories: {
        some: {
          portalCategory: {
            name: "admin",
          },
          userPortalCategoryRoles: {
            some: {
              role: {
                name: {
                  in: ["admin", "admission-officer"],
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
  return users.map((user) => user.id);
};

export const getUserIdFromUserPortalCategoryRole = async (userPortalCategoryRoleId: string): Promise<string | null> => {
  try {
    const userPortalCategoryRoleData = await prisma.userPortalCategoryRole.findUnique({
      where: { id: userPortalCategoryRoleId },
      select: {
        userPortalCategory: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!userPortalCategoryRoleData) {
      return null;
    }
    return userPortalCategoryRoleData.userPortalCategory.userId;
  } catch (error) {
    logError(error);
    return null;
  }
};

interface WellbeingNotificationData {
  emails: string[];
  applicantName: string;
  status: string;
}

interface RegisterNotificationData {
  email: string;
  name: string;
  password: string;
  userName: string;
  loginUrl: string;
  courseTitle?: string;
  courseStartDate?: string;
}

interface NotesNotificationData {
  emails: string[];
  name: string;
  noteContent: string;
}

interface InterviewNotificationData {
  emails: string[];
  name: string;
  interviewDate: string;
  interviewStartTime: string;
  interviewEndTime: string;
}

interface ApplicationOutcomeNotificationData {
  applicationId: string;
  outcome: string;
}

interface StripeApplicationOutcomeNotificationData {
  applicationId: string;
  outcome: string;
}

interface EnrollmentNotificationData {
  applicationId: string;
  amount: number;
  paymentType?: string;
}

// Simplified Application type for notifications
interface NotificationApplication {
  id: string;
  applicationId?: string;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  stage?: "NEW" | "ASSIGN" | "CHECK" | "SUBMIT" | "OUTCOME";
  wellbeingCheckStatus?: "PENDING" | "APPROVED" | "REJECTED";
  generalFileCheckStatus?: "PENDING" | "APPROVED" | "REJECTED";
  additionalFileCheckStatus?: "PENDING" | "APPROVED" | "REJECTED";
  interviewOutcome?: string;
  outcome?: "PENDING" | "APPROVED_UNCONDITIONAL" | "APPROVED_CONDITIONAL" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
  personalInformation?: {
    firstName: string;
    lastName: string;
    email: string;
    verifiedEmail?: boolean;
  };
  courseSelection?: {
    faculty?: string;
    intake?: string;
    yearOfCourse?: string;
  };
  academicBackground?: {
    highestLevelOfQualification?: string;
  };
}

interface ApplicationSummaryNotificationData {
  applicationId: string;
}

interface EmailVerificationNotificationData {
  email: string;
}
interface verifyEmailData {
  // email: string;
  applicationId: string;
}
interface ApplicationDecisionRequestNotificationData {
  applicationId: string;
  outcome: string;
}

/**
 * Sends a wellbeing notification
 */
export const sendWellbeingNotification = (data: WellbeingNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/wellbeing`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends a register notification
 */
export const sendRegisterNotification = (data: RegisterNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/register`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends a notes notification
 */
export const sendNotesNotification = (data: NotesNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/notes`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends an interview notification
 */
export const sendInterviewNotification = (data: InterviewNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/interview`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends an application outcome notification
 */
export const sendApplicationOutcomeNotification = (data: ApplicationOutcomeNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/application-outcome`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends a stripe application outcome notification
 */
export const sendStripeApplicationOutcomeNotification = (data: StripeApplicationOutcomeNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/application-notification/stripe-outcome`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends an enrollment notification
 */
export const sendEnrollmentNotification = (data: EnrollmentNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/enrollment`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends an application summary notification
 */
export const sendApplicationSummaryNotification = (data: ApplicationSummaryNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/application-notification/summary`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends an email verification notification
 */
export const sendEmailVerificationNotification = (data: EmailVerificationNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/email-verification`, {
        ...data,
      });
    }),
  );
};

/**
 * Sends an application decision request notification
 */
export const sendApplicationDecisionRequestNotification = (data: ApplicationDecisionRequestNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/application-notification/decision-request`, {
        ...data,
      });
    }),
  );
};
export const sendApplicationInterviewOutcome = (data: ApplicationDecisionRequestNotificationData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/application-notification/interview/outcome`, {
        ...data,
      });
    }),
  );
};

export interface CreateNotification {
  userIds: string[];
  title: string;
  message: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
  relatedEntity?: string;
  entityType?: EntityType;
}

export type NotificationType = "APPLICATION_SUBMITTED" | "DOCUMENT_REQUEST";

export type EntityType = "APPLICATION" | "COMMENT" | "DOCUMENT";

export const sendRealTimeData = (data: CreateNotification) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/real-time-notification`, {
        ...data,
      });
    }),
  );
};
export interface SendPreScreenOutcomeEmailInput {
  applicationId: string;
  outcome: string;
}
export const sendPreviewNotification = (data: SendPreScreenOutcomeEmailInput) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification/pre-screen-outcome`, {
        ...data,
      });
    }),
  );
};

export const sendEmailVerification = (data: verifyEmailData) => {
  setImmediate(
    backgroundAsyncWrapper(async () => {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/application-notification/verify-email`, data);
    }),
  );
};
