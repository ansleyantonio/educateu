import { Router } from "express";
import { ApplicationController } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

export const applicationManagementRouter = Router();

applicationManagementRouter.get("/", (req, res) => {
  res.send("Hello World");
});

applicationManagementRouter.post(
  "/create-applicant/:id",
  asyncWrapper(ApplicationController.createApplication),
);
