import { Router } from "express";
import { RoleController } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

const roleRouter = Router();

roleRouter.get("/", asyncWrapper(RoleController.getRoles));
// roleRouter.get("/:userId", asyncWrapper(RoleController.getRolesPortalByUserId));

roleRouter.post("/", asyncWrapper(RoleController.createRole));

roleRouter.post("/filter-roles", asyncWrapper(RoleController.filterRoles));
roleRouter.patch("/archive/:roleId", asyncWrapper(RoleController.archiveRole));

roleRouter.post(
  "/role-including-permissions",
  asyncWrapper(RoleController.getRoleIncludingPermissions),
);
roleRouter.post("/:roleId", asyncWrapper(RoleController.updateRole));
roleRouter.post(
  "/update-role-modules",
  asyncWrapper(RoleController.updateRoleModules),
);

export default roleRouter;
