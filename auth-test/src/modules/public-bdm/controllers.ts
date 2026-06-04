import { Request, Response } from "express";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { PublicAgentService } from "./services";
import { registerSchema } from "./schemas";
import { zodSafeParse } from "../../utils/zodUtils";

const PublicAgentRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
    const validatedData = zodSafeParse(req.body, registerSchema);
    const newUser = await PublicAgentService.publicAgentregister(validatedData);

    sendSuccessResponse(res, newUser, "User registered successfully");
};

export const PublicBDMController = {
  PublicAgentRegistration,
};