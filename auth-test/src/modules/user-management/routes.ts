import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { UserManagementController } from "./controllers";
import roleRouter from "../role/routes";
import { portalsRoutes } from "../portal/routes";
import { userRouter } from "../user/routes";
import userRouters from "../../user/routes";
import portalRoute from "../../portalCategory/routes";
import authRoutes from "../../auth/routes";
import userModuleRoutes from "../../userModule/routes";

export const userManagementRouter = Router();

// Get users by single module name
userManagementRouter.get(
  "/module/:moduleName/users",
  asyncWrapper(UserManagementController.getUsersByModuleName),
);

// Get users by multiple module names (comma-separated)
userManagementRouter.get(
  "/modules/users",
  asyncWrapper(UserManagementController.getUsersByMultipleModules),
);

// Existing sub-routes
userManagementRouter.use("/roles", roleRouter);
userManagementRouter.use("/portals", portalsRoutes);
userManagementRouter.use("/portal", portalRoute);
userManagementRouter.use("/users", userRouter);
userManagementRouter.use("/user", userRouters);
userManagementRouter.use("/auth", authRoutes);
userManagementRouter.use("/user-modules", userModuleRoutes);

export const userPermissionRouter = Router();
userPermissionRouter.use("", userModuleRoutes);
