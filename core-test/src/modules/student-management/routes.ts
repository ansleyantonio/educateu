import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { StudentManagementController } from "./controllers";

export const studentManagementRouter = Router();

// Student management routes
studentManagementRouter.get("/", asyncWrapper(StudentManagementController.getAllStudents));
studentManagementRouter.post("/", asyncWrapper(StudentManagementController.createStudent));
studentManagementRouter.get("/:studentId", asyncWrapper(StudentManagementController.getStudentById));
studentManagementRouter.patch("/:studentId", asyncWrapper(StudentManagementController.updateStudent));
studentManagementRouter.delete("/:studentId", asyncWrapper(StudentManagementController.deleteStudent));
