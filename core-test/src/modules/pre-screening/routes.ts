import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AdmissionController } from "../admission/controllers";
import { PreScreeningController } from "./controllers";

export const preScreeningRouter = Router();

preScreeningRouter.post("/", asyncWrapper(PreScreeningController.getApplications));
preScreeningRouter.post("/outcome/:applicationId", asyncWrapper(PreScreeningController.setPreScreeningOutcome));
preScreeningRouter.get("/profile/application", asyncWrapper(AdmissionController.getApplicationById));
