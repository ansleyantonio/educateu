import express from "express";
import portalCategoryController from "./controller";
// import authenticateToken from '../middleware/authMiddleware';
const router = express.Router();

router.get("", portalCategoryController.getPortalCategory);
router.get("/lists", portalCategoryController.getPortalCategoryHistory);

export default router;

