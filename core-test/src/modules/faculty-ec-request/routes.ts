import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { ECRequestController } from "./controllers";

export const facultyEcRequestRouter = Router();

// Get Support Tokens
facultyEcRequestRouter.get("/", asyncWrapper(ECRequestController.getECRequestTickets));

// Resolve EC2 Support Tokens
facultyEcRequestRouter.patch("/resolve", asyncWrapper(ECRequestController.resolveECRequestTicket));

// Reject Support Tokens
facultyEcRequestRouter.patch("/reject", asyncWrapper(ECRequestController.rejectECRequestTicket));
