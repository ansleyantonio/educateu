import { EmailType, Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { INotificationsLog } from "./types";

const getNotificationsLog = async (reqBody: INotificationsLog, userId: string, admin: boolean = true) => {
  const { emailType, status, recipient, searchTerm, startDate, endDate, page = 1, pageSize = 10 } = reqBody;

  const skip = (page - 1) * pageSize;

  const where: Prisma.NotificationLogWhereInput = {
    ...(!admin && { userId }),
    ...(emailType?.length && {
      emailType: {
        in: emailType as EmailType[],
      },
    }),

    ...(status && { status }),
    ...(recipient && { recipient }),

    ...(searchTerm && {
      OR: [
        { message: { contains: searchTerm, mode: "insensitive" } },
        { recipient: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),

    ...((startDate || endDate) && {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    }),
  };

  // total count (with filters)
  const totalCount = await prisma.notificationLog.count({ where });

  // paginated data
  const notificationsLog = await prisma.notificationLog.findMany({
    where,
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  return {
    notificationsLog,
    pagination: {
      page,
      pageSize,
      count: notificationsLog.length, // current page count
      totalCount, // total matching records
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};
export const NotificationsLogService = { getNotificationsLog };
