import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { MarketingLinkController } from "./controllers";

export const marketingLinkRoutes = Router();

marketingLinkRoutes.get(
  "/",
  asyncWrapper(MarketingLinkController.getMarketingLinks),
);

marketingLinkRoutes.post(
  "/",
  asyncWrapper(MarketingLinkController.createMarketingLink),
);

marketingLinkRoutes.get(
  "/reports",
  asyncWrapper(MarketingLinkController.getMarketingLinkReports),
);

marketingLinkRoutes.get(
  "/:id",
  asyncWrapper(MarketingLinkController.getMarketingLinkById),
);

marketingLinkRoutes.patch(
  "/:id",
  asyncWrapper(MarketingLinkController.updateMarketingLinkById),
);

marketingLinkRoutes.delete(
  "/:id",
  asyncWrapper(MarketingLinkController.deleteMarketingLinkById),
);

/* Create Application by market link */
export const applicationManagementRouter = Router();

applicationManagementRouter.post(
  "/create-applicant/:id",
  asyncWrapper(MarketingLinkController.createApplicationByCode),
);
