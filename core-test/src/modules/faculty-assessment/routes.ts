import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import {
  getAssignments,
  getAssignmentSubmissions,
  getSubmissionQuestions,
  getQuestionDetails,
  gradeQuestion,
} from "./controllers";

export const facultyAssessmentRouter = Router();

facultyAssessmentRouter.get("/assignments", asyncWrapper(getAssignments));

facultyAssessmentRouter.get("/assignments/:assessmentId/submissions", asyncWrapper(getAssignmentSubmissions));

facultyAssessmentRouter.get(
  "/assignments/:assessmentId/submissions/:resultId/questions",
  asyncWrapper(getSubmissionQuestions),
);

facultyAssessmentRouter.get(
  "/assignments/:assessmentId/submissions/:resultId/questions/:questionId",
  asyncWrapper(getQuestionDetails),
);

facultyAssessmentRouter.post(
  "/assignments/:assessmentId/submissions/:resultId/questions/:questionId/grade",
  asyncWrapper(gradeQuestion),
);
