import { AwardingBodyStatus, Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import axios, { AxiosRequestConfig } from "axios";

const createApplicationByCode = async (
  data: Prisma.ApplicationCreateInput,
  code: string,
) => {
  // 1. get agent from db using code from params
  const marketLink = await prisma.marketingLink.findUnique({
    where: {
      code: code,
    },
  });

  if (!marketLink) {
    throw new AppError(`Unauthorized`, "UNAUTHORIZED", 401);
  }

  // 2. get agent use-id, portal-category-id and role-id from agent
  const agent = await prisma.userPortalCategoryRole.findFirst({
    where: {
      id: marketLink.userPortalCategoryRoleId,
    },
  });

  if (!agent) {
    throw new AppError(`Unauthorized Agent`, "UNAUTHORIZED", 401);
  }

  const portalCategory = await prisma.userPortalCategory.findFirst({
    where: {
      id: agent.userPortalCategoryId,
    },
  });
  if (!portalCategory) {
    throw new AppError(`Unauthorized Portal Category`, "UNAUTHORIZED", 401);
  }

  // 3. hit application-management/create-applicant api in the core backend with agent-id, portal-category-id and role-id with application data

  // Configure axios request for proxying to target service
  // let axiosRequestConfig: AxiosRequestConfig = {
  //   method: "POST",
  //   url: `${process.env.TARGET_URL}/application-management`,
  //   headers: {
  //     "user-id": portalCategory.userId,
  //     "portal-category-id": agent.userPortalCategoryId,
  //     "role-id": agent.roleId,
  //     "Content-Type": "application/json",
  //   },
  //   data,
  // };
  //
  // const response = await axios(axiosRequestConfig);

  // 4. get application id from response
  // const applicationId = response.data?.data?.application?.id;
  const applicationId = "10f528f1-2a6d-42c3-9d5e-141771ca080c";

  if (!applicationId) {
    throw new Error("Application ID not found in response");
  }

  // 5. update market-link with application id

  // const marketLinkUpdate = await prisma.marketingLink.update({
  //   where: {
  //     code: code,
  //   },
  //   data: {
  //     applicationId: applicationId,
  //   },
  // });

  //  const response = axiosRequestConfig;
  return data;
};

export const ApplicationService = {
  createApplicationByCode,
};
