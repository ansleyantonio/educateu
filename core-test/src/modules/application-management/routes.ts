import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
// import { createApplicationController } from "./controllers/createApplicationController";
// import { getApplicationByIdController } from "./controllers/getApplicationByIdController";
// import { getApplicationController } from "./controllers/getApplicationController";
// import { updateApplicationController } from "./controllers/updateApplicationController";
// import { getApplicationByAgentIdController } from "./controllers/getApplicationByAgentIdController";
// import { assignApplicationToAdmissionOfficerController } from "./controllers/assignApplicationToAdmissionOfficerController";
// import { getApplicationByAdmissionOfficerIdController } from "./controllers/getApplicationByAdmissionOfficerIdController";
// import { getApplicationBySubAgentIdController } from "./controllers/getApplicationBySubAgentIdController";
// import { AdmissionOfficerController } from "../admission-officer/controllers";
import { ApplicationController } from "./controllers";
import { AdmissionController } from "../admission/controllers";
import { SessionController } from "../session/controllers";
import { AwardingBodyController } from "../awarding-body/controllers";
import { CourseController } from "../course/controllers";
import { InterviewController } from "../interview/controllers";
// import { RequestWithUser } from "../../types";
// import { AppError } from "../../utils/AppError";

const router = Router();

// router.get("/", asyncWrapper(getApplicationController));
// router.use(
//   "*",
//   asyncWrapper(async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     if (req.user?.role.name !== "AdmissionOfficer") {
//       throw new AppError(`Unauthorized User ${req.user?.role.name}`, "UNAUTHORIZED", 401);
//     }
//     next();
//   }),
// );

router.get("/", asyncWrapper(ApplicationController.getApplications));
router.post("/", asyncWrapper(ApplicationController.createApplication));

router.get("/session", asyncWrapper(SessionController.getSessions));

router.get("/awarding-bodies/:awardingBodyId", asyncWrapper(AwardingBodyController.getAwardingBodiesById));
router.get("/awarding-bodies", asyncWrapper(AwardingBodyController.getAwardingBodies));

// Add route to get student details by email - placed before generic applicationId route
router.get("/students/search-by-email", asyncWrapper(ApplicationController.getStudentByEmail));

router.get("/:applicationId", asyncWrapper(ApplicationController.getApplicationById));
router.patch("/:applicationId", asyncWrapper(ApplicationController.updateApplication));
router.get("/:applicationId/notes", asyncWrapper(ApplicationController.getApplicationById));

router.get("/:applicationId/interviews", asyncWrapper(InterviewController.getInterviewsByApplicationId));

router.get("/bookings/:applicationId", asyncWrapper(AdmissionController.getApplicationBookings));
// Notes routes - Application note creation and retrieval
router.get("/notes/application", asyncWrapper(AdmissionController.getApplicationNotes));
router.post("/notes/application", asyncWrapper(AdmissionController.createApplicationNote));

router.get("/session/:sessionId/courses", asyncWrapper(SessionController.getSessionCourses));
router.get(
  "/session/:sessionId/matching-awarding-bodies",
  asyncWrapper(SessionController.getMatchingAwardingBodiesBySession),
);

// router.post("/assignments", asyncWrapper(ApplicationController.assignApplicationToAdmissionOfficer));
// router.post("/", asyncWrapper(createApplicationController));
// router.get("/admission-officers/:admissionOfficerId", asyncWrapper(getApplicationByAdmissionOfficerIdController));
// router.get("/agents/:agentId", asyncWrapper(getApplicationByAgentIdController));
// router.get("/sub-agents/:subAgentId", asyncWrapper(getApplicationBySubAgentIdController));
// router.get("/:applicationId", asyncWrapper(getApplicationByIdController));
// router.post(
//   "/:applicationId/assignments/admission-officer",
//   asyncWrapper(assignApplicationToAdmissionOfficerController),
// );
// router.patch("/:applicationId", asyncWrapper(updateApplicationController));

router.get("/courses/audit-logs/:courseId", asyncWrapper(CourseController.getAuditLogs));
router.get("/agent-logs/:agentId", asyncWrapper(ApplicationController.getAgentAuditLogs));
export const applicationManagementRouter = router;
