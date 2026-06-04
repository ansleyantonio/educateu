import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { studentSchema, loginSchema } from "./schema";
import { StudentManagementService } from "./services";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { sendRegisterEmail } from "./mail/config";

const getAllStudents = async (req: RequestWithUser, res: Response) => {
  const { page = 1, pageSize = 10, name = "", status = "" } = req.query;

  const parsedPage = parseInt(page as string, 10);
  const parsedPageSize = parseInt(pageSize as string, 10);
  const searchName = name as string;
  const searchStatus = status as string;

  const result = await StudentManagementService.fetchStudents(parsedPage, parsedPageSize, searchName, searchStatus);

  const { data, total, page: currentPage, pageSize: size, totalPages } = result;

  const pagination = {
    count: data.length,
    total,
    page: currentPage,
    perPage: size,
    totalPages,
  };

  sendSuccessResponse(res, data, "Fetched all students successfully", 200, pagination);
};

const createStudent = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, studentSchema);
  const existingStudent = await prisma.student.findFirst({
    where: {
      OR: [{ email: reqBody.email }, { username: reqBody.username }],
    },
  });
  if (existingStudent) throw new AppError("Email or username already exists", "CONFLICT", 409);

  const student = await StudentManagementService.createStudent(reqBody);
  await sendRegisterEmail(
    reqBody.email,
    `${reqBody.firstName} ${reqBody.lastName}`,
    reqBody.password,
    process.env.STUDENT_LOGIN_URL as string,
  );
  sendSuccessResponse(res, student, "Student created successfully");
};

const updateStudent = async (req: RequestWithUser, res: Response) => {
  const { studentId } = req.params;
  const reqBody = zodSafeParse(req.body, studentSchema.partial());
  const student = await StudentManagementService.updateStudent(studentId, reqBody);
  sendSuccessResponse(res, student, "Student updated successfully");
};

const getStudentById = async (req: RequestWithUser, res: Response) => {
  const { studentId } = req.params;
  const student = await StudentManagementService.getStudentById(studentId);
  sendSuccessResponse(res, student, "Student fetched successfully");
};

const deleteStudent = async (req: RequestWithUser, res: Response) => {
  const { studentId } = req.params;
  const student = await StudentManagementService.deleteStudent(studentId);
  sendSuccessResponse(res, student, "Student deleted successfully");
};

export const StudentManagementController = {
  getAllStudents,
  createStudent,
  updateStudent,
  getStudentById,
  deleteStudent,
};
