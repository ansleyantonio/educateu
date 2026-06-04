import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { StudentEnrollmentController } from "./controllers";

export const studentEnrollmentRouter = Router();

studentEnrollmentRouter.post("/", asyncWrapper(StudentEnrollmentController.getEnrollments));
studentEnrollmentRouter.post("/migrate", asyncWrapper(StudentEnrollmentController.migrateEnrollments));
