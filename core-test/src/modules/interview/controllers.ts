import { Response } from "express";
import z from "zod";
import prisma from "../../prismaClient";
import { RequestWithUser } from "../../types";
import { AppError } from "../../utils/AppError";
import {
  getUserIdFromApplication,
  sendApplicationInterviewOutcome,
  sendRealTimeData,
} from "../../utils/notificationService";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { InterviewService } from "./services";
import { createInterviewSchema, interviewGetApplicationsReqBodySchema, updateInterviewOutcomeSchema } from "./types";

const getInterviews = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const applicationInterviews = await InterviewService.getInterviews(req.user.id);

  sendSuccessResponse(res, applicationInterviews);
};

const getApplications = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const reqBody = zodSafeParse(req.body, interviewGetApplicationsReqBodySchema);

  const { applications, pagination } = await InterviewService.getApplications(reqBody, req.user.id);

  sendSuccessResponse(res, applications, undefined, undefined, pagination);
};

const getInterviewsByApplicationId = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const applicationInterviews = await prisma.interview.findMany({
    where: {
      applicationId: applicationId,
    },
    select: {
      id: true,
      interviewDate: true,
      startTime: true,
      endTime: true,
      status: true,
      application: {
        select: {
          applicationId: true,
          status: true,
          personalInformation: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      interviewer: {
        select: {
          userPortalCategory: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      bookedById: true,
    },
  });

  const formatInterviewPromises = applicationInterviews.map(async (applicationInterview) => {
    const { application, bookedById, ...rest } = applicationInterview;

    const bookedBy = await prisma.userPortalCategoryRole.findUnique({
      where: {
        id: applicationInterview.bookedById,
      },
      select: {
        userPortalCategory: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!bookedBy) {
      throw new AppError("No booked by found", "BAD_REQUEST", 400);
    }

    return {
      ...rest,
      applicant: `${applicationInterview.application.personalInformation?.firstName} ${applicationInterview.application.personalInformation?.lastName}`,
      interviewer: `${applicationInterview.interviewer.userPortalCategory.user.firstName} ${applicationInterview.interviewer.userPortalCategory.user.lastName}`,
      bookedBy: `${bookedBy.userPortalCategory.user.firstName} ${bookedBy.userPortalCategory.user.lastName}`,
      applicantId: applicationInterview.application.applicationId,
      applicationStatus: applicationInterview.application.status,
    };
  });

  const formattedApplicationInterviews = await Promise.all(formatInterviewPromises);

  sendSuccessResponse(res, { interviews: formattedApplicationInterviews });
};

const createApplicationInterview = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const applicationId = zodSafeParse(req.params.applicationId, z.string().uuid());

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      personalInformation: {
        select: {
          verifiedEmail: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError("No application found", "BAD_REQUEST", 400);
  }

  if (!application.personalInformation?.verifiedEmail) {
    throw new AppError("Email not verified", "BAD_REQUEST", 400);
  }

  // Block creation if any interview for this application is locked
  const lockedInterview = await prisma.interview.findFirst({
    where: {
      applicationId,
      isLockInterview: true,
    },
  });

  if (lockedInterview) {
    throw new AppError("Interview is locked and cannot be modified", "BAD_REQUEST", 400);
  }

  const reqBody = zodSafeParse(req.body, createInterviewSchema);

  if (!reqBody.interviewerId) {
    reqBody.interviewerId = req.user.id;
  }

  const interview = await InterviewService.createInterview(applicationId, reqBody, req.user.id);

  const interviewDetails = await prisma.interview.findUnique({
    where: { id: interview.interview.id },
    select: {
      id: true,
      status: true,
      interviewDate: true,
      startTime: true,
      endTime: true,
      bookedById: true,
      application: {
        select: {
          personalInformation: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      interviewer: {
        select: {
          userPortalCategory: {
            select: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // const userMail = await prisma.user.findUnique({
  //   where: { id: req.user?.userPortalCategory?.userId },
  //   select: { email: true, agentEmail: true, facultyEmail: true },
  // });
  // const adminEmail = userMail?.email;

  sendApplicationInterviewOutcome({ applicationId, outcome: interviewDetails?.status ?? "PENDING" });

  // Get the applicant's user ID to include in notification
  const applicantUserId = await getUserIdFromApplication(applicationId);

  sendRealTimeData({
    userIds: [req.user?.userPortalCategory?.userId, ...applicantUserId].filter(Boolean) as string[],
    title: "Interview Scheduled",
    message:
      "An interview has been scheduled for " +
      `${interviewDetails?.application?.personalInformation?.firstName} ${interviewDetails?.application?.personalInformation?.lastName}`,
  });
  sendSuccessResponse(res, interview);
};

const searchInterviewer = async (req: RequestWithUser, res: Response) => {
  const { term } = zodSafeParse(req.query, z.object({ term: z.string().min(1).optional() }));

  const interviewers = await InterviewService.searchInterviewer(term);

  sendSuccessResponse(res, interviewers);
};

const getCalender = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { year, month } = zodSafeParse(
    req.query,
    z.object({
      year: z.coerce.number().min(1900).max(2100).optional().default(new Date().getFullYear()),
      month: z
        .string()
        .min(1)
        .max(12)
        .optional()
        .default(new Date().toLocaleDateString("en-US", { month: "long" })),
    }),
  );

  const calender = await InterviewService.getCalender(year, month, req.user);

  sendSuccessResponse(res, calender);
};

const getApplicationCalender = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { applicationId } = zodSafeParse(
    req.params,
    z.object({
      applicationId: z.string().uuid(),
    }),
  );

  const { year, month } = zodSafeParse(
    req.query,
    z.object({
      year: z.coerce.number().min(1900).max(2100).optional().default(new Date().getFullYear()),
      month: z
        .string()
        .min(1)
        .max(12)
        .optional()
        .default(new Date().toLocaleDateString("en-US", { month: "long" })),
    }),
  );

  const calender = await InterviewService.getApplicationCalender(year, month, req.user, applicationId);

  sendSuccessResponse(res, calender);
};

const updateInterviewOutcome = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const { outcome } = zodSafeParse(
    req.body,
    z.object({ outcome: z.string().transform((value) => value.toUpperCase()) }),
  );
  if (outcome) {
    sendApplicationInterviewOutcome({ applicationId, outcome });
  }
  const app = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      preScreeningHistories: {
        select: {
          outcome: true,
        },
      },
      _count: {
        select: {
          interviews: true,
        },
      },
    },
  });

  if (!app?._count.interviews) {
    throw new AppError("No interviews found", "BAD_REQUEST", 400);
  }

  const preScreeningPassed = app.preScreeningHistories.some((preScreeningHistory) =>
    preScreeningHistory.outcome.toLowerCase().includes("pass"),
  );

  const interviewOutcomePass = outcome.toLowerCase().includes("pass");

  // if (interviewOutcomePass && !preScreeningPassed) {
  // }

  // if outcome is reshedule then update the interview date to reshedule
  const { startTime, endTime, interviewDate } = zodSafeParse(req.body, updateInterviewOutcomeSchema);
  if (outcome === "RESCHEDULED") {
    await prisma.interview.updateMany({
      where: {
        applicationId,
        status: "PENDING",
      },
      data: {
        status: "RESCHEDULED",
        interviewDate: interviewDate,
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
    });
  } else {
    await prisma.interview.updateMany({
      where: {
        applicationId,
        status: {
          in: ["PENDING", "RESCHEDULED"],
        },
        //  status: "PENDING",
      },
      data: {
        status: outcome,
      },
    });
  }

  // await prisma.interview.updateMany({
  //   where: {
  //     applicationId: applicationId,
  //     status: "PENDING",
  //   },
  //   data: {
  //     status: outcome,
  //   },
  // });

  const application = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      ...(interviewOutcomePass &&
        !preScreeningPassed && {
          preScreeningHistories: {
            create: {
              outcome: "passed",
              template: "Interview Passed",
              createdById: req.user.id,
            },
          },
        }),
      interviewOutcome: outcome,
      ...(outcome === "PASS" && { credibilityStatus: "PASSED" }),
    },
    select: {
      id: true,
      personalInformation: true,
      interviewOutcome: true,
      credibilityStatus: true,
    },
  });

  // Get the applicant's user ID to include in notification
  const applicantUserId = await getUserIdFromApplication(applicationId);

  sendRealTimeData({
    userIds: [req.user?.userPortalCategory?.userId, ...applicantUserId].filter(Boolean) as string[],
    title: "Interview Outcome Updated",
    message:
      "The interview outcome has been updated for " +
      `${application?.personalInformation?.firstName} ${application.personalInformation?.lastName}`,
  });
  sendSuccessResponse(res, { application });
};

export const InterviewController = {
  createApplicationInterview,
  getInterviews,
  getApplications,
  getInterviewsByApplicationId,
  searchInterviewer,
  getCalender,
  getApplicationCalender,
  updateInterviewOutcome,
};
