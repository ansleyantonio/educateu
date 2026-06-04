import { Router } from "express";
import { PortalController } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

export const portalsRoutes = Router();

portalsRoutes.get("/", asyncWrapper(PortalController.getPortals));
portalsRoutes.post("/", asyncWrapper(PortalController.createPortal));
portalsRoutes.post(
  "/assign-modules",
  asyncWrapper(PortalController.assignPortalModules),
);
