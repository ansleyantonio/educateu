import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { AwardingBody } from "./types";
import { AppError } from "../../utils/AppError";

const getAwardingBodies = async (reqQuery: {
  page: number;
  search?: string;
  pageSize?: number;
  status?: "ACTIVE" | "INACTIVE";
  intakePeriod?: string;
  selectRequiredDocuments?: string;
}) => {
  const { limit, offset } = getPagination(reqQuery.page, reqQuery.pageSize);

  const where: Prisma.AwardingBodyWhereInput = {
    ...(reqQuery.search
      ? {
          OR: [
            {
              name: {
                contains: reqQuery.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },

            {
              abbreviation: {
                contains: reqQuery.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}),
    ...(reqQuery.status ? { status: reqQuery.status } : {}),
    ...(reqQuery.intakePeriod
      ? {
          intakePeriods: {
            array_contains: reqQuery.intakePeriod,
          },
        }
      : {}),
    ...(reqQuery.selectRequiredDocuments
      ? {
          othersInfo: {
            path: ["selectRequiredDocuments"],
            array_contains: reqQuery.selectRequiredDocuments,
          },
        }
      : {}),
  };

  const [rows, count] = await prisma.$transaction([
    prisma.awardingBody.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.awardingBody.count({ where }),
  ]);

  const awardingBodies = rows.map((row) => {
    const { othersInfo, ...rest } = row;
    const info =
      othersInfo && typeof othersInfo === "object" && !Array.isArray(othersInfo)
        ? (othersInfo as Record<string, unknown>)
        : {};
    return { ...rest, ...info };
  });

  return {
    awardingBodies,
    pagination: {
      count: awardingBodies.length,
      total: count,
      page: reqQuery.page,
      perPage: limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const createAwardingBody = async (reqBody: AwardingBody) => {
  const awardingBody = await prisma.awardingBody.create({
    data: {
      name: reqBody.name || "",
      code: reqBody.code || "",
      abbreviation: reqBody.abbreviation || "",
      status: reqBody.status || "ACTIVE",
      intakePeriods: reqBody.intakePeriod || [],
      requiredDocuments: reqBody.selectRequiredDocuments || [],
      othersInfo: {
        grades: reqBody.newGrade || "",
      } satisfies Prisma.InputJsonValue,
    },
  });

  const { othersInfo, intakePeriods, requiredDocuments, ...rest } = awardingBody;
  const info =
    othersInfo && typeof othersInfo === "object" && !Array.isArray(othersInfo)
      ? (othersInfo as Record<string, unknown>)
      : {};

  return { ...rest, intakePeriods, requiredDocuments, ...info };
};

export const updateAwardingBody = async (awardingBodyId: string, reqBody: AwardingBody) => {
  const existing = await prisma.awardingBody.findUnique({ where: { id: awardingBodyId } });
  if (!existing) throw new AppError("AwardingBody not found", "NOT_FOUND", 404);

  const existingOthersInfo =
    existing.othersInfo && typeof existing.othersInfo === "object" && !Array.isArray(existing.othersInfo)
      ? existing.othersInfo
      : {};

  const mergedOthersInfo = {
    ...existingOthersInfo,
    ...(reqBody.newGrade ? { grades: reqBody.newGrade } : {}),
  } satisfies Prisma.InputJsonValue;

  const updated = await prisma.awardingBody.update({
    where: { id: awardingBodyId },
    data: {
      name: reqBody.name || "",
      code: reqBody.code || "",
      abbreviation: reqBody.abbreviation || "",
      status: reqBody.status || "ACTIVE",
      intakePeriods: reqBody.intakePeriod || [],
      requiredDocuments: reqBody.selectRequiredDocuments || [],
      othersInfo: mergedOthersInfo,
    },
  });

  return updated;
};

const getAwardingBodyById = async (awardingBodyId: string) => {
  const awardingBody = await prisma.awardingBody.findUnique({
    where: { id: awardingBodyId },
  });
  if (!awardingBody) throw new AppError("AwardingBody not found", "NOT_FOUND", 404);

  const { othersInfo, ...rest } = awardingBody;
  const info =
    othersInfo && typeof othersInfo === "object" && !Array.isArray(othersInfo)
      ? (othersInfo as Record<string, unknown>)
      : {};
  return { ...rest, ...info };
};

export const AwardingBodyService = {
  getAwardingBodies,
  createAwardingBody,
  updateAwardingBody,
  getAwardingBodyById,
};
