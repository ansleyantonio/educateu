import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AccountsController } from "./controllers";

// management endpoints
export const bankInfoRouter = Router();

/**
 * CRUD Routes
 */

// CREATE
bankInfoRouter.post("/accounts", asyncWrapper(AccountsController.createBankInfo));

// GET ALL (with pagination & filters)
bankInfoRouter.get("/accounts/list", asyncWrapper(AccountsController.getBankInfos));

// GET BY ID
bankInfoRouter.get("/accounts/:id", asyncWrapper(AccountsController.getBankInfoById));

// UPDATE
bankInfoRouter.put("/accounts/:id", asyncWrapper(AccountsController.updateBankInfo));

// DELETE
bankInfoRouter.delete("/accounts/:id", asyncWrapper(AccountsController.deleteBankInfo));
