import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { UserPortalCategoryRole } from "../../types";
import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/paginationUtils";
import { CreateInterviewSchema, DayInfo, InterviewGetApplicationsRequestBody, MonthDays } from "./types";

const getApplications = async (reqBody: InterviewGetApplicationsRequestBody, userId: string) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      {
        generalFileCheckStatus: "APPROVED",
      },
      {
        NOT: {
          status: "DRAFT",
        },
      },

      ...(reqBody.ownership && reqBody.ownership === "OWN"
        ? [
            {
              interviews: {
                some: {
                  interviewerId: userId,
                },
              },
            },
          ]
        : []),

      ...((reqBody.interviewOutcome && reqBody.interviewOutcome === "PASS") || reqBody.interviewOutcome === "FAIL"
        ? [
            {
              interviewOutcome: reqBody.interviewOutcome,
            },
          ]
        : []),

      ...(reqBody.interviewOutcome && reqBody.interviewOutcome === "PENDING"
        ? [
            {
              interviews: {
                none: {},
              },
            },
          ]
        : []),

      ...(reqBody.interviewOutcome && reqBody.interviewOutcome === "BOOKED"
        ? [
            {
              AND: [
                {
                  interviewOutcome: "PENDING",
                },
                {
                  interviews: {
                    some: {},
                  },
                },
              ],
            },
          ]
        : []),

      ...(reqBody.searchTerm
        ? [
            {
              OR: [
                {
                  id: {
                    contains: reqBody.searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  personalInformation: {
                    firstName: {
                      contains: reqBody.searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
                {
                  personalInformation: {
                    lastName: {
                      contains: reqBody.searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              ],
            },
          ]
        : []),
    ],
  };

  const [applications, count] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        applicationId: true,
        status: true,
        interviewOutcome: true,
        personalInformation: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
          },
        },
        courseSelection: {
          select: {
            course: {
              select: {
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        interviews: {
          select: {
            title: true,
            status: true,
            interviewDate: true,
            startTime: true,
            isLockInterview: true,
            endTime: true,
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
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),

    prisma.application.count({
      where,
    }),
  ]);

  const paginationData = {
    count: applications.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  const formattedApplications = applications.map((application) => {
    let flatInterviews: Record<string, unknown>[] = [];

    if (application.interviews && application.interviews.length > 0) {
      flatInterviews = application.interviews.map((interview) => {
        return {
          ...interview,
          interviewer:
            interview.interviewer.userPortalCategory.user.firstName +
            " " +
            interview.interviewer.userPortalCategory.user.lastName,
        };
      });
    }

    return {
      ...application,
      interviews: flatInterviews,
    };
  });

  return {
    applications: { applications: formattedApplications },
    pagination: paginationData,
  };
};

const getInterviews = async (userId: string) => {
  const interviewer = await prisma.userPortalCategoryRole.findFirst({
    where: {
      id: userId,
      role: {
        name: "interviewer",
      },
    },
  });

  const interviews = await prisma.interview.findMany({
    where: {
      ...(interviewer ? { interviewerId: interviewer.id } : {}),
    },
    include: {
      application: {
        include: {
          personalInformation: true,
          preScreeningHistories: true,
        },
      },
      interviewer: {
        include: {
          userPortalCategory: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  const formattedInterviews = await Promise.all(
    interviews.map(async (interview) => ({
      ...interview,
      bookedBy: await prisma.userPortalCategoryRole.findUnique({
        where: {
          id: interview.bookedById,
        },
        include: {
          userPortalCategory: {
            include: {
              user: true,
            },
          },
          role: true,
        },
      }),
    })),
  );

  return { formattedInterviews };
};

const createInterview = async (applicationId: string, reqBody: CreateInterviewSchema, reqUserId: string) => {
  const existingInterviews = await prisma.interview.findMany({
    where: {
      applicationId: applicationId,
      status: {
        in: ["PENDING", "RESCHEDULED"],
      },
    },
  });

  if (existingInterviews.length > 0) {
    throw new AppError("Another interview is already scheduled for this application", "BAD_REQUEST", 400);
  }

  const passedInterviews = await prisma.interview.findMany({
    where: {
      applicationId: applicationId,
      status: "PASS",
    },
  });

  if (passedInterviews.length > 0) {
    throw new AppError("Another interview is already passed for this application", "BAD_REQUEST", 400);
  }

  const interview = await prisma.interview.create({
    data: {
      applicationId: applicationId,
      interviewerId: reqBody.interviewerId!,
      title: reqBody.title,
      interviewDate: reqBody.interviewDate,
      startTime: reqBody.startTime,
      endTime: reqBody.endTime,
      platform: reqBody.platform,
      interviewLink: reqBody.interviewLink || "",
      guests: reqBody.guests,
      color: reqBody.color,
      bookedById: reqUserId,
    },
  });

  await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      interviewOutcome: "PENDING",
    },
  });

  return { interview };
};

const searchInterviewer = async (term: string) => {
  const where: Prisma.UserPortalCategoryRoleFindManyArgs["where"] = term
    ? {
        AND: [
          {
            role: {
              name: "interviewer",
            },
          },
          {
            userPortalCategory: {
              user: {
                OR: [
                  {
                    firstName: {
                      contains: term,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    lastName: {
                      contains: term,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            },
          },
        ],
      }
    : {
        role: {
          name: "interviewer",
        },
      };

  const interviewers = await prisma.userPortalCategoryRole.findMany({
    where,
    include: {
      userPortalCategory: {
        include: {
          user: true,
        },
      },
    },
  });

  const formattedInterviewers = interviewers.map((interviewer) => ({
    id: interviewer.id,
    name: `${interviewer.userPortalCategory.user.firstName} ${interviewer.userPortalCategory.user.lastName}`,
  }));

  return { formattedInterviewers };
};

const getCalender = async (year: number, month: string, reqUser: UserPortalCategoryRole) => {
  // Helper functions moved outside to the module level
  const monthIndex = getMonthIndex(month);
  const currentCalender = getDaysInMonthWithNames(year, month);
  const prevCalender = getDaysInMonthWithNames(year, getMonthNameFromIndex(monthIndex - 1));
  const nextCalender = getDaysInMonthWithNames(year, getMonthNameFromIndex(monthIndex + 1));

  // Get prev month days to fill the calendar grid
  const prevCalenderDays = prevCalender.days.slice(
    -(currentCalender.days[0].weekday + 1 - currentCalender.days[0].day),
  );

  // Build full calendar with surrounding month days if needed
  const calenderDays = [
    ...(currentCalender.days[0].name === "Sunday" ? [] : prevCalenderDays),
    ...currentCalender.days,
    ...nextCalender.days.slice(0, 42 - [...prevCalenderDays, ...currentCalender.days].length),
  ];

  // Format calendar days with interview data
  const formattedCalenderDays = await Promise.all(
    calenderDays.map(async (day) => {
      const target = new Date(day.dateString);
      const startOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      const endOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1);

      // Get interviews for the specific day
      const dayInterviews = await prisma.interview.findMany({
        where: {
          ...(reqUser.role.name === "interviewer" ? { interviewerId: reqUser.id } : {}),
          interviewDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          application: {
            include: {
              personalInformation: true,
            },
          },
          interviewer: {
            include: {
              role: true,
              userPortalCategory: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Format each interview with additional information
      const interviews = await Promise.all(
        dayInterviews.map(async (interview) => ({
          id: interview.id,
          title: interview.title,
          interviewDate: interview.interviewDate,
          startTime: interview.startTime,
          endTime: interview.endTime,
          platform: interview.platform,
          guests: interview.guests,
          color: interview.color,
          applicationStatus: interview.application.status,
          status: interview.status,
          applicationId: interview.applicationId,
          formattedApplicationId: interview.application.applicationId,
          interviewerId: interview.interviewerId,
          bookedById: interview.bookedById,
          applicant:
            interview.application.personalInformation?.firstName +
            " " +
            interview.application.personalInformation?.lastName,
          interviewer:
            interview.interviewer.userPortalCategory.user.firstName +
            " " +
            interview.interviewer.userPortalCategory.user.lastName,
          bookedBy: Object.values(
            (
              await prisma.userPortalCategoryRole.findUnique({
                where: {
                  id: interview.bookedById,
                },
                include: {
                  userPortalCategory: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                  role: true,
                },
              })
            )?.userPortalCategory.user as { firstName: string; lastName: string },
          ).join(" "),
        })),
      );

      return {
        ...day,
        interviews: interviews.length > 0 ? interviews : undefined,
      };
    }),
  );

  currentCalender.days = formattedCalenderDays;
  return { calender: currentCalender };
};

const getApplicationCalender = async (
  year: number,
  month: string,
  reqUser: UserPortalCategoryRole,
  applicationId: string,
) => {
  // Helper functions
  const monthIndex = getMonthIndex(month);
  const currentCalender = getDaysInMonthWithNames(year, month);
  const prevCalender = getDaysInMonthWithNames(year, getMonthNameFromIndex(monthIndex - 1));
  const nextCalender = getDaysInMonthWithNames(year, getMonthNameFromIndex(monthIndex + 1));

  // Get prev month days to fill the calendar grid
  const prevCalenderDays = prevCalender.days.slice(
    -(currentCalender.days[0].weekday + 1 - currentCalender.days[0].day),
  );

  // Build full calendar with surrounding month days if needed
  const calenderDays = [
    ...(currentCalender.days[0].name === "Sunday" ? [] : prevCalenderDays),
    ...currentCalender.days,
    ...nextCalender.days.slice(0, 42 - [...prevCalenderDays, ...currentCalender.days].length),
  ];

  // Format calendar days with interview data for the specific application
  const formattedCalenderDays = await Promise.all(
    calenderDays.map(async (day) => {
      const target = new Date(day.dateString);
      const startOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      const endOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1);

      // Get interviews for the specific day and application
      const dayInterviews = await prisma.interview.findMany({
        where: {
          applicationId: applicationId,
          interviewDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          application: {
            include: {
              personalInformation: true,
            },
          },
          interviewer: {
            include: {
              role: true,
              userPortalCategory: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Format each interview with additional information
      const interviews = await Promise.all(
        dayInterviews.map(async (interview) => ({
          id: interview.id,
          title: interview.title,
          interviewDate: interview.interviewDate,
          startTime: interview.startTime,
          endTime: interview.endTime,
          platform: interview.platform,
          guests: interview.guests,
          color: interview.color,
          status: interview.status,
          applicationId: interview.applicationId,
          interviewerId: interview.interviewerId,
          bookedById: interview.bookedById,
          applicant:
            interview.application.personalInformation?.firstName +
            " " +
            interview.application.personalInformation?.lastName,
          interviewer:
            interview.interviewer.userPortalCategory.user.firstName +
            " " +
            interview.interviewer.userPortalCategory.user.lastName,
          bookedBy: Object.values(
            (
              await prisma.userPortalCategoryRole.findUnique({
                where: {
                  id: interview.bookedById,
                },
                include: {
                  userPortalCategory: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                  role: true,
                },
              })
            )?.userPortalCategory.user as { firstName: string; lastName: string },
          ).join(" "),
        })),
      );

      return {
        ...day,
        interviews: interviews.length > 0 ? interviews : undefined,
      };
    }),
  );

  currentCalender.days = formattedCalenderDays;
  return { calender: currentCalender };
};

// Helper functions defined at module level to avoid duplication
function getDaysInMonthWithNames(year: number, monthName: string): MonthDays {
  const dateForParsing = new Date(`${monthName} 1, ${year}`);
  const monthIndex = dateForParsing.getMonth();

  if (isNaN(monthIndex)) {
    throw new Error(`Invalid month name: "${monthName}"`);
  }

  const days: DayInfo[] = [];
  const date = new Date(year, monthIndex, 1);

  while (date.getMonth() === monthIndex) {
    const dayNumber = date.getDate();
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const weekdayNumber = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateString = date.toISOString(); // JavaScript date string
    days.push({
      day: dayNumber,
      name: dayName,
      weekday: weekdayNumber,
      monthName: monthName,
      year: year,
      dateString,
    });
    date.setDate(dayNumber + 1);
  }

  const fullMonthName = new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
  });

  return {
    month: fullMonthName,
    year,
    days,
  };
}

function getMonthIndex(monthName: string): number {
  const date = new Date(`${monthName} 1, 2000`); // year doesn't matter
  const index = date.getMonth();
  if (isNaN(index)) {
    throw new Error(`Invalid month name: "${monthName}"`);
  }
  return index; // 0 = January, 11 = December
}

function getMonthNameFromIndex(index: number): string {
  // Handle month index wrapping (e.g., -1 becomes 11 for December, 12 becomes 0 for January)
  const normalizedIndex = ((index % 12) + 12) % 12;
  const date = new Date(2000, normalizedIndex, 1); // year and day don't matter
  return date.toLocaleDateString("en-US", { month: "long" });
}

export const InterviewService = {
  createInterview,
  getInterviews,
  searchInterviewer,
  getCalender,
  getApplicationCalender,
  getApplications,
};
