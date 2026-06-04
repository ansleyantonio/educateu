import { RequestWithUser } from "../../types";
import { Response } from "express";
import { additionalFileCheckGetApplicationsReqBodySchema } from "./types";
import { zodSafeParse } from "../../utils/zodUtils";
import { AdditionalFileCheckService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";

const getApplications = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, additionalFileCheckGetApplicationsReqBodySchema);

  const { applications, pagination } = await AdditionalFileCheckService.getApplications(reqBody);

  sendSuccessResponse(res, applications, undefined, undefined, pagination);
};

export const AdditionalFileCheckController = {
  getApplications,
};
