import express from "express";
import { asyncWrapper } from "../utils/asyncWrapper";
import { PublicControllers } from "../controllers";
import { uploadPublic } from "../middlewares/multer";
import { manualPaymentRouter } from "../payments/routes";
import { SessionController } from "../modules/session/controllers";
import { RejectApplicationController } from "../student-portal/reject-application/controller";

export const configurePublicRoutes = (app: express.Application) => {
  // Public file upload routes
  // These routes do NOT require authentication headers and are accessible to anyone
  // GET /uploads-public/:fileKey - Retrieve a public file by its key
  // POST /uploads-public - Upload a public file (no authentication required)
  app.get("/uploads-public/:fileKey", asyncWrapper(PublicControllers.getSingleFilePublic));
  app.post("/uploads-public", uploadPublic.single("file"), asyncWrapper(PublicControllers.uploadSingleFilePublic));

  // Public course listing endpoint
  // Retrieves paginated list of available courses based on type (degree, diploma, professional, cpd)
  // GET /api/v1/public/courses?type=DEGREE_COURSE&page=1&pageSize=10
  app.get("/api/v1/public/courses", asyncWrapper(PublicControllers.getCourses));

  // Public course detail endpoint
  // Retrieves detailed information for a specific course by ID
  // GET /api/v1/public/courses/:courseId
  app.get("/api/v1/public/courses/:courseId", asyncWrapper(PublicControllers.getCourseById));

  // Public session, awarding body for session matching &  endpoint
  app.get("/api/v1/public/session", asyncWrapper(SessionController.getSessions));
  app.get(
    "/api/v1/public/session/:sessionId/matching-awarding-bodies",
    asyncWrapper(SessionController.getMatchingAwardingBodiesBySession),
  );
  app.get("/api/v1/public/session/:sessionId/courses", asyncWrapper(SessionController.getSessionCourses));

  // Rejected applications
  app.get(
    "/api/v1/public/reject/applications/:applicationsId",
    asyncWrapper(RejectApplicationController.rejectedApplicationController),
  );

  app.use("/manual", manualPaymentRouter);
};
