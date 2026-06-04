import { Response, Request } from "express";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";
import { zodSafeParse } from "../../utils/zodUtils";
import { applicationSchema } from "../../prisma/zodSchema/application";
import { ApplicationService } from "./services";

const createApplication = async (req: Request, res: Response) => {
  const data = zodSafeParse(req.body, applicationSchema);
  const response = await ApplicationService.createApplicationByCode(
    data,
    req.params.id,
  );

  sendSuccessResponse(res, response, "Application created successfully", 200);
};

/* Export all application controllers */
export const ApplicationController = {
  createApplication,
};
