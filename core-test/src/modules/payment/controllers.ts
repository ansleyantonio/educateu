/*
 * Payment module controllers
 *
 * This file contains all HTTP request handlers for payment operations including
 * promotional codes, payment records, course fees, and agent commissions.
 * Controllers handle request validation, service calls, and response formatting.
 *
 */

import { z } from "zod";
import { Response } from "express";
import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  PromotionalCodeService,
  PaymentRecordService,
  CourseFeeService,
  AgentCommissionService,
  FinanceSettingService,
} from "./services";
import {
  createPromotionalCodeSchema,
  updatePromotionalCodeSchema,
  createPaymentRecordSchema,
  updatePaymentRecordSchema,
  createPaymentHistorySchema,
  createCertificateCourseFeeSchema,
  updateCourseFeeSchema,
  updateAdvanceCourseFeeSchema,
  createCourseFeeStructureSchema,
  createAgentCommissionSchema,
  updateAgentCommissionSchema,
  createCommissionPaymentSchema,
  createFinanceSettingSchema,
  updateFinanceSettingSchema,
  updateStatusFinanceSettingSchema,
} from "./validation";
import createAuditLog from "../../utils/auditlog";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";

export class FinanceSettingController {
  static async getFinanceSettings(req: RequestWithUser, res: Response) {
    const { page = 1, limit = 10, status, discountType, search } = req.query;

    const filters = {
      paymentStatus: status as string,
      discountType: discountType as string,
      search: search as string,
    };
    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };
    const settings = await FinanceSettingService.getFinanceSettings(filters, pagination);
    // const settings = await FinanceSettingService.getFinanceSettings();
    sendSuccessResponse(res, settings, "Finance settings retrieved successfully");
  }

  static async updateFinanceSettings(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updateFinanceSettingSchema);
    const updatedSettings = await FinanceSettingService.updateFinanceSettings(id, validatedData, req);
    sendSuccessResponse(res, updatedSettings, "Finance settings updated successfully");
  }

  static async updateStatusFinanceSettings(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updateStatusFinanceSettingSchema);
    const updatedSettings = await FinanceSettingService.updateStatusFinanceSettings(validatedData);
    sendSuccessResponse(res, updatedSettings, "Finance settings updated successfully");
  }

  static async createFinanceSettings(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createFinanceSettingSchema);
    const newSettings = await FinanceSettingService.createFinanceSettings(validatedData, req);
    sendSuccessResponse(res, newSettings, "Finance settings created successfully", 201);
  }
}

export class PromotionalCodeController {
  // Get promotional codes with filtering and pagination
  static async getPromotionalCodes(req: RequestWithUser, res: Response) {
    const {
      page = 1,
      limit = 10,
      status,
      codeName,
      discountType,
      startDate,
      endDate,
      createdUserId,
      sessionCourseId,
      search,
    } = req.query;

    const filters = {
      status: status as string,
      codeName: codeName as string,
      discountType: discountType as string,
      startDate: startDate as string,
      endDate: endDate as string,
      createdUserId: createdUserId as string,
      sessionCourseId: sessionCourseId as string,
      search: search as string,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await PromotionalCodeService.getPromotionalCodes(filters, pagination);

    sendSuccessResponse(res, result, "Promotional codes retrieved successfully");
  }

  // Create promotional code
  static async createPromotionalCode(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createPromotionalCodeSchema);

    const result = await PromotionalCodeService.createPromotionalCode(validatedData, req.user!.id);

    sendSuccessResponse(res, result, "Promotional code created successfully", 201);
  }

  // Update promotional code
  static async updatePromotionalCode(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updatePromotionalCodeSchema);

    const result = await PromotionalCodeService.updatePromotionalCode(id, validatedData);

    sendSuccessResponse(res, result, "Promotional code updated successfully");
  }

  // Get promotional code by ID
  static async getPromotionalCodeById(req: RequestWithUser, res: Response) {
    const { id } = req.params;

    const result = await PromotionalCodeService.getPromotionalCodeById(id);

    sendSuccessResponse(res, result, "Promotional code retrieved successfully");
  }

  // Delete promotional code
  static async deletePromotionalCode(req: RequestWithUser, res: Response) {
    const { id } = req.params;

    await PromotionalCodeService.updatePromotionalCode(id, { status: "INACTIVE" });

    sendSuccessResponse(res, null, "Promotional code deleted successfully");
  }
}

export class PaymentRecordController {
  // Get payment records with filtering and pagination
  static async getPaymentRecords(req: RequestWithUser, res: Response) {
    const { page = 1, limit = 10, status, paymentPlan, applicantId, sessionCourseId, dueDate, overdue } = req.query;

    const filters = {
      status: status as string,
      paymentPlan: paymentPlan as string,
      applicantId: applicantId as string,
      sessionCourseId: sessionCourseId as string,
      dueDate: dueDate as string,
      overdue: overdue === "true",
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await PaymentRecordService.getPaymentRecords(filters, pagination);

    sendSuccessResponse(res, result, "Payment records retrieved successfully");
  }

  // Create payment record
  static async createPaymentRecord(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createPaymentRecordSchema);

    const result = await PaymentRecordService.createPaymentRecord(validatedData);

    sendSuccessResponse(res, result, "Payment record created successfully", 201);
  }

  // Update payment record
  static async updatePaymentRecord(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updatePaymentRecordSchema);

    const result = await PaymentRecordService.updatePaymentRecord(id, validatedData);

    sendSuccessResponse(res, result, "Payment record updated successfully");
  }

  // Add payment history entry
  static async addPaymentHistory(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createPaymentHistorySchema);

    const result = await PaymentRecordService.addPaymentHistory(validatedData);

    sendSuccessResponse(res, result, "Payment history added successfully", 201);
  }

  // Get overview statistics for advance payment system
  static async getPaymentOverview(req: RequestWithUser, res: Response) {
    // Mock data for overview - replace with actual calculations 
    const result = await PaymentRecordService.getPaymentOverview();

    sendSuccessResponse(res, result, "Payment overview retrieved successfully");
  }

  // Get payment history by application ID
  static async getPaymentHistoryByApplication(req: RequestWithUser, res: Response) {
    const { applicationId } = req.params;

    if (!applicationId) {
      throw new AppError("Application ID is required", "BAD_REQUEST", 400);
    }

    const result = await PaymentRecordService.getPaymentHistoryByApplicationId(applicationId);

    sendSuccessResponse(res, result, "Payment history retrieved successfully");
  }

  // Get payment history by email address
  static async getPaymentHistoryByEmail(req: RequestWithUser, res: Response) {
    const { email } = req.params;

    if (!email) {
      throw new AppError("Email address is required", "BAD_REQUEST", 400);
    }

    const result = await PaymentRecordService.getPaymentHistoryByEmail(email);

    sendSuccessResponse(res, result, "Payment history retrieved successfully");
  }

  // Delete payment records and payment history by application ID
  static async deletePaymentByApplication(req: RequestWithUser, res: Response) {
    const { applicationId } = req.params;

    if (!applicationId) {
      res.status(400).json({ message: "Application ID is required" });
      return;
    }

    const result = await PaymentRecordService.deletePaymentByApplicationId(applicationId);

    sendSuccessResponse(
      res,
      result,
      `Successfully deleted ${result.deletedPaymentRecords} payment record(s) and ${result.deletedPaymentHistories} payment history entry/entries`,
    );
  }
}

export class CourseFeeController {
  // Get course fees with filtering and pagination

  static async getAllCourseFees(req: RequestWithUser, res: Response) {
    const { page = 1, limit = 10, course, sessionId, status, promoCodeStatus, courseType, search } = req.query;

    const filters = {
      course: course as string,
      sessionId: sessionId as string,
      status: status as string,
      promoCodeStatus: promoCodeStatus as string,
      courseType: courseType as string,
      search: search as string,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await CourseFeeService.getCourseFees(filters, pagination);

    sendSuccessResponse(res, result, "Course fees retrieved successfully");
  }

  static async getDegreeCourseFees(req: RequestWithUser, res: Response) {
    const { page = 1, limit = 10, sessionCourseId, sessionId, status, promoCodeStatus, courseType, search } = req.query;

    const filters = {
      sessionCourseId: sessionCourseId as string,
      sessionId: sessionId as string,
      status: status as string,
      promoCodeStatus: promoCodeStatus as string,
      courseType: "DEGREE_COURSE",
      search: search as string,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await CourseFeeService.getAdvanceCourseFees(filters, pagination);

    sendSuccessResponse(res, result, "Course fees retrieved successfully");
  }

  static async getDiplomaCourseFees(req: RequestWithUser, res: Response) {
    const { page = 1, limit = 10, sessionCourseId, sessionId, status, promoCodeStatus, courseType, search } = req.query;

    const filters = {
      sessionCourseId: sessionCourseId as string,
      sessionId: sessionId as string,
      status: status as string,
      promoCodeStatus: promoCodeStatus as string,
      courseType: "DIPLOMA_COURSE",
      search: search as string,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await CourseFeeService.getAdvanceCourseFees(filters, pagination);

    sendSuccessResponse(res, result, "Course fees retrieved successfully");
  }

  // Create course fee
  static async createCertificateCourseFee(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createCertificateCourseFeeSchema);

    const result = await CourseFeeService.createCertificateCourseFee(validatedData, req);
    const courseName = await prisma.courseFee.findUnique({
      where: {
        id: result.id,
      },
      select: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (req.user) {
      await createAuditLog({
        userId: req.user.id,
        action: `Created course fee for course: ${courseName?.course?.title}`,
        actionType: "payment_management",
        moduleId: result.id,
      });
    }

    sendSuccessResponse(res, result, "Course fee created successfully", 201);
  }

  // Update course fee
  static async updateCourseFee(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updateCourseFeeSchema);

    const result = await CourseFeeService.updateCourseFee(id, validatedData, req);

    const courseName = await prisma.courseFee.findUnique({
      where: {
        id,
      },
      select: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (req.user) {
      await createAuditLog({
        userId: req.user.id,
        action: `Updated course fee for course: ${courseName?.course?.title}`,
        actionType: "payment_management",
        moduleId: id,
      });
    }

    sendSuccessResponse(res, result, "Course fee updated successfully");
  }
  static async updateAdvanceCourseFee(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updateAdvanceCourseFeeSchema);
    const existingCourse = await prisma.courseFee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        overallCourseFee: true,
        sessionCourse: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    const result = await CourseFeeService.updateAdvanceCourseFee(id, validatedData, req);
    if (req.user) {
      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Updated course fee for ${existingCourse?.sessionCourse?.course?.title} course price ${existingCourse?.overallCourseFee} to ${validatedData.overallCourseFee}`,
        actionType: "payment_management",
        moduleId: id || "",
      });
    }

    sendSuccessResponse(res, result, "Course fee updated successfully");
  }

  // Create course fee structure (for degree courses)
  static async createCourseFeeStructure(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createCourseFeeStructureSchema);
    const userId = req.user!.userPortalCategory.userId;

    const result = await CourseFeeService.createCourseFeeStructure(validatedData, userId, req);
    const courseName = await prisma.sessionCourse.findUnique({
      where: {
        id: validatedData.sessionCourseId,
      },
      select: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });
    if (req.user) {
      await createAuditLog({
        userId: req.user.id,
        action: `Created course fee structure for course: ${courseName?.course?.title}`,
        actionType: "payment_management",
        moduleId: result.id,
      });
    }

    sendSuccessResponse(res, result, "Course fee structure created successfully", 201);
  }

  // Get course fee by session and course (for degree course creation page)
  static async getCourseFeeByCourseAndSession(req: RequestWithUser, res: Response) {
    const { courseId } = req.query;

    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }

    // Get course fee with structure
    const courseFee = await CourseFeeService.getCourseFees({ courseId: courseId as string }, { page: 1, limit: 1 });

    if (courseFee.courseList.length === 0) {
      sendSuccessResponse(
        res,
        {
          overallcoursefee: 0,
          agreementStatus: false,
          semesters: [],
        },
        "No course fee found, returning default structure",
      );
      return;
    }

    // Transform to required format
    const result = {
      overallcoursefee: courseFee.courseList[0].overallCourseFee,
      agreementStatus: true, // This would come from the database
      semesters: [], // This would be populated from the course fee structure
    };

    sendSuccessResponse(res, result, "Course fee structure retrieved successfully");
  }
}

export class AgentCommissionController {
  // Get agent commissions (same format as payment records for consistency)
  static async getAgentCommissions(req: RequestWithUser, res: Response) {
    const { page = 1, limit = 10, agentId, status, applicationId, dateFrom, dateTo } = req.query;

    const filters = {
      agentId: agentId as string,
      status: status as string,
      applicationId: applicationId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await AgentCommissionService.getAgentCommissions(filters, pagination);

    sendSuccessResponse(res, result, "Agent commissions retrieved successfully");
  }

  // Get agent overview statistics
  static async getAgentOverview(req: RequestWithUser, res: Response) {
    const result = await AgentCommissionService.getAgentOverview();

    sendSuccessResponse(res, result, "Agent overview retrieved successfully");
  }

  // Create agent commission
  static async createAgentCommission(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createAgentCommissionSchema);

    const result = await AgentCommissionService.createAgentCommission(validatedData);

    sendSuccessResponse(res, result, "Agent commission created successfully", 201);
  }

  // Update agent commission
  static async updateAgentCommission(req: RequestWithUser, res: Response) {
    const { id } = req.params;
    const validatedData = zodSafeParse(req.body, updateAgentCommissionSchema);

    const result = await AgentCommissionService.updateAgentCommission(id, validatedData);

    sendSuccessResponse(res, result, "Agent commission updated successfully");
  }

  // Create commission payment
  static async createCommissionPayment(req: RequestWithUser, res: Response) {
    const validatedData = zodSafeParse(req.body, createCommissionPaymentSchema);

    const result = await AgentCommissionService.createCommissionPayment(validatedData);

    sendSuccessResponse(res, result, "Commission payment created successfully", 201);
  }

  // Get commission payments (same format as payment records)
  static async getCommissionPayments(req: RequestWithUser, res: Response) {
    // For now, use the same method as getAgentCommissions
    return this.getAgentCommissions(req, res);
  }

  // Get pending commission payments with semester information
  static async getPendingCommissionPayments(req: RequestWithUser, res: Response) {
    const { applicationId } = zodSafeParse(req.query, z.object({ applicationId: z.string().uuid() }));

    const result = await AgentCommissionService.getPendingCommissionPayments(applicationId);

    sendSuccessResponse(res, result.data, result.message);
  }
}
