import { Prisma, CurrencyType } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { CreateBankInfoRequestBody, UpdateBankInfoRequestBody, GetBankInfosRequestBody } from "./schema";

const createBankInfo = async (reqBody: CreateBankInfoRequestBody) => {
  const data = {
    ...reqBody,
    currencyType: reqBody.currencyType as CurrencyType, // cast to Prisma enum
  };

  return prisma.bankInfo.create({
    data,
  });
};

const getBankInfos = async (reqBody: GetBankInfosRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.BankInfoFindManyArgs["where"] = {
    AND: [
      {
        ...(reqBody.searchTerm && {
          OR: [
            { accountName: { contains: reqBody.searchTerm, mode: "insensitive" } },
            { bankName: { contains: reqBody.searchTerm, mode: "insensitive" } },
            { branchName: { contains: reqBody.searchTerm, mode: "insensitive" } },
            { accountNumber: { contains: reqBody.searchTerm, mode: "insensitive" } },
            { swiftCode: { contains: reqBody.searchTerm, mode: "insensitive" } },
          ],
        }),
        ...(reqBody.currencyType && {
          currencyType: reqBody.currencyType as CurrencyType,
        }),
      },
    ],
  };

  const [bankInfos, count] = await prisma.$transaction([
    prisma.bankInfo.findMany({
      where,
      skip: offset,
      take: limit,
      //   orderBy: { createdAt: "desc" },
    }),
    prisma.bankInfo.count({ where }),
  ]);

  return {
    bankInfos: { bankInfos },
    pagination: {
      count: bankInfos.length,
      total: count,
      page: reqBody.page,
      perPage: limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getBankInfoById = async (id: string) => {
  return prisma.bankInfo.findUniqueOrThrow({
    where: { id },
  });
};

const updateBankInfo = async (id: string, reqBody: UpdateBankInfoRequestBody) => {
  const { currencyType, ...rest } = reqBody;

  const data = {
    ...rest,
    ...(currencyType && { currencyType: { set: currencyType as CurrencyType } }),
  };

  return prisma.bankInfo.update({
    where: { id },
    data,
  });
};

const deleteBankInfo = async (id: string) => {
  return prisma.bankInfo.delete({
    where: { id },
  });
};

export const BankInfoService = {
  createBankInfo,
  getBankInfos,
  getBankInfoById,
  updateBankInfo,
  deleteBankInfo,
};
