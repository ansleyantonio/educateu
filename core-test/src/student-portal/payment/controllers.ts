import { Response } from "express";
import { RequestWithUser } from "../../types";
import { AppError } from "../../utils/AppError";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { getStudentDuePayments, getStudentPaymentTransactions, createStudentCheckoutSession } from "./services";
import { zodSafeParse } from "../../utils/zodUtils";
import { createStudentCheckoutSessionSchema, createManualPaymentSchema } from "./schema";
import { createStudentManualPayment as createStudentManualPaymentService } from "./services";
import {
  createStudentCheckoutSessionByCourse as createStudentCheckoutSessionByCourseService,
  createStudentManualPaymentByCourse as createStudentManualPaymentByCourseService,
  getStudentDuePaymentByCourse as getStudentDuePaymentByCourseService,
  getPaymentStats as getPaymentStatsService,
} from "./services";
import {
  createStudentCheckoutSessionByCourseSchema,
  createManualPaymentByCourseSchema,
  getStudentDuePaymentByCourseSchema,
} from "./schema";

export const getAllStudentPayment = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;
  const { page = 1, pageSize = 10 } = req.query;

  const result = await getStudentPaymentTransactions(studentId, Number(page), Number(pageSize));

  sendSuccessResponse(res, result, "Student payments retrieved successfully", 200);
};

export const getDuePayment = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;
  const { page = 1, pageSize = 10 } = req.query;

  // Call the service to get the student's due payments
  const duePayments = await getStudentDuePayments(studentId, Number(page), Number(pageSize));

  sendSuccessResponse(res, duePayments, "Due payments retrieved successfully", 200);
};

export const createStudentPaymentCheckout = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const { applicationId, semesterNo } = zodSafeParse(req.body, createStudentCheckoutSessionSchema);
  const studentId = req.student.id;

  const result = await createStudentCheckoutSession(applicationId, studentId, semesterNo);

  sendSuccessResponse(res, result, "Payment checkout session created successfully", 200);
};

export const createStudentManualPayment = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const paymentData = zodSafeParse(req.body, createManualPaymentSchema);
  const studentId = req.student.id;

  const result = await createStudentManualPaymentService(studentId, paymentData);

  sendSuccessResponse(res, result, "Manual payment recorded successfully", 200);
};

export const createStudentPaymentCheckoutByCourse = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const { courseId, semesterNo } = zodSafeParse(req.body, createStudentCheckoutSessionByCourseSchema);
  const studentId = req.student.id;

  const result = await createStudentCheckoutSessionByCourseService(studentId, courseId, semesterNo);

  sendSuccessResponse(res, result, "Payment checkout session created successfully", 200);
};

export const createStudentManualPaymentByCourse = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const paymentData = zodSafeParse(req.body, createManualPaymentByCourseSchema);
  const studentId = req.student.id;

  const result = await createStudentManualPaymentByCourseService(studentId, paymentData);

  sendSuccessResponse(res, result, "Manual payment recorded successfully", 200);
};

export const getStudentDuePaymentByCourse = async (req: RequestWithUser, res: Response) => {
  const { studentCourseId, semesterNo } = zodSafeParse(req.body, getStudentDuePaymentByCourseSchema);

  const result = await getStudentDuePaymentByCourseService(studentCourseId, semesterNo);

  sendSuccessResponse(res, result, "Due payment retrieved successfully", 200);
};

export const getPaymentStats = async (req: RequestWithUser, res: Response) => {
  if (!req.student) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const studentId = req.student.id;

  const result = await getPaymentStatsService(studentId);

  sendSuccessResponse(res, result, "Payment stats retrieved successfully", 200);
};

export const StudentPaymentController = {
  getAllStudentPayment,
  getDuePayment,
  createStudentPaymentCheckout,
  createStudentManualPayment,
  createStudentPaymentCheckoutByCourse,
  createStudentManualPaymentByCourse,
  getStudentDuePaymentByCourse,
  getPaymentStats,
};
