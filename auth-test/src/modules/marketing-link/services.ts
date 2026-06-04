import { nanoid } from "nanoid";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { IMarketingLink } from "./schema";
import { Prisma, MarketingLinkStatus } from "@prisma/client";
import { getPagination } from "../../utils/paginationUtils";
import axios, { AxiosRequestConfig } from "axios";
import { sendSuccessResponse } from "../../utils/responseUtils";

/* get all marketing links */
const getMarketingLinks = async (
  user: { userId?: string; userPortalCategoryId?: string },
  reqQuery: {
    page: number;
    search?: string;
    pageSize: number;
    status?: "ACTIVE" | "INACTIVE";
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) => {
  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);

  // 1. Build the Where Input
  const where: Prisma.MarketingLinkWhereInput = {
    userPortalCategoryRole: {
      userPortalCategoryId: user.userPortalCategoryId,
    },
    // Search filter
    ...(reqQuery.search && {
      marketingLinkName: {
        contains: reqQuery.search,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    // Status filter - Cast to MarketingLinkStatus to match Prisma Enum
    ...(reqQuery.status && {
      status: reqQuery.status as MarketingLinkStatus,
    }),
    // Start Date filter
    ...(reqQuery.startDate && {
      startDate: {
        gte: reqQuery.startDate,
      },
    }),
    // End Date filter
    ...(reqQuery.endDate && {
      endDate: {
        lte: reqQuery.endDate,
      },
    }),
  };

  // 2. Execute Transaction
  const [marketingLinks, total] = await prisma.$transaction([
    prisma.marketingLink.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [reqQuery.sortBy || "createdAt"]: reqQuery.sortOrder || "desc",
      },
    }),
    prisma.marketingLink.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const marketingLinksWithUrl = marketingLinks.map((link) => ({
    ...link,
    url: `${process.env.MARKETING_TERGET_URL}/create?code=${link.code}`,
  }));

  const pagination = {
    count: marketingLinks.length,
    total,
    page: reqQuery.page,
    perPage: limit,
    totalPages,
  };

  return {
    marketingLinks: marketingLinksWithUrl,
    pagination,
  };
};

/* create a marketing link */
const createMarketingLink = async (
  data: IMarketingLink,
  user: {
    userId?: string;
    userPortalCategoryId?: string;
  },
) => {
  // Validate the User's Role
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategoryId: user.userPortalCategoryId,
      role: {
        name: "agent",
      },
    },
  });

  if (!userPortalCategoryRole) {
    throw new AppError(
      `Agent role not found for User: ${user.userId}`,
      "FORBIDDEN",
      403,
    );
  }

  //  Check for Duplicate Link Names for this specific agent
  const isDuplicate = await prisma.marketingLink.findFirst({
    where: {
      marketingLinkName: data.marketingLinkName,
      userPortalCategoryRoleId: userPortalCategoryRole.id,
    },
  });

  if (isDuplicate) {
    throw new AppError(
      `${data.marketingLinkName} already exists.`,
      "CONFLICT",
      409,
    );
  }

  //  Create the Record
  const response = await prisma.marketingLink.create({
    data: {
      code: nanoid(10),
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: data.endDate,
      marketingLinkName: data.marketingLinkName,
      userPortalCategoryRoleId: userPortalCategoryRole.id,
    },
  });

  return {
    ...response,
    url: `${process.env.MARKETING_TERGET_URL}?code=${response.code}`,
  };
};

/* get a marketing link by id */
const getMarketingLinkById = async (
  id: string,
  user: {
    userId?: string;
    userPortalCategoryId?: string;
  },
): Promise<IMarketingLink & { url: string }> => {
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategoryId: user.userPortalCategoryId,
      role: {
        name: "agent",
      },
    },
  });

  if (!userPortalCategoryRole) {
    throw new AppError(
      `User Portal Category Role not found for user ${user.userId} and portal category ${user.userPortalCategoryId}`,
      "BAD_REQUEST",
      400,
    );
  }

  const link = await prisma.marketingLink.findUnique({
    where: {
      userPortalCategoryRoleId: userPortalCategoryRole.id,
      id: id,
    },
  });
  if (!link) {
    throw new AppError(`${id} not found`, "NOT_FOUND", 404);
  }

  return {
    ...link,
    url: `${process.env.MARKETING_TERGET_URL}/create?code=${link.code}`,
  };
};

/* update a marketing link by id */
const updateMarketingLinkById = async (
  data: Partial<IMarketingLink>,
  user: {
    userId?: string;
    userPortalCategoryId?: string;
  },
  id: string,
): Promise<IMarketingLink> => {
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategoryId: user.userPortalCategoryId,
      role: {
        name: "agent",
      },
    },
  });

  if (!userPortalCategoryRole) {
    throw new AppError(
      `User Portal Category Role not found for user ${user.userId} and portal category ${user.userPortalCategoryId}`,
      "BAD_REQUEST",
      400,
    );
  }

  const link = await prisma.marketingLink.findUnique({
    where: {
      userPortalCategoryRoleId: userPortalCategoryRole.id,
      id: id,
    },
  });

  if (!link) {
    throw new AppError(
      `${data?.marketingLinkName ?? "Marketing Link"} not found`,
      "NOT_FOUND",
      404,
    );
  }

  const updatedLink = {
    marketingLinkName: data.marketingLinkName,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
  };

  const response = await prisma.marketingLink.update({
    where: {
      id: id,
    },
    data: updatedLink,
  });

  return response;
};

/* delete a marketing link by id */
const deleteMarketingLinkById = async (
  id: string,
  user: {
    userId?: string;
    userPortalCategoryId?: string;
  },
): Promise<IMarketingLink> => {
  // console.log("Triggered to delete marketing link", id);
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategoryId: user.userPortalCategoryId,
      role: {
        name: "agent",
      },
    },
  });

  if (!userPortalCategoryRole) {
    throw new AppError(
      `User Portal Category Role not found for user ${user.userId} and portal category ${user.userPortalCategoryId}`,
      "BAD_REQUEST",
      400,
    );
  }

  const link = await prisma.marketingLink.delete({
    where: {
      userPortalCategoryRoleId: userPortalCategoryRole.id,
      id: id,
    },
  });

  // console.log("Link Deleted", link);

  if (!link) {
    throw new AppError(`Marketing Link not found`, "NOT_FOUND", 404);
  }

  return link;
};

/* get a marketing link report by id */
const getMarketingLinkReports = async (
  user: { userId?: string; userPortalCategoryId?: string },
  reqQuery: {
    page: number;
    search?: string;
    pageSize: number;
    status?: "ACTIVE" | "INACTIVE";
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) => {
  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);

  // 1️⃣ Build dynamic filters
  const where: Prisma.MarketingLinkWhereInput = {
    userPortalCategoryRole: {
      userPortalCategoryId: user.userPortalCategoryId,
    },
    ...(reqQuery.search && {
      marketingLinkName: {
        contains: reqQuery.search,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(reqQuery.status && { status: reqQuery.status as MarketingLinkStatus }),
    ...(reqQuery.startDate && { startDate: { gte: reqQuery.startDate } }),
    ...(reqQuery.endDate && { endDate: { lte: reqQuery.endDate } }),
  };

  // 2️⃣ Execute transaction: fetch links + total count
  const [marketingReports, total] = await prisma.$transaction([
    prisma.marketingLink.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [reqQuery.sortBy || "createdAt"]: reqQuery.sortOrder || "desc",
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    }),
    prisma.marketingLink.count({ where }),
  ]);

  // 3️⃣ Flatten _count into applicationCount + add URL
  // const marketingReports = marketingLinks.map((link) => ({
  //   ...link,
  //   applicationCount: link._count.applications,
  //   _count: undefined,
  //   url: `${process.env.MARKETING_TERGET_URL}?code=${link.code}`,
  // }));

  // 4️⃣ Pagination info
  const totalPages = Math.ceil(total / limit);
  const pagination = {
    count: marketingReports.length,
    total,
    page: reqQuery.page,
    perPage: limit,
    totalPages,
  };

  return {
    marketingReports,
    pagination,
  };
};

/* create Application by market link */
const createApplicationByCode = async (
  data: Prisma.ApplicationCreateInput,
  code: string,
) => {
  // 1. get agent from db using code from params
  const marketLink = await prisma.marketingLink.findUnique({
    where: {
      code: code,
    },
    select: {
      status: true,
      userPortalCategoryRole: {
        select: {
          roleId: true,
          userPortalCategory: {
            select: {
              userId: true,
              portalCategoryId: true,
            },
          },
        },
      },
    },
  });

  // console.log("Market Link Found", marketLink);

  if (!marketLink) {
    throw new AppError(`Agent Not Found`, "NOT_FOUND", 404);
  } else if (marketLink.status === "INACTIVE") {
    throw new AppError(`Agent is Inactive`, "UNAUTHORIZED", 422);
  }

  // 2. get agent use-id, portal-category-id and role-id from agent
  // 3. hit application-management/create-applicant api in the core backend with agent-id, portal-category-id and role-id with application data

  // Configure axios request for proxying to target service
  let axiosCreateApplicationConfig = {
    method: "POST",
    url: `${process.env.TARGET_URL}/application-management`,
    headers: {
      "user-id": marketLink.userPortalCategoryRole.userPortalCategory.userId,
      "portal-category-id":
        marketLink.userPortalCategoryRole.userPortalCategory.portalCategoryId,
      "role-id": marketLink.userPortalCategoryRole.roleId,
      "Content-Type": "application/json",
    },
    data,
  };
  const createRes = await axios(axiosCreateApplicationConfig);

  if (createRes.status !== 200) {
    throw new AppError(
      `Application not created. Error: ${createRes.data.message}`,
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }

  //  5. Update student's status to "PENDING" in student table and Send Email to student
  let axiosUpdateApplicationConfig: AxiosRequestConfig = {
    method: "PATCH",
    url: `${process.env.TARGET_URL}/application-management/${createRes.data.data.application.id}`,
    headers: {
      "user-id": marketLink.userPortalCategoryRole.userPortalCategory.userId,
      "portal-category-id":
        marketLink.userPortalCategoryRole.userPortalCategory.portalCategoryId,
      "role-id": marketLink.userPortalCategoryRole.roleId,
      "Content-Type": "application/json",
    },
    data: {
      status: "PENDING",
    },
  };

  const updateRes = await axios(axiosUpdateApplicationConfig);

  if (updateRes.status !== 200) {
    throw new AppError(
      `Application not updated. Error: ${updateRes.data.message}`,
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }

  // 6. update market-link with application id
  const updatedMarketingLink = await prisma.marketingLink.update({
    where: {
      code: code,
    },
    data: {
      applications: {
        connect: {
          id: createRes.data.data.application.id,
        },
      },
    },
  });

  // const response = axiosRequestConfig;
  return updatedMarketingLink;
};

/* export all marketing link services */
export const MarketingLinkService = {
  createMarketingLink,
  getMarketingLinks,
  getMarketingLinkById,
  updateMarketingLinkById,
  deleteMarketingLinkById,
  getMarketingLinkReports,

  // createApplication by market link
  createApplicationByCode,
};
