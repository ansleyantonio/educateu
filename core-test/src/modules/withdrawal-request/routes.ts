import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { WithdrawalRequestController } from "./controllers";

export const withdrawalRequestRouter = Router();

// Get Withdrawal Request Tickets
withdrawalRequestRouter.get("/", asyncWrapper(WithdrawalRequestController.getWithdrawalRequestTickets));

// Resolve Withdrawal Request Tickets
withdrawalRequestRouter.patch("/resolve", asyncWrapper(WithdrawalRequestController.resolveWithdrawalRequestTicket));

// Reject Withdrawal Request Tickets
withdrawalRequestRouter.patch("/reject", asyncWrapper(WithdrawalRequestController.rejectWithdrawalRequestTicket));
