/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Payment module service layer
 *
 * This file contains all business logic for payment operations including
 * promotional codes, payment records, course fees, and agent commissions.
 * All database operations and data transformations are handled here.
 *
 */

import { Console } from "node:console";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import createAuditLog from "../../utils/auditlog";
import {
  PromotionalCodeFilters,
  CreatePromotionalCodeData,
  UpdatePromotionalCodeData,
  PaymentRecordFilters,
  CreatePaymentRecordData,
  UpdatePaymentRecordData,
  CreatePaymentHistoryData,
  CourseFeeFilters,
  CreateCourseFeeData,
  AdvanceCourseFeeFilters,
  CreateCertificateCourseFeeData,
  UpdateCourseFeeData,
  UpdateAdvanceCourseFeeData,
  CreateCourseFeeStructureData,
  AgentCommissionFilters,
  CreateAgentCommissionData,
  UpdateAgentCommissionData,
  CreateCommissionPaymentData,
  PaginationParams,
  CreateFinanceSettingsData,
  UpdateFinanceSettingsData,
  UpdateSettingsFinanceSettingsData,
  FinanceSettingsFilters,
  PendingCommissionPaymentResponse,
} from "./types";

// Helper function to format changes for audit log
function formatChangesForAudit(changedFields: Record<string, any>, existingData: Record<string, any>): string {
  const changes = Object.keys(changedFields).map((key) => {
    const oldValue = existingData[key] ?? "null";
    const newValue = changedFields[key] ?? "null";
    return `${key}: ${oldValue} → ${newValue}`;
  });

  return changes.join(", ");
}
// Helper function to format value for display (handles dates)
function formatValueForDisplay(value: any): string {
  if (value === null || value === undefined) {
    return "null";
  }

  // Check if it's a Date object
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Check if it's an ISO date string
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return String(value);
}

export class FinanceSettingService {
  static async createFinanceSettings(data: CreateFinanceSettingsData, req: any) {
    const result = await prisma.$transaction(async (tx) => {
      // Create finance settings
      const financeSetting = await tx.financeSettings.create({
        data: {
          discountName: data.discountName || "",
          discountType: data.discountType || "",
          discountValue: data.discountValue || 0,
          subjectEmail: data.subjectEmail || "",
          templateEmail: data.templateEmail || "",
          subjectPayment: data.subjectPayment || "",
          templatePayment: data.templatePayment || "",
          subjectReminder: data.subjectReminder || "",
          templateReminder: data.templateReminder || "",
          subjectInvoice: data.subjectInvoice || "",
          templateInvoice: data.templateInvoice || "",
          autoReminder: data.autoReminder || true,
          courseId: data.courseId || "",
          frequency: data.frequency || "ONCE",
        },
      });

      // Create audit log for creation
      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Created finance settings: ${financeSetting.discountName}`,
        actionType: "payment_management",
        moduleName: "payment_management",
        courseId: financeSetting.id,
      });

      return financeSetting;
    });

    return result;
  }

  static async getFinanceSettings(filters: FinanceSettingsFilters, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause properly
    const whereClause: any = {};

    // Add filters only if they have values - these work with AND logic
    if (filters.paymentStatus) {
      whereClause.paymentStatus = filters.paymentStatus;
    }

    if (filters.discountType) {
      whereClause.discountType = filters.discountType;
    }

    // Handle search with OR logic, but keep it within the AND context
    if (filters.search) {
      whereClause.OR = [
        { discountName: { contains: filters.search, mode: "insensitive" } },
        {
          course: {
            title: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    try {
      const [financeSettings, total] = await Promise.all([
        prisma.financeSettings.findMany({
          where: whereClause,
          include: {
            course: {
              include: {
                sessionCourses: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.financeSettings.count({ where: whereClause }),
      ]);

      return {
        data: financeSettings,
        pagination: {
          count: financeSettings.length,
          total,
          page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching finance settings:", error);
      throw new Error("Failed to fetch finance settings");
    }
  }
  // static async getFinanceSettings() {
  //   return await prisma.financeSettings.findMany({
  //     include: {
  //       course: {
  //         include: {
  //           sessionCourses: true,
  //         }
  //       }, // Includes the related User record
  //     },
  //   });
  // }

  static async updateStatusFinanceSettings(data: UpdateSettingsFinanceSettingsData) {
    const existingCode = await prisma.financeSettings.findUnique({
      where: { id: data.id },
    });

    if (!existingCode) {
      throw new AppError("financeSettings code not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update promotional code
      const updatedCode = await tx.financeSettings.update({
        where: { id: data.id },
        data: {
          published: data.status || "ACTIVE",
        },
      });

      return updatedCode;
    });

    return result;
  }

  static async updateFinanceSettings(id: string, data: UpdateFinanceSettingsData, req: any) {
    const existingSettings = await prisma.financeSettings.findUnique({
      where: { id },
    });

    if (!existingSettings) {
      throw new AppError("Finance settings not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Build update data only with provided fields
      const updateData: any = {};
      const changedFields: any = {};

      if (data.discountName !== undefined) updateData.discountName = data.discountName;
      if (data.discountType !== undefined) updateData.discountType = data.discountType;
      if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
      if (data.subjectEmail !== undefined) updateData.subjectEmail = data.subjectEmail;
      if (data.templateEmail !== undefined) updateData.templateEmail = data.templateEmail;
      if (data.subjectPayment !== undefined) updateData.subjectPayment = data.subjectPayment;
      if (data.templatePayment !== undefined) updateData.templatePayment = data.templatePayment;
      if (data.subjectReminder !== undefined) updateData.subjectReminder = data.subjectReminder;
      if (data.templateReminder !== undefined) updateData.templateReminder = data.templateReminder;
      if (data.subjectInvoice !== undefined) updateData.subjectInvoice = data.subjectInvoice;
      if (data.templateInvoice !== undefined) updateData.templateInvoice = data.templateInvoice;
      if (data.autoReminder !== undefined) updateData.autoReminder = data.autoReminder;
      if (data.courseId !== undefined) updateData.courseId = data.courseId;
      if (data.frequency !== undefined) updateData.frequency = data.frequency;
      if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;

      // Track only actually changed fields
      Object.keys(updateData).forEach((key) => {
        const existingValue = existingSettings[key as keyof typeof existingSettings];
        const newValue = updateData[key];

        // For date comparisons, convert both to timestamps
        if (existingValue instanceof Date && newValue instanceof Date) {
          if (existingValue.getTime() !== newValue.getTime()) {
            changedFields[key] = updateData[key];
          }
        } else if (
          typeof existingValue === "string" &&
          typeof newValue === "string" &&
          /^\d{4}-\d{2}-\d{2}/.test(existingValue) &&
          /^\d{4}-\d{2}-\d{2}/.test(newValue)
        ) {
          // Compare ISO date strings
          if (new Date(existingValue).getTime() !== new Date(newValue).getTime()) {
            changedFields[key] = updateData[key];
          }
        } else if (existingValue !== newValue) {
          changedFields[key] = updateData[key];
        }
      });

      // Only update if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        await tx.financeSettings.update({
          where: { id },
          data: changedFields,
        });

        // Create audit log
        const changesSummary = formatChangesForAudit(changedFields, existingSettings);

        await createAuditLog({
          userId: req.user?.userPortalCategory?.userId || "",
          action: `Updated finance settings: ${changesSummary}`,
          actionType: "payment_management",
          moduleName: "payment_management",
          courseId: id,
        });
      }

      // Build response with only changed fields
      const response: any = {
        id,
        ...changedFields,
      };

      // If nothing changed, return a message
      if (Object.keys(changedFields).length === 0) {
        return {
          id,
          message: "No changes detected",
        };
      }

      return response;
    });

    return result;
  }
}

export class PromotionalCodeService {
  // Get promotional codes with filtering and pagination
  static async getPromotionalCodes(filters: PromotionalCodeFilters, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.codeName) {
      whereClause.codeName = { contains: filters.codeName, mode: "insensitive" };
    }
    if (filters.discountType) {
      whereClause.discountType = filters.discountType;
    }
    if (filters.createdUserId) {
      whereClause.createdUserId = filters.createdUserId;
    }
    if (filters.startDate) {
      whereClause.startDate = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      whereClause.endDate = { lte: new Date(filters.endDate) };
    }

    if (filters.search) {
      const search = filters.search.toUpperCase();

      const validStatuses = ["ACTIVE", "INACTIVE"];
      const validDiscountTypes = ["PERCENTAGE", "FIXED_AMOUNT", "CDP"];

      whereClause.OR = [
        { codeName: { contains: filters.search, mode: "insensitive" } },
        ...(validDiscountTypes.includes(search) ? [{ discountType: search }] : []),
        ...(validStatuses.includes(search) ? [{ status: search }] : []),
      ];
    }

    const [promotionalCodes, total] = await Promise.all([
      prisma.promotionalCode.findMany({
        where: whereClause,
        include: {
          promotionalCodeCourses: {
            include: {
              course: {
                select: {
                  title: true,
                  courseType: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.promotionalCode.count({ where: whereClause }),
    ]);

    const transformedData = promotionalCodes.map((promo) => ({
      id: promo.id,
      codeName: promo.codeName,
      discountValue: promo.discountValue,
      startDate: promo.startDate.toISOString().split("T")[0],
      endDate: promo.endDate?.toISOString().split("T")[0],
      createdUser: "System",
      discountType: promo.discountType,
      status: promo.status,
      createdAt: promo.createdAt.toISOString().split("T")[0],
      updatedAt: promo.updatedAt.toISOString().split("T")[0],
      usageCount: promo.usageCount,
      maxUsage: promo.maxUsage,
      courseList: promo.promotionalCodeCourses.map((pcc) => ({
        courseType: pcc.course?.courseType || "N/A",
        courseName: pcc.course?.title || "Unnamed Course",
        startDate: pcc.course?.startDate?.toISOString().split("T")[0] || "",
        endDate: pcc.course?.endDate?.toISOString().split("T")[0] || "",
      })),
    }));

    return {
      promotionalCodes: transformedData,
      pagination: {
        count: promotionalCodes.length,
        total,
        page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create a new promotional code
  static async createPromotionalCode(data: CreatePromotionalCodeData, userId: string) {
    // Check if code name already exists
    const existingCode = await prisma.promotionalCode.findUnique({
      where: { codeName: data.codeName },
    });

    if (existingCode) {
      throw new AppError("Promotional code name already exists", "DUPLICATE_CODE", 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create promotional code
      const promotionalCode = await tx.promotionalCode.create({
        data: {
          codeName: data.codeName,
          discountType: data.discountType,
          discountValue: data.discountValue,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          maxUsage: data.maxUsage,
        },
      });

      // Create course associations if provided
      if (data.courseIds && data.courseIds.length > 0) {
        await tx.promotionalCodeCourse.createMany({
          data: data.courseIds.map((courseId) => ({
            promotionalCodeId: promotionalCode.id,
            sessionCourseId: courseId,
          })),
        });
      }

      return promotionalCode;
    });

    return result;
  }

  // Update promotional code
  static async updatePromotionalCode(id: string, data: UpdatePromotionalCodeData) {
    const existingCode = await prisma.promotionalCode.findUnique({
      where: { id },
    });

    if (!existingCode) {
      throw new AppError("Promotional code not found", "NOT_FOUND", 404);
    }

    // Check if codeName is being changed and if it already exists
    if (data.codeName && data.codeName !== existingCode.codeName) {
      const duplicateCode = await prisma.promotionalCode.findUnique({
        where: { codeName: data.codeName },
      });
      if (duplicateCode) {
        throw new AppError("Promotional code name already exists", "DUPLICATE_CODE", 409);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update promotional code
      const updatedCode = await tx.promotionalCode.update({
        where: { id },
        data: {
          codeName: data.codeName,
          discountType: data.discountType,
          discountValue: data.discountValue,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          maxUsage: data.maxUsage,
        },
      });

      // Update course associations if provided
      if (data.courseIds) {
        // Delete existing associations
        await tx.promotionalCodeCourse.deleteMany({
          where: { promotionalCodeId: id },
        });

        // Create new associations
        if (data.courseIds.length > 0) {
          await tx.promotionalCodeCourse.createMany({
            data: data.courseIds.map((courseId) => ({
              promotionalCodeId: id,
              sessionCourseId: courseId,
            })),
          });
        }
      }

      return updatedCode;
    });

    return result;
  }

  // Get promotional code by ID
  static async getPromotionalCodeById(id: string) {
    const promotionalCode = await prisma.promotionalCode.findUnique({
      where: { id },
      include: {
        promotionalCodeCourses: {
          include: {
            sessionCourse: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    courseType: true,
                    startDate: true,
                    endDate: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!promotionalCode) {
      throw new AppError("Promotional code not found", "NOT_FOUND", 404);
    }

    return promotionalCode;
  }
}

export class PaymentRecordService {
  // Get payment records with filtering and pagination
  static async getPaymentRecords(filters: PaymentRecordFilters, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.status) {
      whereClause.paymentStatus = filters.status;
    }
    if (filters.paymentPlan) {
      whereClause.paymentPlan = filters.paymentPlan;
    }
    if (filters.applicantId) {
      whereClause.applicantId = filters.applicantId;
    }
    if (filters.overdue) {
      whereClause.paymentStatus = "OVERDUE";
    }
    if (filters.dueDate) {
      whereClause.dueDate = {
        gte: new Date(filters.dueDate),
        lt: new Date(new Date(filters.dueDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const [paymentRecords, total] = await Promise.all([
      prisma.paymentRecord.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              personalInformation: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              courseSelection: {
                include: {
                  course: {
                    include: {
                      course: {
                        select: {
                          title: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          paymentHistories: {
            orderBy: { paymentDate: "desc" },
          },
          promotionalCode: {
            select: {
              codeName: true,
              discountValue: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.paymentRecord.count({ where: whereClause }),
    ]);

    const transformedData = paymentRecords.map((record, index) => ({
      id: skip + index + 1,
      applicantId: record.applicantId,
      firstName: record.application.personalInformation?.firstName || "N/A",
      lastName: record.application.personalInformation?.lastName || "N/A",
      email: record.application.personalInformation?.email || "N/A",
      course: record.application.courseSelection?.course?.course?.title || "N/A",
      paymentPlan: record.paymentPlan === "FULL_PAYMENT" ? "Full Payment" : "Installment",
      paymentStatus:
        record.paymentStatus === "PENDING"
          ? "Pending"
          : record.paymentStatus === "PAID"
            ? "Paid"
            : record.paymentStatus === "OVERDUE"
              ? "Overdue"
              : record.paymentStatus,
      dueDate: record.dueDate?.toISOString().split("T")[0] || "",
      lastReminder: record.lastReminderDate?.toISOString().split("T")[0] || "",
      totalFee: record.totalFee,
      paidAmount: record.paidAmount,
      installmentsPaid: record.installmentsPaid,
      nextPayment:
        record.paymentStatus !== "PAID" &&
        (record.nextPaymentDate || record.dueDate) &&
        (record.paymentPlan === "FULL_PAYMENT"
          ? record.totalFee - record.paidAmount
          : record.nextPaymentAmount || record.totalFee - record.paidAmount) > 0
          ? {
              date: (record.nextPaymentDate || record.dueDate)?.toISOString().split("T")[0],
              amount:
                record.paymentPlan === "FULL_PAYMENT"
                  ? record.totalFee - record.paidAmount
                  : record.nextPaymentAmount || record.totalFee - record.paidAmount,
            }
          : null,
      paymentHistory: record.paymentHistories
        .filter((history) => history.amount > 0)
        .map((history) => ({
          date: history.paymentDate.toISOString().split("T")[0],
          amount: history.amount,
          method: history.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : history.paymentMethod,
          status:
            history.status === "PAID"
              ? "Paid"
              : history.status === "PENDING"
                ? "Pending"
                : history.status === "APPROVED"
                  ? "Approved"
                  : history.status === "REJECTED"
                    ? "Rejected"
                    : history.status,
        })),
    }));

    return {
      data: transformedData,
      pagination: {
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        pageSize: limit,
        from: skip + 1,
        to: Math.min(skip + limit, total),
      },
    };
  }

  // Create payment record
  static async createPaymentRecord(data: CreatePaymentRecordData) {
    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: data.applicantId },
    });

    if (!application) {
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    // Verify promotional code if provided
    if (data.promotionalCodeId) {
      const promoCode = await prisma.promotionalCode.findUnique({
        where: { id: data.promotionalCodeId },
      });
      if (!promoCode) {
        throw new AppError("Promotional code not found", "NOT_FOUND", 404);
      }
    }

    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        applicantId: data.applicantId,
        totalFee: data.totalFee,
        remainingAmount: data.totalFee,
        paymentPlan: data.paymentPlan,
        totalInstallments: data.totalInstallments,
        nextPaymentDate: data.nextPaymentDate,
        nextPaymentAmount: data.nextPaymentAmount,
        dueDate: data.dueDate,
        promotionalCodeId: data.promotionalCodeId,
      },
    });

    return paymentRecord;
  }

  // Update payment record
  static async updatePaymentRecord(id: string, data: UpdatePaymentRecordData) {
    const existingRecord = await prisma.paymentRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new AppError("Payment record not found", "NOT_FOUND", 404);
    }

    const updatedRecord = await prisma.paymentRecord.update({
      where: { id },
      data,
    });

    return updatedRecord;
  }

  // Add payment history entry
  static async addPaymentHistory(data: CreatePaymentHistoryData) {
    // Verify payment record exists
    const paymentRecord = await prisma.paymentRecord.findUnique({
      where: { id: data.paymentRecordId },
    });

    if (!paymentRecord) {
      throw new AppError("Payment record not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create payment history entry
      const paymentHistory = await tx.paymentHistory.create({
        data,
      });

      // Update payment record if payment is successful
      if (data.status === "PAID" || data.status === "APPROVED") {
        const newPaidAmount = paymentRecord.paidAmount + data.amount;
        const newRemainingAmount = paymentRecord.totalFee - newPaidAmount;
        const newInstallmentsPaid = paymentRecord.installmentsPaid + 1;

        await tx.paymentRecord.update({
          where: { id: data.paymentRecordId },
          data: {
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            installmentsPaid: newInstallmentsPaid,
            paymentStatus: newRemainingAmount <= 0 ? "PAID" : "PENDING",
          },
        });
      }

      return paymentHistory;
    });

    return result;
  }

  // Get payment history by application ID with semester-wise breakdown
  static async getPaymentHistoryByApplicationId(applicationId: string) {
    // Find ALL payment records for this application
    const paymentRecords = await prisma.paymentRecord.findMany({
      where: { applicantId: applicationId },
      include: {
        paymentHistories: {
          orderBy: { paymentDate: "desc" },
        },
        application: {
          include: {
            courseSelection: {
              include: {
                course: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Consolidate all payment histories from all payment records
    const allPaymentHistories = paymentRecords.flatMap((pr) => pr.paymentHistories);

    // Get course fee structure with semesters - try to find it even if no payment records exist
    let course = null;
    if (paymentRecords.length > 0) {
      const sessionCourse = paymentRecords[0].application?.courseSelection?.course;
      course = sessionCourse?.course;
    }

    // If no course from payment records, try to get it from application directly
    if (!course) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          courseSelection: {
            include: {
              course: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });
      if (application?.courseSelection?.course) {
        const sessionCourse = application.courseSelection.course;
        course = sessionCourse.course;
      }
    }

    let semesters: any[] = [];
    if (course) {
      // First try to find course fee by courseId
      const courseFeeWithStructure = await prisma.courseFee.findFirst({
        where: { courseId: course.id },
        include: {
          courseFeeStructure: {
            include: {
              semesters: {
                orderBy: { semesterOrder: "asc" },
              },
            },
          },
        },
      });

      // If not found by courseId, try sessionCourseId
      if (!courseFeeWithStructure) {
        const sessionCourses = await prisma.sessionCourse.findMany({
          where: { courseId: course.id },
        });

        for (const sc of sessionCourses) {
          const courseFeeBySession = await prisma.courseFee.findFirst({
            where: { sessionCourseId: sc.id },
            include: {
              courseFeeStructure: {
                include: {
                  semesters: {
                    orderBy: { semesterOrder: "asc" },
                  },
                },
              },
            },
          });
          if (courseFeeBySession?.courseFeeStructure) {
            semesters = courseFeeBySession.courseFeeStructure.semesters;
            break;
          }
        }
      } else {
        semesters = courseFeeWithStructure?.courseFeeStructure?.semesters || [];
      }
    }

    // If no semester structure exists, return payment histories directly
    if (semesters.length === 0) {
      // Return all payment records with their histories
      return paymentRecords.map((pr) => ({
        paymentRecordId: pr.id,
        applicantId: pr.applicantId,
        totalFee: pr.totalFee,
        paidAmount: pr.paidAmount,
        remainingAmount: pr.remainingAmount,
        paymentPlan: pr.paymentPlan,
        paymentStatus: pr.paymentStatus,
        // paymentMethod: pr.paymentMethod,
        paymentHistories: pr.paymentHistories.map((ph: any) => ({
          id: ph.id,
          paymentRecordId: ph.paymentRecordId,
          amount: ph.amount,
          paymentMethod: ph.paymentMethod,
          status: ph.status,
          paymentDate: ph.paymentDate,
          transactionId: ph.transactionId,
          reference: ph.reference,
          notes: ph.notes,
          bank_account_number: ph.bank_account_number,
          bank_account_name: ph.bank_account_name,
          bank_name: ph.bank_name,
          bank_swift_code: ph.bank_swift_code,
          bank_branch: ph.bank_branch,
          receipt_url: ph.receipt_url || "",
        })),
      }));
    }

    // let remainingPaid = paidAmount;

    const validPayments = allPaymentHistories
      .filter((ph) => ph.status === "PAID" || ph.status === "APPROVED")
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())
      .map((ph) => ({
        ...ph,
        remaining: ph.amount,
      }));

    // Map payment histories to semesters - show ALL semesters (paid and unpaid)
    const semesterWisePayments = semesters.map((semester: any) => {
      // Find payment histories that match this semester's fee
      // const matchingPayments = allPaymentHistories.filter(
      //   (ph: any) => Math.abs(ph.amount - semester.semesterFee) < 0.01,
      // );

      // const paidPayments = matchingPayments.filter((ph: any) => ph.status === "PAID" || ph.status === "APPROVED");
      // const isPaid = paidPayments.length > 0;
      // const totalPaid = paidPayments.reduce((sum: number, ph: any) => sum + ph.amount, 0);
      // const allocated = Math.min(
      //   remainingPaid,
      //   semester.semesterFee
      // );

      // remainingPaid -= allocated;
      let need = semester.semesterFee;
      const histories = [];
      let totalPaid = 0;

      for (const payment of validPayments) {
        if (need <= 0) break;
        if (payment.remaining <= 0) continue;

        const used = Math.min(payment.remaining, need);

        payment.remaining -= used;
        need -= used;
        totalPaid += used;

        histories.push({
          id: payment.id,
          amount: used,
          originalAmount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          paymentDate: payment.paymentDate,
          transactionId: payment.transactionId,
          reference: payment.reference,
          notes: payment.notes,
          receipt_url: payment.receipt_url || "",
        });
      }

      return {
        semesterOrder: semester.semesterOrder,
        semesterName: semester.semesterName,
        semesterFee: semester.semesterFee,
        // isPaid,
        // isPaid: allocated >= semester.semesterFee,
        isPaid: need <= 0,
        totalPaid,
        // remainingAmount: semester.semesterFee - totalPaid,
        remainingAmount: need,
        paymentHistory: histories,
        // paymentHistory: matchingPayments.map((ph: any) => ({
        //   id: ph.id,
        //   amount: ph.amount,
        //   paymentMethod: ph.paymentMethod,
        //   status: ph.status,
        //   paymentDate: ph.paymentDate,
        //   transactionId: ph.transactionId,
        //   reference: ph.reference,
        //   notes: ph.notes,
        //   receipt_url: ph.receipt_url || "",
        // })),
      };
    });

    return semesterWisePayments;
  }

  // Get payment history by email address
  static async getPaymentHistoryByEmail(email: string) {
    // Find applications by email through personalInformation
    const applications = await prisma.application.findMany({
      where: {
        personalInformation: {
          email: { equals: email, mode: "insensitive" },
        },
      },
      select: {
        id: true,
      },
    });

    if (applications.length === 0) {
      throw new AppError("No applications found for this email address", "NOT_FOUND", 404);
    }

    const applicationIds = applications.map((app) => app.id);

    // Find all payment records for these applications
    const paymentRecords = await prisma.paymentRecord.findMany({
      where: {
        applicantId: { in: applicationIds },
      },
      include: {
        paymentHistories: {
          orderBy: { paymentDate: "desc" },
        },
        application: {
          include: {
            personalInformation: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            courseSelection: {
              include: {
                course: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (paymentRecords.length === 0) {
      throw new AppError("No payment records found for this email address", "NOT_FOUND", 404);
    }

    // Consolidate all payment histories from all payment records into a flat list
    const allPayments = paymentRecords.flatMap((pr) =>
      pr.paymentHistories.map((ph: any) => ({
        id: ph.id,
        amount: ph.amount,
        paymentDate: ph.paymentDate.toISOString().split("T")[0],
        paymentMethod: ph.paymentMethod,
        status: ph.status,
        reference: ph.reference,
        notes: ph.notes,
        transactionId: ph.transactionId,
      })),
    );

    // Calculate total paid
    const totalPaid = allPayments
      .filter((p) => p.status === "PAID" || p.status === "APPROVED")
      .reduce((sum, p) => sum + p.amount, 0);

    const applicantName =
      `${paymentRecords[0].application.personalInformation?.firstName || ""} ${paymentRecords[0].application.personalInformation?.lastName || ""}`.trim();

    // Format payments as simple strings
    const paymentMessages = allPayments.map((p) => `${applicantName} paid ${p.amount} on ${p.paymentDate}`);

    return {
      email,
      applicantName,
      totalPaid,
      payments: paymentMessages,
    };
  }

  // Delete payment records and payment history by application ID
  static async deletePaymentByApplicationId(applicationId: string) {
    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find all payment records for this application
      const paymentRecords = await tx.paymentRecord.findMany({
        where: { applicantId: applicationId },
        include: {
          paymentHistories: true,
        },
      });

      if (paymentRecords.length === 0) {
        throw new AppError("No payment records found for this application", "NOT_FOUND", 404);
      }

      const paymentRecordIds = paymentRecords.map((pr) => pr.id);

      // Count payment histories that will be deleted
      const paymentHistoryCount = paymentRecords.reduce((sum, pr) => sum + pr.paymentHistories.length, 0);

      // Delete payment records (payment histories will be cascade deleted)
      await tx.paymentRecord.deleteMany({
        where: { applicantId: applicationId },
      });

      return {
        deletedPaymentRecords: paymentRecordIds.length,
        deletedPaymentHistories: paymentHistoryCount,
      };
    });

    return result;
  }

  static async getPaymentOverview() {
    const [totalFee, remaininAmount, totalPaid, totalInstallmentAmount] = await Promise.all([
      prisma.paymentRecord.aggregate({
        _sum: { totalFee: true },
      }),
      prisma.paymentRecord.aggregate({
        _sum: { remainingAmount: true },
      }),
      prisma.paymentRecord.aggregate({
        _sum: { paidAmount: true },
      }),
      prisma.paymentHistory.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),
    ]);

    const totalFeeAmount = totalFee._sum.totalFee || 0;
    const totalPaidAmount = totalPaid._sum.paidAmount || 0;
    const totalInstallmentPaidAmount = totalInstallmentAmount._sum.amount || 0;
    const totalRemainingAmount = remaininAmount._sum.remainingAmount || 0;

    const paidPercentage = totalFeeAmount ? ((totalPaidAmount / totalFeeAmount) * 100).toFixed(2) : "0";

    const installmentPercentage = totalFeeAmount
      ? ((totalInstallmentPaidAmount / totalFeeAmount) * 100).toFixed(2)
      : "0";

    return {
      totalFeeAmount,
      totalPaidAmount,
      totalInstallmentPaidAmount,
      totalRemainingAmount,
      paidPercentage: `${paidPercentage}%`,
      installmentPercentage: `${installmentPercentage}%`,
    };
  }
}

export class CourseFeeService {
  // Get course fees with filtering and pagination
  static async getCourseFees(filters: CourseFeeFilters, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      // sessionCourse: {
      course: {
        courseType: filters.courseType,
      },
    };
    // };

    // if (filters.sessionCourseId) {
    //   whereClause.sessionCourseId = filters.sessionCourseId;
    // }
    if (filters.search) {
      whereClause.course = {
        title: { contains: filters.search, mode: "insensitive" },
      };
    }
    if (filters.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.promoCodeStatus) {
      whereClause.promoCodeStatus = filters.promoCodeStatus;
    }

    const [courseFees, total] = await Promise.all([
      prisma.courseFee.findMany({
        where: whereClause,
        include: {
          course: {
            include: {
              promotionalCodeCourses: {
                include: {
                  promotionalCode: true,
                },
              },
            },
          },
          // sessionCourse: {
          //   include: {
          //     course: true,
          //     promotionalCodeCourses: {
          //       include: {
          //         promotionalCode: true,
          //       }
          //     }
          //     },
          // },
          // tieredPricings: {
          //   orderBy: { startDate: "asc" },
          // },
          courseFeeLog: {
            orderBy: { createdAt: "desc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.courseFee.count({ where: whereClause }),
    ]);

    const transformedData = courseFees.map((fee) => ({
      id: fee.id,
      courseId: fee.course?.id,
      courseName: fee.course?.title,
      overallCourseFee: fee.overallCourseFee,
      // courseFeeLogHistory: fee.courseFeeLog.map((log) => ({
      //   fieldName: log.fieldName,
      //   oldValue: log.oldValue,
      //   newValue: log.newValue,
      //   changeReason: log.changeReason,
      //   changedBy: "System User",
      //   createdAt: log.createdAt.toISOString(),
      // })),
      scheduleType: fee.scheduleType,
      effectiveDate: fee.effectiveDate?.toISOString().split("T")[0] || null,
      newCourseFee: fee.newCourseFee,
      scheduleFrequency: fee.scheduleFrequency,
      promotionalCodes: fee.course?.promotionalCodeCourses.map((pcc) => ({
        id: pcc.id,
        promotionalCodeId: pcc.promotionalCodeId,
        codeName: pcc.promotionalCode.codeName,
        discountType: pcc.promotionalCode.discountType,
        discountValue: pcc.promotionalCode.discountValue,
        status: pcc.promotionalCode.status,
        startDate: pcc.promotionalCode.startDate,
        endDate: pcc.promotionalCode.endDate,
      })),
      // tieredPricing: fee.tieredPricings.map((tier) => ({
      //   tierName: tier.tierName,
      //   price: tier.price,
      //   startDate: tier.startDate.toISOString().split("T")[0],
      //   endDate: tier.endDate.toISOString().split("T")[0],
      // })),
      startDate: fee.startDate.toISOString().split("T")[0],
      endDate: fee.endDate.toISOString().split("T")[0],
      currencyType: fee.currencyType,
      promoCodeStatus: fee.promoCodeStatus,
      createdAt: fee.createdAt.toISOString(),
      updatedAt: fee.updatedAt.toISOString(),
    }));

    return {
      courseList: transformedData,
      pagination: {
        count: courseFees.length,
        total,
        page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get advance course fees

  static async getAdvanceCourseFees(filters: AdvanceCourseFeeFilters, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      sessionCourse: {
        course: {
          courseType: filters.courseType,
        },
      },
    };

    if (filters.sessionCourseId) {
      whereClause.sessionCourseId = filters.sessionCourseId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.promoCodeStatus) {
      whereClause.promoCodeStatus = filters.promoCodeStatus;
    }

    if (filters.search && filters.search.trim() !== "") {
      whereClause.sessionCourse.course = {
        ...whereClause.sessionCourse.course,
        title: {
          contains: filters.search.trim(),
          mode: "insensitive",
        },
      };
    }

    const [courseFees, total] = await Promise.all([
      prisma.courseFee.findMany({
        where: whereClause,
        include: {
          sessionCourse: {
            include: {
              course: true,
              promotionalCodeCourses: {
                include: {
                  promotionalCode: true,
                },
              },
            },
          },
          // tieredPricings: {
          //   orderBy: { startDate: "asc" },
          // },
          courseFeeLog: {
            orderBy: { createdAt: "desc" },
          },
          courseFeeStructure: {
            include: {
              semesters: {
                orderBy: {
                  semesterOrder: "asc",
                },
                include: {
                  semesterModules: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.courseFee.count({ where: whereClause }),
    ]);

    const transformedData = courseFees.map((fee) => ({
      id: fee.id,
      courseId: fee?.sessionCourse?.course.id,
      courseName: fee?.sessionCourse?.course.title, // TODO: Get from sessionCourse relation
      overallCourseFee: fee.overallCourseFee,
      courseFeeLogHistory: fee.courseFeeLog.map((log) => ({
        fieldName: log.fieldName,
        oldValue: log.oldValue,
        newValue: log.newValue,
        changeReason: log.changeReason,
        changedBy: "System User",
        createdAt: log.createdAt.toISOString(),
      })),
      courseSemester: fee.courseFeeStructure?.semesters.map((semester) => ({
        id: semester.id,
        semesterName: semester.semesterName,
        semesterFee: semester.semesterFee,
        modules: semester.semesterModules.map((module) => ({
          id: module.id,
          moduleName: module.moduleName,
          credits: module.credits,
          moduleFee: module.moduleFee,
        })),
      })),
      scheduleType: fee.scheduleType,
      newCourseFee: fee.newCourseFee,
      scheduleFrequency: fee.scheduleFrequency,
      promotionalCode: fee?.sessionCourse?.promotionalCodeCourses,
      // tieredPricing: fee.tieredPricings.map((tier) => ({
      //   tierName: tier.tierName,
      //   price: tier.price,
      //   startDate: tier.startDate.toISOString().split("T")[0],
      //   endDate: tier.endDate.toISOString().split("T")[0],
      // })),
      startDate: fee.startDate.toISOString().split("T")[0],
      endDate: fee.endDate.toISOString().split("T")[0],
      currencyType: fee.currencyType,
      promoCodeStatus: fee.promoCodeStatus.toLowerCase(),
      createdAt: fee.createdAt.toISOString(),
      updatedAt: fee.updatedAt.toISOString(),
    }));

    return {
      courseList: transformedData,
      pagination: {
        count: courseFees.length,
        total,
        page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create course fee - prevents duplicate course fees for the same course
  static async createCertificateCourseFee(data: CreateCertificateCourseFeeData, req: any) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new AppError("Course not found", "NOT_FOUND", 404);
    }

    // Check if course fee already exists for this course
    const existingCourseFee = await prisma.courseFee.findFirst({
      where: { courseId: data.courseId },
    });

    if (existingCourseFee) {
      throw new AppError(
        "Course fee already exists for this course. Please use the update endpoint to modify it.",
        "DUPLICATE_ENTRY",
        409,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create course fee
      const courseFee = await tx.courseFee.create({
        data: {
          courseId: data.courseId,
          overallCourseFee: data.overallCourseFee,
          currencyType: data.currencyType || "USD",
          promoCodeStatus: data.promoCodeStatus || "INACTIVE",
          startDate: data.startDate,
          endDate: data.endDate,
          agreementStatus: data.agreementStatus || false,
          effectiveDate: data.effectiveDate,
          scheduleType: data.scheduleType || "",
          newCourseFee: data.newCourseFee || 0,
          scheduleFrequency: data.scheduleFrequency || "",
        },
      });

      if (data.promotionalCodes && data.promotionalCodes.length > 0) {
        await Promise.all(
          data.promotionalCodes.map(async (promotionalCodeId) => {
            // Check if promotional code exists in PromotionalCode table
            const existingPromoCode = await tx.promotionalCode.findUnique({
              where: { id: promotionalCodeId },
            });

            // If promotional code doesn't exist, throw error
            if (!existingPromoCode) {
              throw new AppError(`Promotional code with ID ${promotionalCodeId} not found`, "NOT_FOUND", 404);
            }

            // Check if this promotional code is already linked to this course
            const existingLink = await tx.promotionalCodeCourse.findFirst({
              where: {
                promotionalCodeId: promotionalCodeId,
                courseId: data.courseId,
              },
            });

            // If not linked yet, create the link
            if (!existingLink) {
              await tx.promotionalCodeCourse.create({
                data: {
                  promotionalCodeId: promotionalCodeId,
                  courseId: data.courseId,
                },
              });
            }
          }),
        );
      }

      // Create audit log for creation
      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Created certificate course fee for course: ${course.title || data.courseId}`,
        actionType: "payment_management",
        moduleName: "payment_management",
        courseId: courseFee.id,
      });

      return courseFee;
    });

    return result;
  }

  // Update course fee - now supports updating promotional codes
  static async updateCourseFee(id: string, data: UpdateCourseFeeData, req: any) {
    const existingCourseFee = await prisma.courseFee.findUnique({
      where: { id },
      include: {
        courseFeeLog: true,
        course: {
          include: {
            promotionalCodeCourses: {
              include: {
                promotionalCode: true,
              },
            },
          },
        },
      },
    });

    if (!existingCourseFee) {
      throw new AppError("Course fee not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data - only include fields that are provided
      const updateData: any = {};
      const changedFields: any = {};

      if (data.overallCourseFee !== undefined) updateData.overallCourseFee = data.overallCourseFee;
      if (data.currencyType !== undefined) updateData.currencyType = data.currencyType;
      if (data.promoCodeStatus !== undefined) updateData.promoCodeStatus = data.promoCodeStatus;
      if (data.startDate !== undefined) updateData.startDate = data.startDate;
      if (data.endDate !== undefined) updateData.endDate = data.endDate;
      if (data.agreementStatus !== undefined) updateData.agreementStatus = data.agreementStatus;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.scheduleType !== undefined) updateData.scheduleType = data.scheduleType;
      if (data.newCourseFee !== undefined) updateData.newCourseFee = data.newCourseFee;
      if (data.scheduleFrequency !== undefined) updateData.scheduleFrequency = data.scheduleFrequency;
      if (data.effectiveDate !== undefined) updateData.effectiveDate = data.effectiveDate;

      // Track only actually changed fields
      Object.keys(updateData).forEach((key) => {
        const existingValue = existingCourseFee[key as keyof typeof existingCourseFee];
        const newValue = updateData[key];

        // For date comparisons, convert both to timestamps
        if (existingValue instanceof Date && newValue instanceof Date) {
          if (existingValue.getTime() !== newValue.getTime()) {
            changedFields[key] = updateData[key];
          }
        } else if (
          typeof existingValue === "string" &&
          typeof newValue === "string" &&
          /^\d{4}-\d{2}-\d{2}/.test(existingValue) &&
          /^\d{4}-\d{2}-\d{2}/.test(newValue)
        ) {
          // Compare ISO date strings
          if (new Date(existingValue).getTime() !== new Date(newValue).getTime()) {
            changedFields[key] = updateData[key];
          }
        } else if (existingValue !== newValue) {
          changedFields[key] = updateData[key];
        }
      });

      let promoCodesChanged = false;
      let promoCodeChanges = "";

      // Update promotional codes if provided
      if (data.promotionalCodes !== undefined && Array.isArray(data.promotionalCodes)) {
        // First, verify all promotional codes exist
        await Promise.all(
          data.promotionalCodes.map(async (promotionalCodeId) => {
            const existingPromoCode = await tx.promotionalCode.findUnique({
              where: { id: promotionalCodeId },
            });

            if (!existingPromoCode) {
              throw new AppError(`Promotional code with ID ${promotionalCodeId} not found`, "NOT_FOUND", 404);
            }
            return promotionalCodeId;
          }),
        );

        // Check if promotional codes actually changed
        const existingPromoCodes =
          existingCourseFee.course?.promotionalCodeCourses.map((pc) => pc.promotionalCodeId) || [];

        const hasChanged =
          data.promotionalCodes.length !== existingPromoCodes.length ||
          !data.promotionalCodes.every((id) => existingPromoCodes.includes(id));

        if (hasChanged) {
          promoCodesChanged = true;
          promoCodeChanges = `promotionalCodes: [${existingPromoCodes.join(", ")}] → [${data.promotionalCodes.join(", ")}]`;

          // Delete existing promotional code links for this course
          await tx.promotionalCodeCourse.deleteMany({
            where: { courseId: existingCourseFee.courseId! },
          });

          // Create new promotional code links if there are any
          if (data.promotionalCodes.length > 0) {
            await tx.promotionalCodeCourse.createMany({
              data: data.promotionalCodes.map((promotionalCodeId) => ({
                promotionalCodeId: promotionalCodeId,
                courseId: existingCourseFee.courseId!,
              })),
            });
          }
        }
      }

      // Only update if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        await tx.courseFee.update({
          where: { id },
          data: changedFields,
        });
      }

      // Create audit log if there are changes
      if (Object.keys(changedFields).length > 0 || promoCodesChanged) {
        const changesSummary = [];

        if (Object.keys(changedFields).length > 0) {
          changesSummary.push(formatChangesForAudit(changedFields, existingCourseFee));
        }

        if (promoCodesChanged) {
          changesSummary.push(promoCodeChanges);
        }

        await createAuditLog({
          userId: req.user?.userPortalCategory?.userId || "",
          action: `Updated course fee: ${changesSummary.join("; ")}`,
          actionType: "payment_management",
          moduleName: "payment_management",
          courseId: id,
        });
      }

      // Build response with only changed fields
      const response: any = {
        id,
        ...changedFields,
      };

      if (promoCodesChanged) {
        response.promotionalCodes = data.promotionalCodes;
      }

      // If nothing changed, return a message
      if (Object.keys(changedFields).length === 0 && !promoCodesChanged) {
        return {
          id,
          message: "No changes detected",
        };
      }

      return response;
    });

    return result;
  }

  // Create course fee structure (for degree courses)
  static async createCourseFeeStructure(data: CreateCourseFeeStructureData, userId: string, req: any) {
    // Verify course and session exist
    const sessionCourse = await prisma.sessionCourse.findUnique({
      where: { id: data.sessionCourseId },
      include: {
        course: true,
        session: true,
      },
    });

    if (!sessionCourse) {
      throw new AppError("Session course not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find existing course fee or create new one
      let courseFee = await tx.courseFee.findFirst({
        where: {
          sessionCourseId: data.sessionCourseId,
        },
      });

      let isNewCourseFee = false;
      let courseFeeAction = "";

      if (courseFee) {
        // Track changes for existing course fee
        const oldOverallFee = courseFee.overallCourseFee;
        const oldAgreementStatus = courseFee.agreementStatus;

        // Update existing
        courseFee = await tx.courseFee.update({
          where: { id: courseFee.id },
          data: {
            overallCourseFee: data.overallcoursefee,
            agreementStatus: data.agreementStatus,
          },
        });

        courseFeeAction = `Updated course fee: overallCourseFee: ${oldOverallFee} → ${data.overallcoursefee}, agreementStatus: ${oldAgreementStatus} → ${data.agreementStatus}`;
      } else {
        // Create new
        isNewCourseFee = true;
        courseFee = await tx.courseFee.create({
          data: {
            sessionCourseId: data.sessionCourseId,
            overallCourseFee: data.overallcoursefee,
            agreementStatus: data.agreementStatus,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          },
        });

        courseFeeAction = `Created course fee with overallCourseFee: ${data.overallcoursefee}, agreementStatus: ${data.agreementStatus}`;
      }

      // Create or update course fee structure
      const totalCredits = data.semesters.reduce(
        (total, sem) => total + sem.modules.reduce((semTotal, mod) => semTotal + mod.credit, 0),
        0,
      );

      const courseFeeStructure = await tx.courseFeeStructure.upsert({
        where: { courseFeeId: courseFee.id },
        create: {
          courseFeeId: courseFee.id,
          totalSemesters: data.semesters.length,
          totalCredits: totalCredits,
        },
        update: {
          totalSemesters: data.semesters.length,
          totalCredits: totalCredits,
        },
      });

      // Delete existing semesters and recreate
      await tx.courseSemester.deleteMany({
        where: { courseFeeStructureId: courseFeeStructure.id },
      });

      // Create semesters
      for (let i = 0; i < data.semesters.length; i++) {
        const semesterData = data.semesters[i];
        const semester = await tx.courseSemester.create({
          data: {
            courseFeeStructureId: courseFeeStructure.id,
            semesterName: semesterData.semesterName,
            semesterFee: semesterData.semesterFee,
            semesterOrder: i + 1,
          },
        });

        // Create semester modules
        await tx.courseSemesterModule.createMany({
          data: semesterData.modules.map((module) => ({
            courseSemesterId: semester.id,
            moduleName: module.module,
            credits: module.credit,
            moduleFee: module.fee,
          })),
        });
      }

      // Create audit log
      const action = isNewCourseFee
        ? `Created course fee structure for course: ${sessionCourse.course.title || sessionCourse.courseId}`
        : `Updated course fee structure for course: ${sessionCourse.course.title || sessionCourse.courseId}`;

      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || userId || "",
        action: action,
        actionType: "payment_management",
        moduleName: "payment_management",
        courseId: courseFee?.id,
      });

      return courseFee;
    });

    return result;
  }

  static async updateAdvanceCourseFee(id: string, data: UpdateAdvanceCourseFeeData, req: any) {
    const existingCourseFee = await prisma.courseFee.findUnique({
      where: { id },
      include: {
        courseFeeLog: true,
      },
    });

    if (!existingCourseFee) {
      throw new AppError("Course fee not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data - only include fields that are provided
      const updateData: any = {};
      const changedFields: any = {};

      if (data.overallCourseFee !== undefined) updateData.overallCourseFee = data.overallCourseFee;
      if (data.currencyType !== undefined) updateData.currencyType = data.currencyType;
      if (data.promoCodeStatus !== undefined) updateData.promoCodeStatus = data.promoCodeStatus;
      if (data.startDate !== undefined) updateData.startDate = data.startDate;
      if (data.endDate !== undefined) updateData.endDate = data.endDate;
      if (data.agreementStatus !== undefined) updateData.agreementStatus = data.agreementStatus;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.scheduleType !== undefined) updateData.scheduleType = data.scheduleType;
      if (data.newCourseFee !== undefined) updateData.newCourseFee = data.newCourseFee;
      if (data.scheduleFrequency !== undefined) updateData.scheduleFrequency = data.scheduleFrequency;
      if (data.effectiveDate !== undefined) updateData.effectiveDate = data.effectiveDate;

      // Track only actually changed fields
      Object.keys(updateData).forEach((key) => {
        const existingValue = existingCourseFee[key as keyof typeof existingCourseFee];
        const newValue = updateData[key];

        // For date comparisons, convert both to timestamps
        if (existingValue instanceof Date && newValue instanceof Date) {
          if (existingValue.getTime() !== newValue.getTime()) {
            changedFields[key] = updateData[key];
          }
        } else if (
          typeof existingValue === "string" &&
          typeof newValue === "string" &&
          /^\d{4}-\d{2}-\d{2}/.test(existingValue) &&
          /^\d{4}-\d{2}-\d{2}/.test(newValue)
        ) {
          // Compare ISO date strings
          if (new Date(existingValue).getTime() !== new Date(newValue).getTime()) {
            changedFields[key] = updateData[key];
          }
        } else if (existingValue !== newValue) {
          changedFields[key] = updateData[key];
        }
      });

      // Only update if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        await tx.courseFee.update({
          where: { id },
          data: changedFields,
        });

        // Create audit log
        const changesSummary = formatChangesForAudit(changedFields, existingCourseFee);

        await createAuditLog({
          userId: req.user?.userPortalCategory?.userId || "",
          action: `Updated advance course fee: ${changesSummary}`,
          actionType: "payment_management",
          moduleName: "payment_management",
          courseId: id,
        });
      }

      // Build response with only changed fields
      const response: any = {
        id,
        ...changedFields,
      };

      // If nothing changed, return a message
      if (Object.keys(changedFields).length === 0) {
        return {
          id,
          message: "No changes detected",
        };
      }

      return response;
    });

    return result;
  }
}

export class AgentCommissionService {
  // Get agent commissions with filtering and pagination
  static async getAgentCommissions(filters: AgentCommissionFilters, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.agentId) {
      whereClause.agentId = filters.agentId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.applicationId) {
      whereClause.applicationId = filters.applicationId;
    }
    if (filters.dateFrom && filters.dateTo) {
      whereClause.createdAt = {
        gte: new Date(filters.dateFrom),
        lte: new Date(filters.dateTo),
      };
    }

    const [commissions, total] = await Promise.all([
      prisma.agentCommission.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              personalInformation: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              courseSelection: {
                include: {
                  course: {
                    include: {
                      course: {
                        select: {
                          title: true,
                          courseType: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          commissionPayments: {
            orderBy: { paymentDate: "desc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.agentCommission.count({ where: whereClause }),
    ]);

    // Transform data to match the required format
    const transformedData = commissions.map((commission, index) => ({
      id: skip + index + 1,
      applicantId: commission.applicationId,
      firstName: commission.application.personalInformation?.firstName || "N/A",
      course: commission.application.courseSelection?.course?.course?.title || "N/A",
      paymentPlan: "Commission", // For agent commissions
      paymentStatus:
        commission.status === "PENDING"
          ? "Pending"
          : commission.status === "APPROVED"
            ? "Approved"
            : commission.status === "PAID"
              ? "Paid"
              : commission.status === "REJECTED"
                ? "Rejected"
                : commission.status,
      dueDate: commission.createdAt.toISOString().split("T")[0],
      lastReminder: commission.paidDate?.toISOString().split("T")[0] || "",
      totalFee: commission.commissionAmount,
      paidAmount: commission.paidAmount,
      installmentsPaid: commission.commissionPayments.length,
      nextPayment:
        commission.status === "APPROVED" && commission.paidAmount < commission.commissionAmount
          ? {
              date: new Date().toISOString().split("T")[0],
              amount: commission.commissionAmount - commission.paidAmount,
            }
          : null,
      paymentHistory: commission.commissionPayments.map((payment) => ({
        date: payment.paymentDate.toISOString().split("T")[0],
        amount: payment.amount,
        method: payment.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : payment.paymentMethod,
        status:
          payment.status === "PAID"
            ? "Approved"
            : payment.status === "PENDING"
              ? "Pending"
              : payment.status === "APPROVED"
                ? "Approved"
                : payment.status === "REJECTED"
                  ? "Rejected"
                  : payment.status,
      })),
    }));

    return {
      data: transformedData,
      pagination: {
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        pageSize: limit,
        from: skip + 1,
        to: Math.min(skip + limit, total),
      },
    };
  }

  // Get agent overview statistics
  static async getAgentOverview() {
    const [totalAgents, pendingInvoices, approvedPayments, potentialClawbacks] = await Promise.all([
      prisma.user.count({
        where: {
          agentUser: { not: null },
        },
      }),
      prisma.agentCommission.count({
        where: { status: "PENDING" },
      }),
      prisma.agentCommission.count({
        where: { status: "PAID" },
      }),
      prisma.agentCommission.count({
        where: { isClawback: true },
      }),
    ]);

    return [
      {
        id: 1,
        tag: "Total Agent",
        amount: totalAgents.toString(),
        progress: "100%",
      },
      {
        id: 2,
        tag: "Pending Invoice",
        amount: pendingInvoices.toString(),
        progress: "84%",
      },
      {
        id: 3,
        tag: "Approved Payments",
        amount: approvedPayments.toString(),
        progress: "84%",
      },
      {
        id: 4,
        tag: "Potential Clawbacks",
        amount: potentialClawbacks.toString(),
        progress: "84%",
      },
    ];
  }

  // Create agent commission
  static async createAgentCommission(data: CreateAgentCommissionData) {
    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
    });

    if (!application) {
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    const commissionAmount = (data.baseAmount * data.commissionRate) / 100;

    const commission = await prisma.agentCommission.create({
      data: {
        applicationId: data.applicationId,
        baseAmount: data.baseAmount,
        commissionRate: data.commissionRate,
        commissionAmount,
      },
    });

    return commission;
  }

  // Update agent commission
  static async updateAgentCommission(id: string, data: UpdateAgentCommissionData) {
    const existingCommission = await prisma.agentCommission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      throw new AppError("Agent commission not found", "NOT_FOUND", 404);
    }

    const updatedCommission = await prisma.agentCommission.update({
      where: { id },
      data,
    });

    return updatedCommission;
  }

  // Create commission payment
  static async createCommissionPayment(data: CreateCommissionPaymentData) {
    // Verify agent commission exists
    const commission = await prisma.agentCommission.findUnique({
      where: { id: data.agentCommissionId },
    });

    if (!commission) {
      throw new AppError("Agent commission not found", "NOT_FOUND", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create commission payment
      const payment = await tx.commissionPayment.create({
        data,
      });

      // Update commission if payment is successful
      if (data.status === "PAID" || data.status === "APPROVED") {
        const newPaidAmount = commission.paidAmount + data.amount;
        await tx.agentCommission.update({
          where: { id: data.agentCommissionId },
          data: {
            paidAmount: newPaidAmount,
            status: newPaidAmount >= commission.commissionAmount ? "PAID" : "APPROVED",
            paidDate: data.paymentDate,
          },
        });
      }

      return payment;
    });

    return result;
  }

  // Get pending commission payments with semester information
  static async getPendingCommissionPayments(applicationId: string) {
    // Get the application with course selection and payment records
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        personalInformation: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        courseSelection: {
          include: {
            course: {
              include: {
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        paymentRecords: {
          include: {
            paymentHistories: {
              where: {
                payment_status: false, // payment_status false
                status: "PENDING", // status pending
              },
              orderBy: {
                paymentDate: "desc",
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    // Get course fee structure with semesters
    const sessionCourseId = application.courseSelection?.courseId;

    let courseFeeStructure = null;
    if (sessionCourseId) {
      courseFeeStructure = await prisma.courseFee.findFirst({
        where: { sessionCourseId },
        include: {
          courseFeeStructure: {
            include: {
              semesters: {
                orderBy: {
                  semesterOrder: "asc",
                },
              },
            },
          },
        },
      });
    }

    // Collect all pending payment histories
    const semesters = courseFeeStructure?.courseFeeStructure?.semesters || [];
    const pendingPayments: PendingCommissionPaymentResponse[] = [];

    // Consolidate all payment records and their histories
    const allPaymentHistories = application.paymentRecords.flatMap((record) => record.paymentHistories);

    // Iterate through all pending payment histories
    for (const history of allPaymentHistories) {
      // Skip if no semester structure exists
      if (semesters.length === 0) {
        continue;
      }

      // Dynamically find the semester based on payment amount matching semester fee
      const semester = semesters.find((sem) => Math.abs(sem.semesterFee - history.amount) < 0.01);

      if (!semester) {
        continue;
      }

      pendingPayments.push({
        id: history.id,
        applicationId: applicationId,
        semesterName: semester.semesterName,
        semesterNumber: semester.semesterOrder,
        receiptUrl: history.receipt_url || "",
        paymentStatus: "PENDING",
        amount: history.amount,
        paymentDate: history.paymentDate.toISOString().split("T")[0],
        firstName: application.personalInformation?.firstName || "N/A",
        lastName: application.personalInformation?.lastName || "N/A",
        courseName: application.courseSelection?.course?.course?.title || "N/A",
      });
    }

    return {
      data: pendingPayments,
      message:
        pendingPayments.length > 0 ? "Pending commission payments retrieved successfully" : "No pending payments found",
    };
  }
}
