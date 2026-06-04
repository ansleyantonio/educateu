import { Router } from "express";
import { AdmissionController } from "../admission/controllers";
import { InterviewController } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

export const interviewRouter = Router();

interviewRouter.get("/", asyncWrapper(InterviewController.getInterviews));
interviewRouter.post("/applications", asyncWrapper(InterviewController.getApplications));
interviewRouter.get("/calender", asyncWrapper(InterviewController.getCalender));
interviewRouter.get("/calender/:applicationId", asyncWrapper(InterviewController.getApplicationCalender));
interviewRouter.get("/applications/:applicationId", asyncWrapper(InterviewController.getInterviewsByApplicationId));
interviewRouter.post("/applications/:applicationId", asyncWrapper(InterviewController.createApplicationInterview));
interviewRouter.get("/interviewer/search", asyncWrapper(InterviewController.searchInterviewer));

interviewRouter.post("/interview-outcome/:applicationId", asyncWrapper(InterviewController.updateInterviewOutcome));
