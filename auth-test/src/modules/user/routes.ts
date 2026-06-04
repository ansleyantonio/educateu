import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { UserController } from "./controllers";

export const userRouter = Router();

userRouter.get(
  "/:userId/assignable-roles",
  asyncWrapper(UserController.getUserAssignableRoles),
);

userRouter.get(
  "/:userId/assigned-roles",
  asyncWrapper(UserController.getUserAssignedRoles),
);
