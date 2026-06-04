import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { SessionController } from "./controllers";
import { updateSessionStatuses } from "./scheduled-jobs";

export const sessionRouter = Router();

sessionRouter.get("/", asyncWrapper(SessionController.getSessions));
sessionRouter.post("/", asyncWrapper(SessionController.createSession));
sessionRouter.patch("/:sessionId", asyncWrapper(SessionController.updateSession));

// Manual trigger for session status update (useful for testing)
sessionRouter.post("/update-statuses", asyncWrapper(async (req, res) => {
  try {
    const result = await updateSessionStatuses();
    res.json({ message: "Session statuses updated successfully", ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to update session statuses", details: (error as Error).message });
  }
}));

// Session course routes
sessionRouter.post("/:sessionId/assign-course", asyncWrapper(SessionController.assignCourseToSession));
sessionRouter.delete("/:sessionId/unassign-course/:courseId", asyncWrapper(SessionController.unassignCourseFromSession));
sessionRouter.get("/:sessionId/courses", asyncWrapper(SessionController.getSessionCourses));
sessionRouter.patch("/:sessionId/update-course-index", asyncWrapper(SessionController.updateSessionCourseIndex));

// Awarding body matching route
sessionRouter.get("/:sessionId/matching-awarding-bodies", asyncWrapper(SessionController.getMatchingAwardingBodiesBySession));
