import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { WellbeingController } from "./controllers";

export const wellbeingRouter = Router();

wellbeingRouter.post("/", asyncWrapper(WellbeingController.getApplications));
wellbeingRouter.get("/wellbeing-documents/:applicationId", asyncWrapper(WellbeingController.getWellbeingDocuments));
wellbeingRouter.post(
  "/wellbeing-check-status/:applicationId",
  asyncWrapper(WellbeingController.updateWellbeingCheckStatus),
);
