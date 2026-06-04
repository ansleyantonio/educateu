import { Router } from "express";
import { FacultyControllers } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";
import upload from "../../middlewares/upload";

const facultyRouter = Router();

facultyRouter.get(
  "/courses-list",
  asyncWrapper(FacultyControllers.getFacultyCoursesList)
);

facultyRouter.post(
  "/register",
  asyncWrapper(FacultyControllers.facultyRegister)
);
facultyRouter.get("/", asyncWrapper(FacultyControllers.getAllFaculties));
facultyRouter.get("/:id", asyncWrapper(FacultyControllers.getFacultyById));
facultyRouter.patch("/:id", asyncWrapper(FacultyControllers.updateFacultyById));
facultyRouter.post(
  "/assign-course",
  asyncWrapper(FacultyControllers.assignCourseToFaculty)
);
facultyRouter.patch(
  "/assign-course/:id",
  asyncWrapper(FacultyControllers.updateCourseToFacultyById)
);
facultyRouter.get(
  "/course-modules-list/:id/",
  asyncWrapper(FacultyControllers.getFacultyCoursesByUserId)
);
facultyRouter.get(
  "/courses-modules/:id/",
  asyncWrapper(FacultyControllers.getFacultyCoursesModulesByUserId)
);

export default facultyRouter;
