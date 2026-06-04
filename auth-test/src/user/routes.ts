import express from "express";
import AuthController, { AuthTempController } from "./controller";
import { asyncWrapper } from "../utils/asyncWrapper";
// import authenticateToken from '../middleware/authMiddleware';
const router = express.Router();

router.post("/register", AuthController.register);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/users", AuthController.getAllUsers);
router.delete("/users/:userId", AuthController.deleteUser);
router.patch("/users/:userId", AuthController.updateUser);
router.patch(
  "/users-status/:userId",
  asyncWrapper(AuthController.updateUserStatus),
);
router.get("/users/:userId", AuthController.getUser);
router.post("/assign/role", asyncWrapper(AuthController.assignRole));
router.post("/assign/portal", AuthController.assignPortal);
router.get("/portal/:userId", AuthController.getUserPortals);
router.post("/roleId", AuthController.getUserRoleData);
router.get("/check-user", AuthController.checkUser);
router.get("/logs", AuthController.getAuditLogs);
router.post("/logs", AuthController.getAuditLogs);

// router.get("/logs/:userId", AuthController.getUserAuditLogs);
router.post("/logs/:userId", AuthController.getUserAuditLogs);
router.put("/logout/:userId", asyncWrapper(AuthController.forceLogoutUser));
router.put("/update/password/:userId/", AuthController.updatePassword);
router.get("/auditlogs", asyncWrapper(AuthController.exportAuditLogsToExcel));
router.post("/filter/user", asyncWrapper(AuthController.filterUser));
router.post("/bulk/download/", asyncWrapper(AuthController.bulkUser));
router.post("/own-profile", AuthController.userProfile);
router.post("/temp-users", asyncWrapper(AuthTempController.tempAllUsers));

export default router;
