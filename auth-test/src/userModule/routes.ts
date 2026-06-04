import { Router } from "express";
import { UserModuleController } from "./controller";
import upload from "../middlewares/upload";
import { RequestWithUser } from "../types";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();
const userModuleController = new UserModuleController();

router.post("/", asyncWrapper(userModuleController.createUserModules));
router.post("/module", async (req, res) => {
  await userModuleController.createModule(req, res);
});
router.post("/modules/bulk", async (req, res) => {
  await userModuleController.createModulesBulk(req, res);
});
router.get("/module", (req, res) => userModuleController.getModules(req, res));
router.get("/modules/all", (req, res) =>
  userModuleController.getAllModules(req, res),
);
router.get("/modules/unassigned", (req, res) =>
  userModuleController.getModulesNotAssignedToPortal(req, res),
);
router.get("/modules/by-portal", (req, res) =>
  userModuleController.getModulesGroupedByPortal(req, res),
);
router.get("/module/:portalCategoryId", async (req, res) => {
  await userModuleController.getModulePortalCategory(req, res);
});
router.get("/permission/:userId", async (req, res) => {
  await userModuleController.getUserModulesDataByUserId(req, res);
});
router.get("/permission/temporary/:userId", async (req, res) => {
  await userModuleController.getUserModulesTemporaryDataByUserId(req, res);
});
router.get("/:userId", async (req, res) => {
  await userModuleController.getUserModulesByUserId(req, res);
});

router.get("/modulelist/:userId", async (req, res) => {
  await userModuleController.getUserModulesByUserWise(req, res);
});

router.delete(
  "/:userPortalCategoryModuleId",
  userModuleController.deleteUserPortalCategoryModuleById,
);
router.get("/user/details/:userId", async (req, res) => {
  await userModuleController.getUserDetailsWithModules(req, res);
});

router.post(
  "/import/users",
  upload.single("file"),
  async (req: RequestWithUser, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "CSV file is required" });
        return;
      }
      const user = req.user;

      const result = await userModuleController.validateAndInsertCSVUsers(
        req.file,
        user,
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Unexpected error" });
    }
  },
);

export default router;
