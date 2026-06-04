import { Response } from "express";

import {
  createBankInfoReqBodySchema,
  updateBankInfoReqBodySchema,
  getBankInfosReqBodySchema,
  bankInfoIdParamSchema,
} from "./schema";
import { RequestWithUser } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { BankInfoService } from "./services";

const createBankInfo = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, createBankInfoReqBodySchema);

  const bankInfo = await BankInfoService.createBankInfo(reqBody);

  sendSuccessResponse(res, bankInfo);
};

const getBankInfos = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.query, getBankInfosReqBodySchema);

  const { bankInfos, pagination } = await BankInfoService.getBankInfos(reqQuery);

  sendSuccessResponse(res, bankInfos, undefined, undefined, pagination);
};

const getBankInfoById = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, bankInfoIdParamSchema);

  const bankInfo = await BankInfoService.getBankInfoById(id);

  sendSuccessResponse(res, bankInfo);
};

const updateBankInfo = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, bankInfoIdParamSchema);
  const reqBody = zodSafeParse(req.body, updateBankInfoReqBodySchema);

  const bankInfo = await BankInfoService.updateBankInfo(id, reqBody);

  sendSuccessResponse(res, bankInfo);
};

const deleteBankInfo = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, bankInfoIdParamSchema);

  await BankInfoService.deleteBankInfo(id);

  sendSuccessResponse(res, { success: true });
};

export const AccountsController = {
  createBankInfo,
  getBankInfos,
  getBankInfoById,
  updateBankInfo,
  deleteBankInfo,
};
