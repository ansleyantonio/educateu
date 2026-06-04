import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { PublicBDMController } from "./controllers";

const publicBdmRoutes = Router();

publicBdmRoutes.post("/create", asyncWrapper(PublicBDMController.PublicAgentRegistration));

export default publicBdmRoutes;