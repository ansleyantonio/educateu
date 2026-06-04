import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AwardingBodyController } from "./controllers";

export const awardingBodyRouter = Router();

awardingBodyRouter.get("/", asyncWrapper(AwardingBodyController.getAwardingBodies));
awardingBodyRouter.post("/", asyncWrapper(AwardingBodyController.createAwardingBody));
awardingBodyRouter.patch("/:awardingBodyId", asyncWrapper(AwardingBodyController.updateAwardingBody));
awardingBodyRouter.get("/:awardingBodyId", asyncWrapper(AwardingBodyController.getAwardingBodiesById));
