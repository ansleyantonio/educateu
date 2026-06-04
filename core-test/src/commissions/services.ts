import { Prisma } from "@prisma/client";
import { Commission } from "@prisma/client";
import {
  PaymentGetRecordsRequestBody,
  CommissionGetRecordsRequestBody,
  UpdateInvoiceInput,
  CreateBulkInvoicesInput,
  // CreateInvoiceInput,
  InvoiceGetRecordsRequestBody,
  PaymentHistoryAgentsRequestBody,
  UpdateInvoiceStatusInput,
  UpdateMultipleInvoicesPaidStatusInput,
  UpdatePaymentHistoryStatusInput,
  GetInvoiceWithUserIdBody,
} from "./types";
import {
  AgentCommissionInfo,
  CourseResponse,
  UserPortalCategoryRoleData,
  AwardingBodyTemplate,
  CommissionRates,
  Records,
} from "./interfaces";
import { getPagination } from "../utils/paginationUtils";
import prisma from "../prismaClient";
import app from "../app";
import { AppError } from "../utils/AppError";
import { buildPaymentRecordWhere } from "./query";
import { PrismaClient, PaymentHistoryStatus, PaymentRecord, PaymentHistory } from "@prisma/client";

const getPaymentRecords = async (reqBody: PaymentGetRecordsRequestBody, userId: string) => {
  const { offset, limit } = getPagination(reqBody.page as number, reqBody.pageSize as number);

  const where: Prisma.PaymentRecordWhereInput = {
    AND: [
      {
        application: {
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRole: {
                userPortalCategory: {
                  userId: userId,
                },
              },
            },
          },
        },
      },
      // Search filters
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              applicantId: {
                contains: reqBody.searchTerm,
                mode: "insensitive",
              },
            },
            {
              application: {
                personalInformation: {
                  firstName: {
                    contains: reqBody.searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              application: {
                personalInformation: {
                  lastName: {
                    contains: reqBody.searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              application: {
                applicationId: {
                  contains: reqBody.searchTerm,
                  mode: "insensitive",
                },
              },
            },
            // Add invoice number search
            {
              paymentHistories: {
                some: {
                  invoices: {
                    some: {
                      invoiceNumber: {
                        contains: reqBody.searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
          ],
        }),
      },
      // Status filters
      {
        ...(reqBody.paymentStatus && {
          paymentStatus: reqBody.paymentStatus,
        }),
      },
      // Date filters
      {
        ...(reqBody.dateFrom && {
          createdAt: {
            gte: new Date(reqBody.dateFrom),
          },
        }),
      },
      {
        ...(reqBody.dateTo && {
          createdAt: {
            lte: new Date(reqBody.dateTo),
          },
        }),
      },
      // Related entity filters
      {
        ...(reqBody.agentId && {
          application: {
            userPortalCategoryRoleApplications: {
              some: {
                userPortalCategoryRoleId: reqBody.agentId,
              },
            },
          },
        }),
      },
      {
        ...(reqBody.subAgentId && {
          application: {
            userPortalCategoryRoleApplications: {
              some: {
                userPortalCategoryRoleId: reqBody.subAgentId,
              },
            },
          },
        }),
      },
      {
        ...(reqBody.awardingBodyId && {
          application: {
            courseSelection: {
              awardingBodyId: reqBody.awardingBodyId,
            },
          },
        }),
      },
      {
        ...(reqBody.courseId && {
          application: {
            courseSelection: {
              courseId: reqBody.courseId,
            },
          },
        }),
      },
      {
        ...(reqBody.sessionId && {
          application: {
            courseSelection: {
              sessionId: reqBody.sessionId,
            },
          },
        }),
      },
    ],
  };

  const [paymentRecords, count] = await prisma.$transaction([
    prisma.paymentRecord.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        applicantId: true,
        totalFee: true,
        paidAmount: true,
        remainingAmount: true,
        paymentPlan: true,
        paymentStatus: true,
        installmentsPaid: true,
        totalInstallments: true,
        nextPaymentDate: true,
        nextPaymentAmount: true,
        dueDate: true,
        discountApplied: true,
        createdAt: true,
        updatedAt: true,
        application: {
          select: {
            id: true,
            applicationId: true,
            status: true,
            personalInformation: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            courseSelection: {
              select: {
                session: {
                  select: {
                    id: true,
                    intakePeriod: true,
                    name: true,
                  },
                },
                course: {
                  select: {
                    courseSnapshot: true,
                  },
                },
                awardingBody: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            // Get agent commission group info
            userPortalCategoryRoleApplications: {
              where: {
                userPortalCategoryRole: {
                  userPortalCategory: {
                    userId: userId,
                  },
                  role: {
                    name: "agent",
                  },
                },
              },
              select: {
                userPortalCategoryRole: {
                  select: {
                    roleData: true,
                  },
                },
              },
            },
          },
        },
        paymentHistories: {
          orderBy: {
            paymentDate: "desc",
          },
          take: 1,
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            status: true,
            paymentDate: true,
            transactionId: true,
            reference: true,
            bank_account_number: true,
            bank_account_name: true,
            bank_name: true,
            bank_swift_code: true,
            bank_branch: true,
            receipt_url: true,
            processedBy: true,
            processedDate: true,
            notes: true,
            payment_status: true,
            invoices: {
              select: {
                id: true,
                invoiceNumber: true,
                invoiceStatus: true,
                invoiceAmount: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    }),
    prisma.paymentRecord.count({ where }),
  ]);

  // Get agent's commission group and student count for tier calculation
  const agentCommissionInfo = (await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategory: {
        userId: userId,
      },
      role: {
        name: "agent",
      },
    },
    select: {
      roleData: true,
    },
  })) as AgentCommissionInfo | null;

  const roleData = agentCommissionInfo?.roleData;

  // Get commissionGroupId from awardingBodyTemplates
  let commissionGroupId = null;
  if (roleData && roleData.awardingBodyTemplates && roleData?.awardingBodyTemplates?.length > 0) {
    const firstTemplateId = roleData.awardingBodyTemplates[0].commissionTemplateId;
    if (firstTemplateId) {
      const agreementTemplate = await prisma.agreementTemplate.findFirst({
        where: {
          id: firstTemplateId,
        },
        select: {
          commissionGroupId: true,
        },
      });
      commissionGroupId = agreementTemplate?.commissionGroupId;
    }
  }

  const totalAgentStudents = await prisma.application.count({
    where: {
      status: "APPROVED", // Only count approved applications
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRole: {
            userPortalCategory: {
              userId: userId,
            },
            role: {
              name: "agent",
            },
          },
        },
      },
    },
  });

  let allCommissionRanges: Commission[] = [];
  if (commissionGroupId) {
    allCommissionRanges = await prisma.commission.findMany({
      where: {
        commissionGroupId: commissionGroupId,
      },
      orderBy: {
        studentRangeLower: "asc",
      },
    });
  }

  // Function to find applicable commission rates based on student count
  const findApplicableCommission = (studentCount: number): Commission | null => {
    if (allCommissionRanges.length === 0) return null;

    // Find the range that matches the student count
    const applicableRange = allCommissionRanges.find(
      (commission) =>
        studentCount >= commission.studentRangeLower &&
        (commission.studentRangeUpper === null || studentCount <= commission.studentRangeUpper),
    );

    // If no exact range found, use the highest available range
    return applicableRange || allCommissionRanges[allCommissionRanges.length - 1];
  };

  // Get general commission rates for this agent's student count
  const generalCommissionRates = findApplicableCommission(totalAgentStudents);
  // Transform data to match your required format
  const formattedRecords = await Promise.all(
    paymentRecords.map(async (record) => {
      // Extract course name from courseSnapshot
      // console.log(record)
      const courseSnapshot = record.application.courseSelection?.course?.courseSnapshot as CourseResponse | undefined;
      const courseName = courseSnapshot?.title || "N/A";
      const awardingBodyName = record.application.courseSelection?.awardingBody?.name || "N/A";
      const awardingBodyId = record.application.courseSelection?.awardingBody?.id;

      // Get first payment status AND INVOICE INFO
      const latestPaymentHistory = record.paymentHistories[0];
      const firstPaymentStatus = latestPaymentHistory?.status || "PENDING";

      // Get latest invoice info
      const latestInvoice = latestPaymentHistory?.invoices[0];
      const invoiceId = latestInvoice?.id || "N/A";
      const invoiceNumber = latestInvoice?.invoiceNumber || "N/A";
      const invoiceStatus = latestInvoice?.invoiceStatus || "PENDING";

      // Calculate commission rate and amounts
      let commissionRate = 0;
      let commissionPayment = 0;
      let potentialPayout = 0;
      let commissionSource = "general";

      // Get the role data for this specific record
      const recordRoleData = record.application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
        ?.roleData as unknown as UserPortalCategoryRoleData | undefined;
      // console.log("recordRoleData",recordRoleData)
      const awardingBodyTemplates = recordRoleData?.awardingBodyTemplates || [];

      if (generalCommissionRates) {
        // Try to find specific commission for this awarding body
        const awardingBodyTemplate = awardingBodyTemplates.find(
          (template: AwardingBodyTemplate) => template.awardingBodyId === awardingBodyId,
        );

        if (awardingBodyTemplate && awardingBodyTemplate.commissionTemplateId) {
          try {
            // Get the agreement template
            const agreementTemplate = await prisma.agreementTemplate.findFirst({
              where: {
                id: awardingBodyTemplate.commissionTemplateId,
              },
              select: {
                commissionGroupId: true,
              },
            });

            if (agreementTemplate?.commissionGroupId) {
              // Get commission ranges for this specific agreement template's commission group
              const specificCommissionRanges = await prisma.commission.findMany({
                where: {
                  commissionGroupId: agreementTemplate.commissionGroupId,
                },
                orderBy: {
                  studentRangeLower: "asc",
                },
              });
              // Find applicable commission rates for this specific group
              const specificCommissionRates =
                specificCommissionRanges.find(
                  (commission) =>
                    totalAgentStudents >= commission.studentRangeLower &&
                    (commission.studentRangeUpper === null || totalAgentStudents <= commission.studentRangeUpper),
                ) || specificCommissionRanges[specificCommissionRanges.length - 1];
              if (specificCommissionRates) {
                commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, specificCommissionRates);
                commissionSource = "specific";
              } else {
                commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
                commissionSource = "general_fallback";
              }
            } else {
              commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
              commissionSource = "general_no_specific_group";
            }
          } catch (error) {
            commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
            commissionSource = "general_error";
          }
        } else {
          // No specific awarding body template found, use general rates
          commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
          commissionSource = "general_no_template";
        }
      } else {
        // Fallback: 10% commission if no commission rates found
        commissionRate = 10;
        commissionSource = "fallback_10_percent";
      }

      // Calculate total PAID invoice amount across ALL payment histories for this application
      let totalPaidInvoiceAmount = 0;
      const allPaymentHistoriesForApplication = await prisma.paymentHistory.findMany({
        where: {
          paymentRecordId: record.id,
        },
        select: {
          invoices: {
            where: {
              invoiceStatus: "PAID",
            },
            select: {
              invoiceAmount: true,
            },
          },
        },
      });

      allPaymentHistoriesForApplication.forEach((ph) => {
        ph.invoices.forEach((inv) => {
          if (inv.invoiceAmount) {
            totalPaidInvoiceAmount += inv.invoiceAmount;
          }
        });
      });

      // Calculate commission amounts
      commissionPayment = (record.totalFee * commissionRate) / 100;
      potentialPayout = (record.paidAmount * commissionRate) / 100;

      // Calculate remaining potential payout
      const remainPotentialPayout = potentialPayout - totalPaidInvoiceAmount;

      // Determine enrollment status
      let enrollmentStatus = "Not Enrolled";
      if (record.application.status === "APPROVED" && record.paymentStatus === "PAID") {
        enrollmentStatus = "Enrolled";
      } else if (record.application.status === "APPROVED" && record.paymentStatus !== "PAID") {
        enrollmentStatus = "Approved - Pending Payment";
      } else if (record.application.status === "PENDING") {
        enrollmentStatus = "Application Pending";
      } else if (record.application.status === "REJECTED") {
        enrollmentStatus = "Application Rejected";
      }

      return {
        // Payment History Details (from latest payment history)
        id: latestPaymentHistory?.id || record.id,
        paymentRecordId: record.id,
        // amount: latestPaymentHistory?.amount || 0,
        paymentMethod: latestPaymentHistory?.paymentMethod || "ONLINE",
        status: latestPaymentHistory?.status || "PENDING",
        paymentDate: latestPaymentHistory?.paymentDate || record.createdAt,
        transactionId: latestPaymentHistory?.transactionId || "N/A",
        reference: latestPaymentHistory?.reference || "N/A",

        // Manual payment details
        bankAccountNumber: latestPaymentHistory?.bank_account_number || null,
        bankAccountName: latestPaymentHistory?.bank_account_name || null,
        bankName: latestPaymentHistory?.bank_name || null,
        bankSwiftCode: latestPaymentHistory?.bank_swift_code || null,
        bankBranch: latestPaymentHistory?.bank_branch || null,
        receiptUrl: latestPaymentHistory?.receipt_url || null,

        // Processing details
        processedBy: latestPaymentHistory?.processedBy || null,
        processedDate: latestPaymentHistory?.processedDate || null,
        notes: latestPaymentHistory?.notes || null,
        paymentStatusBool: latestPaymentHistory?.payment_status || false,

        // Invoice details
        invoiceId: invoiceId,
        invoiceNumber: invoiceNumber,
        invoiceStatus: invoiceStatus,

        // Application details
        applicationId: record.application.id,
        applicantId: record.application.applicationId || record.applicantId,
        fullName:
          `${record.application.personalInformation?.firstName || ""} ${record.application.personalInformation?.lastName || ""}`.trim(),
        enrollmentStatus: enrollmentStatus,
        academicSession: record.application.courseSelection?.session?.name || "N/A",

        // Payment Record details
        totalFee: record.totalFee,
        paidAmount: record.paidAmount,
        remainingAmount: record.remainingAmount,
        paymentPlan: record.paymentPlan,
        paymentRecordStatus: record.paymentStatus,
        installmentsPaid: record.installmentsPaid,
        totalInstallments: record.totalInstallments,
        discountApplied: record.discountApplied,

        // Course details
        courseName: courseName,
        awardingBody: awardingBodyName,
        awardingBodyId: awardingBodyId,

        // Commission calculations
        potentialPayout: Math.round(potentialPayout * 100) / 100,
        remainPotentialPayout: Math.round(remainPotentialPayout * 100) / 100,
        commissionPayment: Math.round(commissionPayment * 100) / 100,
        commissionRate: commissionRate,

        // Agent info
        commissionGroupId: commissionGroupId,
        totalAgentStudents: totalAgentStudents,
        commissionSource: commissionSource,
        hasMatchingAwardingBody: !!awardingBodyTemplates.find(
          (t: AwardingBodyTemplate) => t.awardingBodyId === awardingBodyId,
        ),
      };
    }),
  );

  const paginationData = {
    count: paymentRecords.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  // Deduplicate by applicationId - keep the record with invoice, or the one with highest paidAmount
  const applicationMap = new Map<string, typeof formattedRecords[0]>();
  
  formattedRecords.forEach((record) => {
    const existing = applicationMap.get(record.applicationId);
    
    // Keep record with invoice, or if both/no invoices, keep the one with higher paidAmount
    if (!existing) {
      applicationMap.set(record.applicationId, record);
    } else {
      const hasInvoice = record.invoiceId !== "N/A";
      const existingHasInvoice = existing.invoiceId !== "N/A";
      
      if (hasInvoice && !existingHasInvoice) {
        // New record has invoice, existing doesn't - use new
        applicationMap.set(record.applicationId, record);
      } else if (!hasInvoice && existingHasInvoice) {
        // Existing has invoice, new doesn't - keep existing
        // Do nothing
      } else {
        // Both have or both don't have invoices - keep the one with higher paidAmount
        if (record.paidAmount > existing.paidAmount) {
          applicationMap.set(record.applicationId, record);
        }
      }
    }
  });
  
  const deduplicatedRecords = Array.from(applicationMap.values());

  return {
    paymentRecords: deduplicatedRecords,
    pagination: paginationData,
  };
};

const getPaymentHistories = async (reqBody: PaymentGetRecordsRequestBody, userId: string) => {
  const { offset, limit } = getPagination(reqBody.page as number, reqBody.pageSize as number);

  const where: Prisma.PaymentHistoryWhereInput = {
    AND: [
      {
        paymentRecord: {
          application: {
            userPortalCategoryRoleApplications: {
              some: {
                userPortalCategoryRole: {
                  userPortalCategory: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
      },
      // Search filters
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              paymentRecord: {
                applicantId: {
                  contains: reqBody.searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              paymentRecord: {
                application: {
                  personalInformation: {
                    firstName: {
                      contains: reqBody.searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            {
              paymentRecord: {
                application: {
                  personalInformation: {
                    lastName: {
                      contains: reqBody.searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            {
              paymentRecord: {
                application: {
                  applicationId: {
                    contains: reqBody.searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }),
      },

      // Date filters
      {
        ...(reqBody.dateFrom && {
          paymentDate: {
            gte: new Date(reqBody.dateFrom),
          },
        }),
      },
      {
        ...(reqBody.dateTo && {
          paymentDate: {
            lte: new Date(reqBody.dateTo),
          },
        }),
      },
      // Filter out records with amount = 0
      {
        amount: {
          gt: 0,
        },
      },

      // Related entity filters
      {
        ...(reqBody.agentId && {
          paymentRecord: {
            application: {
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRoleId: reqBody.agentId,
                },
              },
            },
          },
        }),
      },
      {
        ...(reqBody.subAgentId && {
          paymentRecord: {
            application: {
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRoleId: reqBody.subAgentId,
                },
              },
            },
          },
        }),
      },
      {
        ...(reqBody.awardingBodyId && {
          paymentRecord: {
            application: {
              courseSelection: {
                awardingBodyId: reqBody.awardingBodyId,
              },
            },
          },
        }),
      },
      {
        ...(reqBody.courseId && {
          paymentRecord: {
            application: {
              courseSelection: {
                courseId: reqBody.courseId,
              },
            },
          },
        }),
      },
      {
        ...(reqBody.sessionId && {
          paymentRecord: {
            application: {
              courseSelection: {
                sessionId: reqBody.sessionId,
              },
            },
          },
        }),
      },
    ],
  };

  const [paymentHistories, count] = await prisma.$transaction([
    prisma.paymentHistory.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        paymentDate: "desc",
      },
      select: {
        id: true,
        amount: true,
        paymentMethod: true,
        status: true,
        paymentDate: true,
        transactionId: true,
        reference: true,
        // Manual payment fields
        bank_account_number: true,
        bank_account_name: true,
        bank_name: true,
        bank_swift_code: true,
        bank_branch: true,
        receipt_url: true,
        // Processing details
        processedBy: true,
        processedDate: true,
        notes: true,
        payment_status: true,
        createdAt: true,
        updatedAt: true,
        // Payment record details
        paymentRecord: {
          select: {
            id: true,
            applicantId: true,
            totalFee: true,
            paidAmount: true,
            remainingAmount: true,
            paymentPlan: true,
            paymentStatus: true,
            installmentsPaid: true,
            totalInstallments: true,
            discountApplied: true,
            application: {
              select: {
                id: true,
                applicationId: true,
                status: true,
                personalInformation: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                courseSelection: {
                  select: {
                    session: {
                      select: {
                        id: true,
                        intakePeriod: true,
                        name: true,
                      },
                    },
                    course: {
                      select: {
                        courseSnapshot: true,
                      },
                    },
                    awardingBody: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
                // Get agent commission group info
                userPortalCategoryRoleApplications: {
                  where: {
                    userPortalCategoryRole: {
                      userPortalCategory: {
                        userId: userId,
                      },
                      role: {
                        name: "agent",
                      },
                    },
                  },
                  select: {
                    userPortalCategoryRole: {
                      select: {
                        roleData: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // Invoices related to this payment history
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            invoiceStatus: true,
            invoiceAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
    prisma.paymentHistory.count({ where }),
  ]);

  // Get agent's commission group and student count for tier calculation
  const agentCommissionInfo = (await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategory: {
        userId: userId,
      },
      role: {
        name: "agent",
      },
    },
    select: {
      roleData: true,
    },
  })) as AgentCommissionInfo | null;

  const roleData = agentCommissionInfo?.roleData;

  // Get commissionGroupId from awardingBodyTemplates
  let commissionGroupId = null;
  if (roleData && roleData.awardingBodyTemplates && roleData?.awardingBodyTemplates?.length > 0) {
    const firstTemplateId = roleData.awardingBodyTemplates[0].commissionTemplateId;
    if (firstTemplateId) {
      const agreementTemplate = await prisma.agreementTemplate.findFirst({
        where: {
          id: firstTemplateId,
        },
        select: {
          commissionGroupId: true,
        },
      });
      commissionGroupId = agreementTemplate?.commissionGroupId;
    }
  }

  const totalAgentStudents = await prisma.application.count({
    where: {
      status: "APPROVED",
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRole: {
            userPortalCategory: {
              userId: userId,
            },
            role: {
              name: "agent",
            },
          },
        },
      },
    },
  });

  let allCommissionRanges: Commission[] = [];
  if (commissionGroupId) {
    allCommissionRanges = await prisma.commission.findMany({
      where: {
        commissionGroupId: commissionGroupId,
      },
      orderBy: {
        studentRangeLower: "asc",
      },
    });
  }

  // Function to find applicable commission rates based on student count
  const findApplicableCommission = (studentCount: number): Commission | null => {
    if (allCommissionRanges.length === 0) return null;

    const applicableRange = allCommissionRanges.find(
      (commission) =>
        studentCount >= commission.studentRangeLower &&
        (commission.studentRangeUpper === null || studentCount <= commission.studentRangeUpper),
    );

    return applicableRange || allCommissionRanges[allCommissionRanges.length - 1];
  };

  // Get general commission rates for this agent's student count
  const generalCommissionRates = findApplicableCommission(totalAgentStudents);

  // Transform data to match your required format
  const formattedHistories = await Promise.all(
    paymentHistories.map(async (history) => {
      const record = history.paymentRecord;
      const application = record.application;

      // Extract course name from courseSnapshot
      const courseSnapshot = application.courseSelection?.course?.courseSnapshot as CourseResponse | undefined;
      const courseName = courseSnapshot?.title || "N/A";
      const awardingBodyName = application.courseSelection?.awardingBody?.name || "N/A";
      const awardingBodyId = application.courseSelection?.awardingBody?.id;

      // Get invoice info from this payment history
      const invoice = history.invoices[0];
      const invoiceId = invoice?.id || "N/A";
      const invoiceNumber = invoice?.invoiceNumber || "N/A";
      const invoiceStatus = invoice?.invoiceStatus || "PENDING";

      // Calculate commission rate and amounts
      let commissionRate = 0;
      let commissionPayment = 0;
      let potentialPayout = 0;
      let commissionSource = "general";

      // Get the role data for this specific record
      const recordRoleData = application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
        ?.roleData as unknown as UserPortalCategoryRoleData | undefined;

      const awardingBodyTemplates = recordRoleData?.awardingBodyTemplates || [];

      if (generalCommissionRates) {
        // Try to find specific commission for this awarding body
        const awardingBodyTemplate = awardingBodyTemplates.find(
          (template: AwardingBodyTemplate) => template.awardingBodyId === awardingBodyId,
        );

        if (awardingBodyTemplate && awardingBodyTemplate.commissionTemplateId) {
          try {
            // Get the agreement template
            const agreementTemplate = await prisma.agreementTemplate.findFirst({
              where: {
                id: awardingBodyTemplate.commissionTemplateId,
              },
              select: {
                commissionGroupId: true,
              },
            });

            if (agreementTemplate?.commissionGroupId) {
              // Get commission ranges for this specific agreement template's commission group
              const specificCommissionRanges = await prisma.commission.findMany({
                where: {
                  commissionGroupId: agreementTemplate.commissionGroupId,
                },
                orderBy: {
                  studentRangeLower: "asc",
                },
              });

              // Find applicable commission rates for this specific group
              const specificCommissionRates =
                specificCommissionRanges.find(
                  (commission) =>
                    totalAgentStudents >= commission.studentRangeLower &&
                    (commission.studentRangeUpper === null || totalAgentStudents <= commission.studentRangeUpper),
                ) || specificCommissionRanges[specificCommissionRanges.length - 1];

              if (specificCommissionRates) {
                commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, specificCommissionRates);
                commissionSource = "specific";
              } else {
                commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
                commissionSource = "general_fallback";
              }
            } else {
              commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
              commissionSource = "general_no_specific_group";
            }
          } catch (error) {
            commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
            commissionSource = "general_error";
          }
        } else {
          // No specific awarding body template found, use general rates
          commissionRate = getCommissionRateByInstallments(record?.installmentsPaid, generalCommissionRates);
          commissionSource = "general_no_template";
        }
      } else {
        // Fallback: 10% commission if no commission rates found
        commissionRate = 10;
        commissionSource = "fallback_10_percent";
      }

      // Calculate total PAID invoice amount across ALL payment histories for this application
      // This is needed to calculate remainPotentialPayout correctly
      const allPaymentHistoriesForApplication = await prisma.paymentHistory.findMany({
        where: {
          paymentRecordId: record.id,
        },
        select: {
          invoices: {
            where: {
              invoiceStatus: "PAID",
            },
            select: {
              invoiceAmount: true,
            },
          },
        },
      });

      let totalPaidInvoiceAmount = 0;
      allPaymentHistoriesForApplication.forEach((ph) => {
        ph.invoices.forEach((inv) => {
          if (inv.invoiceAmount) {
            totalPaidInvoiceAmount += inv.invoiceAmount;
          }
        });
      });

      // Calculate commission amounts based on THIS payment history amount
      commissionPayment = (history.amount * commissionRate) / 100;

      // Calculate potential payout (commission from already paid amount)
      potentialPayout = (record.paidAmount * commissionRate) / 100;

      // Calculate remaining potential payout (potentialPayout minus already paid invoices)
      const remainPotentialPayout = potentialPayout - totalPaidInvoiceAmount;

      // Determine enrollment status
      let enrollmentStatus = "Not Enrolled";
      if (application.status === "APPROVED" && record.paymentStatus === "PAID") {
        enrollmentStatus = "Enrolled";
      } else if (application.status === "APPROVED" && record.paymentStatus !== "PAID") {
        enrollmentStatus = "Approved - Pending Payment";
      } else if (application.status === "PENDING") {
        enrollmentStatus = "Application Pending";
      } else if (application.status === "REJECTED") {
        enrollmentStatus = "Application Rejected";
      }

      return {
        // Payment History Details
        id: history.id,
        paymentRecordId: record.id,
        amount: history.amount,
        paymentMethod: history.paymentMethod,
        status: history.status,
        paymentDate: history.paymentDate,
        transactionId: history.transactionId,
        reference: history.reference,

        // Manual payment details
        bankAccountNumber: history.bank_account_number,
        bankAccountName: history.bank_account_name,
        bankName: history.bank_name,
        bankSwiftCode: history.bank_swift_code,
        bankBranch: history.bank_branch,
        receiptUrl: history.receipt_url,

        // Processing details
        processedBy: history.processedBy,
        processedDate: history.processedDate,
        notes: history.notes,
        paymentStatusBool: history.payment_status,

        // Invoice details
        invoiceId: invoiceId,
        invoiceNumber: invoiceNumber,
        invoiceStatus: invoiceStatus,

        // Application details
        applicationId: application.id,
        applicantId: application.applicationId || record.applicantId,
        fullName:
          `${application.personalInformation?.firstName || ""} ${application.personalInformation?.lastName || ""}`.trim(),
        enrollmentStatus: enrollmentStatus,
        academicSession: application.courseSelection?.session?.name || "N/A",

        // Payment Record details
        totalFee: record.totalFee,
        paidAmount: record.paidAmount,
        remainingAmount: record.remainingAmount,
        paymentPlan: record.paymentPlan,
        paymentRecordStatus: record.paymentStatus,
        installmentsPaid: record.installmentsPaid,
        totalInstallments: record.totalInstallments,
        discountApplied: record.discountApplied,

        // Course details
        courseName: courseName,
        awardingBody: awardingBodyName,
        awardingBodyId: awardingBodyId,

        // Commission calculations
        // potentialPayout: Math.round(potentialPayout * 100) / 100,
        potentialPayout: Math.round(potentialPayout * 100) / 100,
        remainPotentialPayout: Math.round((potentialPayout - totalPaidInvoiceAmount) * 100) / 100,
        commissionPayment: Math.round(commissionPayment * 100) / 100,
        commissionRate: commissionRate,

        // Agent info
        commissionGroupId: commissionGroupId,
        totalAgentStudents: totalAgentStudents,
        commissionSource: commissionSource,
        hasMatchingAwardingBody: !!awardingBodyTemplates.find(
          (t: AwardingBodyTemplate) => t.awardingBodyId === awardingBodyId,
        ),
      };
    }),
  );

  const paginationData = {
    count: paymentHistories.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    paymentHistories: formattedHistories,
    pagination: paginationData,
  };
};

// Helper function to get commission rate based on installments
const getCommissionRateByInstallments = (record: number, commissionRates?: CommissionRates): number => {
  // const installmentsPaid = record.installmentsPaid || 0;
  const installmentsPaid = record || 0;

  if (!commissionRates) {
    return 0;
  }
  let commissionRate = 0;

  if (installmentsPaid >= 4 && commissionRates.fourthRate) {
    commissionRate = commissionRates.fourthRate;
  } else if (installmentsPaid >= 3 && commissionRates.thirdRate) {
    commissionRate = commissionRates.thirdRate;
  } else if (installmentsPaid >= 2 && commissionRates.secondRate) {
    commissionRate = commissionRates.secondRate;
  } else if (installmentsPaid >= 1 && commissionRates.firstRate) {
    commissionRate = commissionRates.firstRate;
  } else {
    // Default to first rate if no installments paid yet
    commissionRate = commissionRates.firstRate || 0;
  }

  return commissionRate;
};
const getAllPaymentRecords = async (reqBody: PaymentGetRecordsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page as number, reqBody.pageSize as number);

  const { where, orderBy } = buildPaymentRecordWhere(reqBody);

  const [paymentRecords, count] = await prisma.$transaction([
    prisma.paymentRecord.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      // orderBy: {
      //   createdAt: "desc",
      // },
      select: {
        id: true,
        applicantId: true,
        totalFee: true,
        paidAmount: true,
        remainingAmount: true,
        paymentPlan: true,
        paymentStatus: true,
        installmentsPaid: true,
        totalInstallments: true,
        nextPaymentDate: true,
        nextPaymentAmount: true,
        dueDate: true,
        discountApplied: true,
        createdAt: true,
        updatedAt: true,
        application: {
          select: {
            id: true,
            applicationId: true,
            status: true,
            personalInformation: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            courseSelection: {
              select: {
                session: {
                  select: {
                    id: true,
                    intakePeriod: true,
                    name: true,
                    SessionCourse: {
                      select: {
                        courseFees: {
                          select: {
                            courseFeeStructure: {
                              select: {
                                semesters: {
                                  select: {
                                    semesterName: true,
                                    semesterFee: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                course: {
                  select: {
                    courseSnapshot: true,
                    course: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
                awardingBody: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            // Get agent commission group info
            userPortalCategoryRoleApplications: {
              where: {
                userPortalCategoryRole: {
                  role: {
                    name: "agent",
                  },
                },
              },
              select: {
                userPortalCategoryRole: {
                  select: {
                    roleData: true,
                  },
                },
              },
            },
          },
        },
        paymentHistories: {
          orderBy: {
            paymentDate: "desc",
          },
          select: {
            id: true,
            status: true,
            paymentDate: true,
            amount: true,
            receipt_url: true,
            payment_status: true,
          },
        },
      },
    }),
    prisma.paymentRecord.count({ where }),
  ]);

  // Get agent's commission group and student count for tier calculation
  const agentCommissionInfo = (await prisma.userPortalCategoryRole.findFirst({
    where: {
      role: {
        name: "agent",
      },
    },
    select: {
      roleData: true,
    },
  })) as AgentCommissionInfo | null;

  const roleData = agentCommissionInfo?.roleData;
  const commissionGroupId = roleData?.commissionGroupId;

  // Count total students for this agent to determine commission tier
  const totalAgentStudents = await prisma.application.count({
    where: {
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRole: {
            role: {
              name: "agent",
            },
          },
        },
      },
    },
  });

  // Get commission rates based on student count and commission group
  let commissionRates = null;
  if (commissionGroupId) {
    commissionRates = await prisma.commission.findFirst({
      where: {
        commissionGroupId: commissionGroupId,
        studentRangeLower: {
          lte: totalAgentStudents,
        },
        OR: [{ studentRangeUpper: { gte: totalAgentStudents } }, { studentRangeUpper: null }],
      },
      select: {
        firstRate: true,
        secondRate: true,
        thirdRate: true,
        fourthRate: true,
      },
    });
  }

  // Transform data to match your required format
  const formattedRecords = await Promise.all(
    paymentRecords.map(async (record) => {
      // Extract course name from courseSnapshot
      const courseSnapshot = record.application.courseSelection?.course?.courseSnapshot as CourseResponse | undefined;
      const courseName = courseSnapshot?.title || "N/A";
      const awardingBodyName = record.application.courseSelection?.awardingBody?.name || "N/A";
      const awardingBodyId = record.application.courseSelection?.awardingBody?.id;

      // Get first payment status
      const firstPaymentStatus = record.paymentHistories[0]?.status || "PENDING";
      const receiptUrl = record.paymentHistories[0]?.receipt_url || null;

      // Calculate paidAmount from payment histories where payment_status is true and status is PAID
      const calculatedPaidAmount = record.paymentHistories
        .filter((history) => history.payment_status === true && history.status === "PAID")
        .reduce((sum, history) => sum + history.amount, 0);

      const semesters =
        record.application.courseSelection?.session?.SessionCourse?.[0]?.courseFees?.[0]?.courseFeeStructure
          ?.semesters || [];

      const paidSemesterCount = record.installmentsPaid || 0;

      // Calculate potential payout based on commission rates
      let potentialPayout = 0;

      if (commissionRates) {
        // Check if there's a specific awarding body commission rate in roleData
        const roleData = record.application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
          ?.roleData as unknown as UserPortalCategoryRoleData | undefined;
        const awardingBodyTemplates = roleData?.awardingBodyTemplates || [];

        // Find specific commission rate for this awarding body
        const awardingBodyCommission = awardingBodyTemplates.find(
          (template: AwardingBodyTemplate) => template.awardingBodyId === awardingBodyId,
        );

        if (awardingBodyCommission && awardingBodyCommission.commissionTemplateId) {
          // Get specific commission rate for this awarding body
          const specificCommission = await prisma.commission.findFirst({
            where: {
              commissionGroupId: commissionGroupId,
              id: awardingBodyCommission.commissionTemplateId,
            },
            select: {
              firstRate: true,
              secondRate: true,
              thirdRate: true,
              fourthRate: true,
            },
          });

          if (specificCommission) {
            // Use the specific commission rate (using firstRate as default)
            potentialPayout = (calculatedPaidAmount * (specificCommission.firstRate || 0)) / 100;
          }
        } else {
          // Use general commission rates based on payment installments
          const installmentsPaid = record.installmentsPaid || 0;

          if (installmentsPaid >= 4 && commissionRates.fourthRate) {
            potentialPayout = (calculatedPaidAmount * commissionRates.fourthRate) / 100;
          } else if (installmentsPaid >= 3 && commissionRates.thirdRate) {
            potentialPayout = (calculatedPaidAmount * commissionRates.thirdRate) / 100;
          } else if (installmentsPaid >= 2 && commissionRates.secondRate) {
            potentialPayout = (calculatedPaidAmount * commissionRates.secondRate) / 100;
          } else if (installmentsPaid >= 1 && commissionRates.firstRate) {
            potentialPayout = (calculatedPaidAmount * commissionRates.firstRate) / 100;
          } else {
            // Default to first rate if no installments paid yet
            potentialPayout = (record.totalFee * (commissionRates.firstRate || 0)) / 100;
          }
        }
      } else {
        // Fallback: 10% commission if no commission rates found
        potentialPayout = calculatedPaidAmount * 0.1;
      }

      // Determine enrollment status
      let enrollmentStatus = "Not Enrolled";
      if (record.application.status === "APPROVED" && record.paymentStatus === "PAID") {
        enrollmentStatus = "Enrolled";
      } else if (record.application.status === "APPROVED" && record.paymentStatus !== "PAID") {
        enrollmentStatus = "Approved - Pending Payment";
      } else if (record.application.status === "PENDING") {
        enrollmentStatus = "Application Pending";
      } else if (record.application.status === "REJECTED") {
        enrollmentStatus = "Application Rejected";
      }

      return {
        id: record.application.id,
        applicantId: record.application.applicationId || record.applicantId,
        paymentRecordId: record.id,
        paymentHistoryId: record.paymentHistories[0]?.id || "",
        fullName:
          `${record.application.personalInformation?.firstName || ""} ${record.application.personalInformation?.lastName || ""}`.trim(),
        enrollmentStatus: enrollmentStatus,
        firstPaymentStatus: firstPaymentStatus,
        academicSession: record.application.courseSelection?.session?.name || "N/A",
        potentialPayout: Math.round(potentialPayout * 100) / 100, // Round to 2 decimal places
        // Additional data for reference
        totalFee: record.totalFee,
        // receipt_url: receiptUrl || "",
        remainingAmount: record.remainingAmount,
        paidAmount: calculatedPaidAmount,
        // paymentStatus: record.paymentStatus,
        paymentStatus: record.paymentHistories.length > 0 ? "PAID" : "UNPAID",
        courseName: courseName,
        awardingBody: awardingBodyName,
        commissionGroupId: commissionGroupId,
        totalAgentStudents: totalAgentStudents,
      };
    }),
  );

  if (reqBody.sortColumn === "applicantId") {
    formattedRecords.sort((a, b) => {
      const aNum = Number(a.applicantId);
      const bNum = Number(b.applicantId);
      return reqBody.sortOrder === "desc" ? bNum - aNum : aNum - bNum;
    });
  }

  const paginationData = {
    count: paymentRecords.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    paymentRecords: formattedRecords,
    pagination: paginationData,
  };
};
const getPaymentRecordByApplication = async (applicationId: string) => {
  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      applicantId: applicationId,
    },
    include: {
      application: {
        include: {
          personalInformation: true,
          courseSelection: {
            include: {
              session: true,
              course: {
                include: {
                  course: {
                    include: {
                      awardingBody: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      paymentHistories: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      // Remove if these relations don't exist
      // agentCommissions: {
      //   include: {
      //     commissionPayments: true,
      //   },
      // },
      promotionalCode: true,
    },
  });

  return { paymentRecord };
};

const updatePaymentStatus = async (
  paymentRecordId: string,
  status: Prisma.PaymentRecordUpdateInput["paymentStatus"],
) => {
  const paymentRecord = await prisma.paymentRecord.update({
    where: {
      id: paymentRecordId,
    },
    data: {
      paymentStatus: status,
    },
    include: {
      application: {
        include: {
          personalInformation: true,
        },
      },
    },
  });

  return { paymentRecord };
};

const getCommissionRecords = async (reqBody: CommissionGetRecordsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.AgentCommissionWhereInput = {
    AND: [
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              application: {
                id: {
                  contains: reqBody.searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              application: {
                personalInformation: {
                  firstName: {
                    contains: reqBody.searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              application: {
                personalInformation: {
                  lastName: {
                    contains: reqBody.searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }),
      },
      {
        ...(reqBody.commissionStatus && {
          status: reqBody.commissionStatus,
        }),
      },
      {
        ...(reqBody.dateFrom && {
          createdAt: {
            gte: new Date(reqBody.dateFrom),
          },
        }),
      },
      {
        ...(reqBody.dateTo && {
          createdAt: {
            lte: new Date(reqBody.dateTo),
          },
        }),
      },
      {
        ...(reqBody.agentId && {
          application: {
            userPortalCategoryRoleApplications: {
              some: {
                userPortalCategoryRoleId: reqBody.agentId,
              },
            },
          },
        }),
      },
    ],
  };

  const [commissionRecords, count] = await prisma.$transaction([
    prisma.agentCommission.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        baseAmount: true,
        commissionRate: true,
        commissionAmount: true,
        status: true,
        paidAmount: true,
        paidDate: true,
        isClawback: true,
        clawbackReason: true,
        clawbackDate: true,
        createdAt: true,
        application: {
          select: {
            id: true,
            personalInformation: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            courseSelection: {
              select: {
                session: {
                  select: {
                    name: true,
                    intakePeriod: true,
                  },
                },
                course: {
                  select: {
                    courseSnapshot: true, // Use courseSnapshot
                  },
                },
              },
            },
          },
        },
        commissionPayments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    }),
    prisma.agentCommission.count({ where }),
  ]);

  const paginationData = {
    count: commissionRecords.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    commissionRecords,
    pagination: paginationData,
  };
};

// utils/invoice.ts
export const generateInvoiceNumber = (groupId: string): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const hashPart = groupId.slice(0, 6).toUpperCase();
  return `INV-${datePart}-${hashPart}`;
};

const getInvoices = async (reqBody: InvoiceGetRecordsRequestBody, userId: string) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.InvoiceWhereInput = {
    AND: [
      {
        invoiceAmount: {
          gt: 0,
        },
      },
      // Filter by user's access to applications and ONLY approved applications
      {
        paymentHistory: {
          paymentRecord: {
            paidAmount: {
              gt: 0,
            },
            application: {
              status: "APPROVED", // Only approved applications
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    userPortalCategory: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Search filters
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              invoiceNumber: {
                contains: reqBody.searchTerm,
                mode: "insensitive",
              },
            },
            {
              paymentHistory: {
                paymentRecord: {
                  application: {
                    personalInformation: {
                      firstName: {
                        contains: reqBody.searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
            {
              paymentHistory: {
                paymentRecord: {
                  application: {
                    personalInformation: {
                      lastName: {
                        contains: reqBody.searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
            {
              paymentHistory: {
                paymentRecord: {
                  applicantId: {
                    contains: reqBody.searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }),
      },
      // Status filters
      {
        ...(reqBody.invoiceStatus && {
          invoiceStatus: reqBody.invoiceStatus,
        }),
      },
      // Application ID filter
      {
        ...(reqBody.applicationId && {
          paymentHistory: {
            paymentRecord: {
              applicantId: reqBody.applicationId,
            },
          },
        }),
      },
      // Date filters
      {
        ...(reqBody.dateFrom && {
          createdAt: {
            gte: new Date(reqBody.dateFrom),
          },
        }),
      },
      {
        ...(reqBody.dateTo && {
          createdAt: {
            lte: new Date(reqBody.dateTo),
          },
        }),
      },
    ],
  };

  const [invoices, count] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceStatus: true,
        invoiceAmount: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        paymentHistory: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentDate: true,
            paymentRecord: {
              select: {
                id: true,
                applicantId: true,
                totalFee: true,
                paidAmount: true,
                remainingAmount: true,
                installmentsPaid: true,
                totalInstallments: true,
                paymentStatus: true,
                paymentPlan: true,
                application: {
                  select: {
                    id: true,
                    applicationId: true,
                    status: true,
                    personalInformation: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                    courseSelection: {
                      select: {
                        session: {
                          select: {
                            name: true,
                            intakePeriod: true,
                          },
                        },
                        course: {
                          select: {
                            courseSnapshot: true,
                          },
                        },
                        awardingBody: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                    userPortalCategoryRoleApplications: {
                      where: {
                        userPortalCategoryRole: {
                          userPortalCategory: {
                            userId: userId,
                          },
                          role: {
                            name: "agent",
                          },
                        },
                      },
                      select: {
                        userPortalCategoryRole: {
                          select: {
                            roleData: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  // Get agent's commission info for proper commission calculation
  const agentCommissionInfo = (await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategory: {
        userId: userId,
      },
      role: {
        name: "agent",
      },
    },
    select: {
      roleData: true,
    },
  })) as AgentCommissionInfo | null;

  const roleData = agentCommissionInfo?.roleData;

  // Get commissionGroupId from awardingBodyTemplates
  let commissionGroupId = null;
  if (roleData && roleData.awardingBodyTemplates && roleData?.awardingBodyTemplates?.length > 0) {
    const firstTemplateId = roleData.awardingBodyTemplates[0].commissionTemplateId;
    if (firstTemplateId) {
      const agreementTemplate = await prisma.agreementTemplate.findFirst({
        where: {
          id: firstTemplateId,
        },
        select: {
          commissionGroupId: true,
        },
      });
      commissionGroupId = agreementTemplate?.commissionGroupId;
    }
  }

  // Count total APPROVED students for this agent to determine commission tier
  const totalAgentStudents = await prisma.application.count({
    where: {
      status: "APPROVED", // Only count approved applications
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRole: {
            userPortalCategory: {
              userId: userId,
            },
            role: {
              name: "agent",
            },
          },
        },
      },
    },
  });

  // Get ALL commission ranges for this commission group
  let allCommissionRanges: Commission[] = [];
  if (commissionGroupId) {
    allCommissionRanges = await prisma.commission.findMany({
      where: {
        commissionGroupId: commissionGroupId,
      },
      orderBy: {
        studentRangeLower: "asc",
      },
    });
  }

  // Function to find applicable commission rates based on student count
  const findApplicableCommission = (studentCount: number) => {
    if (allCommissionRanges.length === 0) return null;

    // Find the range that matches the student count
    const applicableRange = allCommissionRanges.find(
      (commission) =>
        studentCount >= commission.studentRangeLower &&
        (commission.studentRangeUpper === null || studentCount <= commission.studentRangeUpper),
    );

    // If no exact range found, use the highest available range
    return applicableRange || allCommissionRanges[allCommissionRanges.length - 1];
  };

  // Get general commission rates for this agent's student count
  const generalCommissionRates = findApplicableCommission(totalAgentStudents);

  // Helper function to get commission rate by installments
  const getCommissionRateByInstallments = (
    paymentRecord: number | undefined,
    commissionRates: CommissionRates,
  ): number => {
    if (!commissionRates) return 10; // Fallback 10%

    const installmentsPaid = paymentRecord ?? 0;

    // Use installment-based rates if available, otherwise use general rates
    if (installmentsPaid === 0) {
      return commissionRates.firstRate ?? 10;
    } else if (installmentsPaid === 1) {
      return commissionRates.secondRate ?? 10;
    } else if (installmentsPaid === 2) {
      return commissionRates.thirdRate ?? 10;
    } else if (installmentsPaid >= 3) {
      return commissionRates.fourthRate ?? 10;
    }

    return commissionRates.firstRate ?? 10;
  };

  // Format the response with proper potential payout calculation
  const formattedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      const application = invoice.paymentHistory?.paymentRecord?.application;
      const courseSnapshot = application?.courseSelection?.course?.courseSnapshot as CourseResponse | undefined;
      const paymentRecord = invoice.paymentHistory?.paymentRecord;
      const awardingBodyId = application?.courseSelection?.awardingBody?.id;

      // Calculate potential payout using the same sophisticated logic
      let potentialPayout = 0;
      let earnedCommission = 0;
      let commissionRate = 0;
      let commissionSource = "general";

      // Get the role data for this specific application
      const recordRoleData = application?.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
        ?.roleData as unknown as UserPortalCategoryRoleData | undefined;
      const awardingBodyTemplates = recordRoleData?.awardingBodyTemplates || [];

      if (generalCommissionRates) {
        // Try to find specific commission for this awarding body
        const awardingBodyTemplate = awardingBodyTemplates.find(
          (template: AwardingBodyTemplate) => template.awardingBodyId === awardingBodyId,
        );

        if (awardingBodyTemplate && awardingBodyTemplate.commissionTemplateId) {
          try {
            // Get the agreement template
            const agreementTemplate = await prisma.agreementTemplate.findFirst({
              where: {
                id: awardingBodyTemplate.commissionTemplateId,
              },
              select: {
                commissionGroupId: true,
              },
            });

            if (agreementTemplate?.commissionGroupId) {
              // Get commission ranges for this specific agreement template's commission group
              const specificCommissionRanges = await prisma.commission.findMany({
                where: {
                  commissionGroupId: agreementTemplate.commissionGroupId,
                },
                orderBy: {
                  studentRangeLower: "asc",
                },
              });

              // Find applicable commission rates for this specific group
              const specificCommissionRates =
                specificCommissionRanges.find(
                  (commission) =>
                    totalAgentStudents >= commission.studentRangeLower &&
                    (commission.studentRangeUpper === null || totalAgentStudents <= commission.studentRangeUpper),
                ) || specificCommissionRanges[specificCommissionRanges.length - 1];
              if (specificCommissionRates) {
                commissionRate = getCommissionRateByInstallments(
                  paymentRecord?.installmentsPaid,
                  specificCommissionRates,
                );
                commissionSource = "specific";
              } else {
                commissionRate = getCommissionRateByInstallments(
                  paymentRecord?.installmentsPaid,
                  generalCommissionRates,
                );
                commissionSource = "general_fallback";
              }
            } else {
              commissionRate = getCommissionRateByInstallments(paymentRecord?.installmentsPaid, generalCommissionRates);
              commissionSource = "general_no_specific_group";
            }
          } catch (error) {
            commissionRate = getCommissionRateByInstallments(paymentRecord?.installmentsPaid, generalCommissionRates);
            commissionSource = "general_error";
          }
        } else {
          // No specific awarding body template found, use general rates
          commissionRate = getCommissionRateByInstallments(paymentRecord?.installmentsPaid, generalCommissionRates);
          commissionSource = "general_no_template";
        }
      } else {
        // Fallback: 10% commission if no commission rates found
        commissionRate = 10;
        commissionSource = "fallback_10_percent";
      }

      // Calculate commission payment (potential payout)
      // Use totalFee for potential commission calculation (what the agent could earn if full payment is made)
      const totalFee = paymentRecord?.totalFee || 0;
      const paidAmount = paymentRecord?.paidAmount || 0;

      potentialPayout = (totalFee * commissionRate) / 100;
      earnedCommission = (paidAmount * commissionRate) / 100;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceStatus: invoice.invoiceStatus,
        invoiceAmount: invoice.invoiceAmount,
        notes: invoice.notes,
        applicationId: paymentRecord?.applicantId,
        applicationReference: application?.applicationId,
        potentialPayout: Math.round(potentialPayout * 100) / 100,
        remainingPayout: Math.round((potentialPayout - earnedCommission) * 100) / 100,
        earnedCommission: Math.round(earnedCommission * 100) / 100,
        commissionRate: commissionRate,
        studentName: application?.personalInformation
          ? `${application.personalInformation.firstName} ${application.personalInformation.lastName}`
          : "N/A",
        studentEmail: application?.personalInformation?.email || "N/A",
        courseName: courseSnapshot?.title || "N/A",
        session: application?.courseSelection?.session?.name || "N/A",
        awardingBody: application?.courseSelection?.awardingBody?.name || "N/A",
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        paymentDate: invoice.paymentHistory?.paymentDate,
        // Additional useful fields
        paidAmount: paidAmount,
        totalFee: totalFee,
        remainingAmount: paymentRecord?.remainingAmount || 0,
        paymentStatus: paymentRecord?.paymentStatus || "PENDING",
        installmentsPaid: paymentRecord?.installmentsPaid || 0,
        totalInstallments: paymentRecord?.totalInstallments || 0,
        paymentPlan: paymentRecord?.paymentPlan || "ONE_TIME",
        applicationStatus: application?.status || "PENDING",
        commissionSource: commissionSource,
        totalAgentStudents: totalAgentStudents,
        hasMatchingAwardingBody: !!awardingBodyTemplates.find(
          (t: AwardingBodyTemplate) => t.awardingBodyId === awardingBodyId,
        ),
      };
    }),
  );

  const paginationData = {
    count: invoices.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    invoices: formattedInvoices,
    pagination: paginationData,
  };
};

const getInvoicesByApplication = async (applicationId: string) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      paymentHistory: {
        paymentRecord: {
          applicantId: applicationId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      paymentHistory: {
        include: {
          paymentRecord: {
            include: {
              application: {
                include: {
                  personalInformation: true,
                  courseSelection: {
                    include: {
                      session: true,
                      course: {
                        include: {
                          course: {
                            include: {
                              awardingBody: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return { invoices };
};

interface CreateInvoiceInput {
  applicationId: string;
  requestedPayout: number;
  notes?: string;
}

type InvoiceResult = Awaited<ReturnType<typeof createInvoice>>;
interface BulkInvoiceResult {
  created: InvoiceResult[];
  errors: { applicationId: string; error: string }[];
}

export const createInvoice = async (data: CreateInvoiceInput & { invoiceNumber: string }, userId: string) => {
  const { applicationId, requestedPayout, notes, invoiceNumber } = data;

  // 1️⃣ Validate application & user access
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRole: {
            userPortalCategory: {
              userId: userId,
            },
          },
        },
      },
    },
    include: {
      personalInformation: true,
      paymentRecords: {
        include: {
          paymentHistories: {
            orderBy: { paymentDate: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!application) {
    throw new AppError("Application not found or access denied", "NOT_FOUND", 404);
  }

  // 2️⃣ Validate payment record
  if (!application.paymentRecords || application.paymentRecords.length === 0) {
    throw new AppError("Payment record not found for this application", "NOT_FOUND", 404);
  }

  const paymentRecord = application.paymentRecords[0];
  const latestPaymentHistory = paymentRecord.paymentHistories[0];

  if (!latestPaymentHistory) {
    throw new AppError("No payment history found for this payment record", "NOT_FOUND", 404);
  }

  // 3️⃣ Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceAmount: requestedPayout,
      notes,
      invoiceStatus: "PENDING",
      paymentHistoryId: latestPaymentHistory.id,
    },
    include: {
      paymentHistory: {
        include: {
          paymentRecord: {
            include: {
              application: {
                include: {
                  personalInformation: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { invoice };
};

const createBulkInvoices = async (invoicesData: CreateInvoiceInput[], userId: string): Promise<BulkInvoiceResult> => {
  const created: InvoiceResult[] = [];
  const errors: { applicationId: string; error: string }[] = [];

  // 1️⃣ Keep track of invoice numbers per application
  const invoiceMap = new Map<string, string>();

  for (const item of invoicesData) {
    try {
      // Reuse invoice number if already generated for this application
      let invoiceNumber = invoiceMap.get(item.applicationId);
      if (!invoiceNumber) {
        invoiceNumber = generateInvoiceNumber(item.applicationId);
        invoiceMap.set(item.applicationId, invoiceNumber);
      }

      const result = await createInvoice({ ...item, invoiceNumber }, userId);
      created.push(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push({ applicationId: item.applicationId, error: errorMessage });
    }
  }

  return { created, errors };
};

const updateInvoice = async (invoiceId: string, data: UpdateInvoiceInput) => {
  const invoice = await prisma.invoice.findFirst({
    where: { OR: [{ id: invoiceId }, { invoiceNumber: invoiceId }] },
  });

  if (!invoice) {
    throw new AppError("Invoice not found", "NOT_FOUND", 404);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      invoiceStatus: data.invoiceStatus,
      invoiceAmount: data.invoiceAmount,
      notes: data.notes,
    },
    include: {
      paymentHistory: {
        include: {
          paymentRecord: {
            include: {
              application: {
                include: {
                  personalInformation: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { invoice: updatedInvoice };
};

const updateMultipleInvoicesPaidStatus = async (input: UpdateMultipleInvoicesPaidStatusInput) => {
  const { invoiceIds, invoiceStatus } = input;

  // First, verify all invoices exist
  const existingInvoices = await prisma.invoice.findMany({
    where: {
      id: {
        in: invoiceIds,
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceStatus: true,
    },
  });

  if (existingInvoices.length === 0) {
    throw new AppError("No invoices found with the provided IDs", "NOT_FOUND", 404);
  }

  const foundIds = existingInvoices.map((inv) => inv.id);
  const notFoundIds = invoiceIds.filter((id) => !foundIds.includes(id));

  // Update only invoice is_paid status in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Bulk update all invoices
    const updateResult = await tx.invoice.updateMany({
      where: {
        id: {
          in: foundIds,
        },
      },
      data: {
        invoiceStatus: invoiceStatus,
        updatedAt: new Date(),
      },
    });

    // Get the updated invoices for response
    const updatedInvoices = await tx.invoice.findMany({
      where: {
        id: {
          in: foundIds,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceStatus: true,
        updatedAt: true,
      },
    });

    return {
      updatedCount: updateResult.count,
      updatedInvoices,
      notFoundIds,
    };
  });

  return result;
};

const getInvoiceById = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ id: invoiceId }, { invoiceNumber: invoiceId }],
    },
    include: {
      paymentHistory: {
        include: {
          paymentRecord: {
            include: {
              application: {
                include: {
                  personalInformation: true,
                  courseSelection: {
                    include: {
                      session: true,
                      course: {
                        include: {
                          course: {
                            include: {
                              awardingBody: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              paymentHistories: {
                orderBy: {
                  paymentDate: "desc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError("Invoice not found", "NOT_FOUND", 404);
  }

  return { invoice };
};

const getAgentsFromPaymentHistory = async (reqBody: PaymentHistoryAgentsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.PaymentHistoryWhereInput = {
    AND: [
      // Ensure we only get records with agent associations and APPROVED applications
      {
        paymentRecord: {
          application: {
            status: "APPROVED", // Only approved applications
            userPortalCategoryRoleApplications: {
              some: {
                userPortalCategoryRole: {
                  role: {
                    name: "agent",
                  },
                },
              },
            },
          },
        },
      },
      // Search filters
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              paymentRecord: {
                application: {
                  userPortalCategoryRoleApplications: {
                    some: {
                      userPortalCategoryRole: {
                        userPortalCategory: {
                          user: {
                            OR: [
                              {
                                firstName: {
                                  contains: reqBody.searchTerm,
                                  mode: "insensitive",
                                },
                              },
                              {
                                lastName: {
                                  contains: reqBody.searchTerm,
                                  mode: "insensitive",
                                },
                              },
                              {
                                agentUser: {
                                  contains: reqBody.searchTerm,
                                  mode: "insensitive",
                                },
                              },
                              {
                                agentEmail: {
                                  contains: reqBody.searchTerm,
                                  mode: "insensitive",
                                },
                              },
                              {
                                email: {
                                  contains: reqBody.searchTerm,
                                  mode: "insensitive",
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        }),
      },
    ],
  };

  // Get distinct agent IDs first to count properly - ONLY for approved applications
  const distinctAgentRecords = await prisma.paymentHistory.findMany({
    where,
    distinct: ["paymentRecordId"],
    select: {
      id: true,
      paymentRecord: {
        select: {
          application: {
            select: {
              userPortalCategoryRoleApplications: {
                where: {
                  userPortalCategoryRole: {
                    role: {
                      name: "agent",
                    },
                  },
                },
                select: {
                  userPortalCategoryRole: {
                    select: {
                      userPortalCategory: {
                        select: {
                          user: {
                            select: {
                              id: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Extract unique agent IDs
  const agentIds = distinctAgentRecords
    .map(
      (record) =>
        record.paymentRecord.application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
          ?.userPortalCategory?.user?.id,
    )
    .filter((id): id is string => id !== undefined)
    .filter((id, index, self) => self.indexOf(id) === index);

  const totalDistinctAgents = agentIds.length;

  // Now get the paginated data
  const paymentHistories = await prisma.paymentHistory.findMany({
    where,
    skip: offset,
    take: limit,
    orderBy: {
      paymentDate: "desc",
    },
    distinct: ["paymentRecordId"],
    select: {
      id: true,
      paymentRecord: {
        select: {
          id: true,
          totalFee: true,
          paidAmount: true,
          paymentStatus: true,
          installmentsPaid: true,
          totalInstallments: true,
          application: {
            select: {
              id: true,
              status: true,
              userPortalCategoryRoleApplications: {
                where: {
                  userPortalCategoryRole: {
                    role: {
                      name: "agent",
                    },
                  },
                },
                select: {
                  userPortalCategoryRole: {
                    select: {
                      userPortalCategory: {
                        select: {
                          user: {
                            select: {
                              id: true,
                              firstName: true,
                              lastName: true,
                              agentUser: true,
                              agentEmail: true,
                              email: true,
                              mobile: true,
                              createdAt: true,
                            },
                          },
                        },
                      },
                      roleData: true,
                    },
                  },
                },
              },
              courseSelection: {
                select: {
                  awardingBody: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  session: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      amount: true,
      paymentDate: true,
      status: true,
    },
  });

  // Extract and format agent information with required fields
  const agents = await Promise.all(
    paymentHistories.map(async (history) => {
      const agentInfo =
        history.paymentRecord.application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
          ?.userPortalCategory?.user;

      const roleData = history.paymentRecord.application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole
        ?.roleData as unknown as UserPortalCategoryRoleData | undefined;

      if (!agentInfo) return null;

      const agentId = agentInfo.id;

      // Get agent's commission info for proper commission calculation
      const agentCommissionInfo = (await prisma.userPortalCategoryRole.findFirst({
        where: {
          userPortalCategory: {
            userId: agentId,
          },
          role: {
            name: "agent",
          },
        },
        select: {
          roleData: true,
        },
      })) as AgentCommissionInfo | null;

      const agentRoleData = agentCommissionInfo?.roleData;

      // Get commissionGroupId from awardingBodyTemplates
      let commissionGroupId = null;
      if (agentRoleData && agentRoleData?.awardingBodyTemplates?.length > 0) {
        const firstTemplateId = agentRoleData.awardingBodyTemplates[0].commissionTemplateId;
        if (firstTemplateId) {
          const agreementTemplate = await prisma.agreementTemplate.findFirst({
            where: {
              id: firstTemplateId,
            },
            select: {
              commissionGroupId: true,
            },
          });
          commissionGroupId = agreementTemplate?.commissionGroupId;
        }
      }

      // Count total APPROVED students for this agent to determine commission tier
      const totalStudents = await prisma.application.count({
        where: {
          status: "APPROVED",
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRole: {
                userPortalCategory: {
                  user: {
                    id: agentId,
                  },
                },
                role: {
                  name: "agent",
                },
              },
            },
          },
        },
      });

      // Get ALL commission ranges for this commission group
      let allCommissionRanges: CommissionRates[] = [];
      if (commissionGroupId) {
        allCommissionRanges = await prisma.commission.findMany({
          where: {
            commissionGroupId: commissionGroupId,
          },
          orderBy: {
            studentRangeLower: "asc",
          },
        });
      }

      // Function to find applicable commission rates based on student count
      const findApplicableCommission = (studentCount: number): CommissionRates | null => {
        if (allCommissionRanges.length === 0) return null;

        const applicableRange = allCommissionRanges.find(
          (commission) =>
            studentCount >= commission.studentRangeLower &&
            (commission.studentRangeUpper === null || studentCount <= commission.studentRangeUpper),
        );

        return applicableRange || allCommissionRanges[allCommissionRanges.length - 1];
      };

      // Get general commission rates for this agent's student count
      const generalCommissionRates = findApplicableCommission(totalStudents);

      // Helper function to get commission rate by installments
      const getCommissionRateByInstallments = (
        paymentRecord: number | undefined,
        commissionRates: CommissionRates,
      ): number => {
        // console.log("paymentRecord",paymentRecord)
        if (!commissionRates) return 10; // Fallback 10%

        const installmentsPaid = paymentRecord ?? 0;

        if (installmentsPaid === 0) {
          return commissionRates.firstRate ?? 10;
        } else if (installmentsPaid === 1) {
          return commissionRates.secondRate ?? 10;
        } else if (installmentsPaid === 2) {
          return commissionRates.thirdRate ?? 10;
        } else if (installmentsPaid >= 3) {
          return commissionRates.fourthRate ?? 10;
        }

        return commissionRates.firstRate || 10;
      };

      // Calculate potential commission using the same logic as before
      let potentialCommission = 0;

      // Get all payment records for this agent's approved applications
      const agentPaymentRecords = await prisma.paymentRecord.findMany({
        where: {
          application: {
            status: "APPROVED",
            userPortalCategoryRoleApplications: {
              some: {
                userPortalCategoryRole: {
                  userPortalCategory: {
                    user: {
                      id: agentId,
                    },
                  },
                  role: {
                    name: "agent",
                  },
                },
              },
            },
          },
          paymentStatus: "PAID",
        },
        select: {
          id: true,
          totalFee: true,
          paidAmount: true,
          paymentStatus: true,
          installmentsPaid: true,
          totalInstallments: true,
          application: {
            select: {
              courseSelection: {
                select: {
                  awardingBody: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Calculate commission for each payment record
      for (const paymentRecord of agentPaymentRecords) {
        let commissionRate = 0;
        const awardingBodyId = paymentRecord.application.courseSelection?.awardingBody?.id;

        if (generalCommissionRates) {
          // Try to find specific commission for this awarding body
          const awardingBodyTemplates = agentRoleData?.awardingBodyTemplates || [];
          const awardingBodyTemplate = awardingBodyTemplates.find(
            (template: AwardingBodyTemplate) => template.awardingBodyId === awardingBodyId,
          );

          if (awardingBodyTemplate && awardingBodyTemplate.commissionTemplateId) {
            try {
              const agreementTemplate = await prisma.agreementTemplate.findFirst({
                where: {
                  id: awardingBodyTemplate.commissionTemplateId,
                },
                select: {
                  commissionGroupId: true,
                },
              });

              if (agreementTemplate?.commissionGroupId) {
                const specificCommissionRanges = await prisma.commission.findMany({
                  where: {
                    commissionGroupId: agreementTemplate.commissionGroupId,
                  },
                  orderBy: {
                    studentRangeLower: "asc",
                  },
                });

                const specificCommissionRates =
                  specificCommissionRanges.find(
                    (commission) =>
                      totalStudents >= commission.studentRangeLower &&
                      (commission.studentRangeUpper === null || totalStudents <= commission.studentRangeUpper),
                  ) || specificCommissionRanges[specificCommissionRanges.length - 1];

                if (specificCommissionRates) {
                  commissionRate = getCommissionRateByInstallments(
                    paymentRecord?.installmentsPaid,
                    specificCommissionRates,
                  );
                } else {
                  commissionRate = getCommissionRateByInstallments(
                    paymentRecord?.installmentsPaid,
                    generalCommissionRates,
                  );
                }
              } else {
                commissionRate = getCommissionRateByInstallments(
                  paymentRecord?.installmentsPaid,
                  generalCommissionRates,
                );
              }
            } catch (error) {
              commissionRate = getCommissionRateByInstallments(paymentRecord?.installmentsPaid, generalCommissionRates);
            }
          } else {
            commissionRate = getCommissionRateByInstallments(paymentRecord?.installmentsPaid, generalCommissionRates);
          }
        } else {
          commissionRate = 10; // Fallback 10%
        }

        // Calculate commission payment (potential commission)
        const commissionPayment = (paymentRecord.totalFee * commissionRate) / 100;
        potentialCommission += commissionPayment;
      }

      // Calculate clawback (refunded/rejected payments) - ONLY for approved applications
      const clawbackData = await prisma.paymentHistory.aggregate({
        where: {
          paymentRecord: {
            application: {
              status: "APPROVED",
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    userPortalCategory: {
                      user: {
                        id: agentId,
                      },
                    },
                    role: {
                      name: "agent",
                    },
                  },
                },
              },
            },
          },
          status: {},
        },
        _sum: {
          amount: true,
        },
      });

      const clawback = clawbackData._sum.amount || 0;

      // Get commission tier
      const commissionTier = await getCommissionTier(
        agentRoleData?.awardingBodyTemplates?.[0]?.commissionTemplateId ?? null,
        totalStudents,
      );

      // Get academic session from course selection
      const academicSession = history.paymentRecord.application.courseSelection?.session?.name || "N/A";

      // Determine agent status based on recent payment activity
      const recentPayment = await prisma.paymentHistory.findFirst({
        where: {
          paymentRecord: {
            application: {
              status: "APPROVED",
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    userPortalCategory: {
                      user: {
                        id: agentId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
        select: {
          status: true,
          paymentDate: true,
          invoices: {
            select: {
              invoiceAmount: true,
            },
          },
        },
      });

      const invoiceSumPerAgent = await prisma.invoice.aggregate({
        where: {
          paymentHistory: {
            paymentRecord: {
              application: {
                status: "APPROVED",
                userPortalCategoryRoleApplications: {
                  some: {
                    userPortalCategoryRole: {
                      userPortalCategory: {
                        user: { id: agentId },
                      },
                      role: { name: "agent" },
                    },
                  },
                },
              },
            },
          },
        },
        _sum: {
          invoiceAmount: true,
        },
      });
      const totalInvoiceAmount = invoiceSumPerAgent._sum.invoiceAmount ?? 0;

      let status = "INACTIVE";
      if (recentPayment) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (recentPayment.paymentDate > thirtyDaysAgo) {
          status = "ACTIVE";
        } else {
          status = "DORMANT";
        }
      }

      return {
        agentId: agentId,
        agentName: agentInfo.agentUser || `${agentInfo.firstName} ${agentInfo.lastName}`,
        commissionTier: commissionTier,
        totalStudent: totalStudents,
        academicSession: academicSession,
        clawback: Math.round(clawback * 100) / 100,
        potentialCommission: Math.round(potentialCommission * 100) / 100,
        totalInvoiceAmount: totalInvoiceAmount,
        status: status,
      };
    }),
  );

  // Filter out nulls and remove duplicates
  const filteredAgents = agents
    .filter((agent): agent is NonNullable<typeof agent> => agent !== null)
    .filter((agent, index, self) => index === self.findIndex((a) => a.agentId === agent.agentId));

  const paginationData = {
    count: filteredAgents.length,
    total: totalDistinctAgents,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(totalDistinctAgents / limit),
  };

  return {
    agents: filteredAgents,
    pagination: paginationData,
  };
};

const getInvoicesForAgentsFromApplication = async (reqBody: PaymentHistoryAgentsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.InvoiceWhereInput = {
    AND: [
      {
        paymentHistory: {
          paymentRecord: {
            application: {
              status: "APPROVED",
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    role: {
                      name: "agent",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              paymentHistory: {
                paymentRecord: {
                  application: {
                    status: "APPROVED",
                    userPortalCategoryRoleApplications: {
                      some: {
                        userPortalCategoryRole: {
                          role: { name: "agent" },
                          userPortalCategory: {
                            user: {
                              OR: [
                                {
                                  firstName: {
                                    contains: reqBody.searchTerm,
                                    mode: "insensitive",
                                  },
                                },
                                {
                                  lastName: {
                                    contains: reqBody.searchTerm,
                                    mode: "insensitive",
                                  },
                                },
                                {
                                  agentUser: {
                                    contains: reqBody.searchTerm,
                                    mode: "insensitive",
                                  },
                                },
                                {
                                  agentEmail: {
                                    contains: reqBody.searchTerm,
                                    mode: "insensitive",
                                  },
                                },
                                {
                                  email: {
                                    contains: reqBody.searchTerm,
                                    mode: "insensitive",
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        }),
      },
    ],
  };

  const distinctAgentRecords = await prisma.invoice.findMany({
    where,
    skip: offset,
    take: limit,
    select: {
      paymentHistory: {
        select: {
          paymentRecord: {
            select: {
              id: true,
              totalFee: true,
              paidAmount: true,
              paymentStatus: true,
              installmentsPaid: true,
              totalInstallments: true,
              application: {
                select: {
                  id: true,
                  status: true,
                  userPortalCategoryRoleApplications: {
                    where: {
                      userPortalCategoryRole: {
                        role: {
                          name: "agent",
                        },
                      },
                    },
                    select: {
                      userPortalCategoryRole: {
                        select: {
                          roleData: true,
                          userPortalCategory: {
                            select: {
                              user: {
                                select: {
                                  id: true,
                                  firstName: true,
                                  lastName: true,
                                  agentUser: true,
                                  agentEmail: true,
                                  email: true,
                                  mobile: true,
                                  createdAt: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  courseSelection: {
                    select: {
                      awardingBody: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                      session: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const users = distinctAgentRecords.flatMap((inv) =>
    inv.paymentHistory?.paymentRecord.application.userPortalCategoryRoleApplications.map((app) => {
      return {
        user: app.userPortalCategoryRole.userPortalCategory.user,
        roleData: app.userPortalCategoryRole.roleData,
        paymentRecordId: inv.paymentHistory?.paymentRecord?.id,
        application: inv.paymentHistory?.paymentRecord.application,
      };
    }),
  );

  const uniqueUsers = users.filter(
    (user, index, self) => self.findIndex((u) => u?.user.id === user?.user.id) === index,
  );

  const agents = await Promise.all(
    uniqueUsers.map(async (u) => {
      if (!u?.application) return null;
      const { user, roleData, application } = u;
      const agentId = user.id;

      const totalStudents = await prisma.application.count({
        where: {
          status: "APPROVED",
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRole: {
                userPortalCategory: { user: { id: agentId } },
                role: { name: "agent" },
              },
            },
          },
        },
      });
      let potentialCommission = 0;

      const parsedRoleData = typeof roleData === "string" ? JSON.parse(roleData) : roleData;
      const awardingBodyTemplates = (parsedRoleData as UserPortalCategoryRoleData)?.awardingBodyTemplates || [];

      const commissionTiers = await Promise.all(
        awardingBodyTemplates.map(async (template) => {
          const commissionTemplateId = template?.status === "ACTIVE" ? template?.commissionTemplateId : null;

          const tier = await getCommissionTier(commissionTemplateId, totalStudents);

          if (tier === "No Tier") return null;

          return {
            commissionTemplateId,
            tier,
          };
        }),
      );
      for (const template of awardingBodyTemplates) {
        if (!template.commissionTemplateId) continue;

        const agreementTemplate = await prisma.agreementTemplate.findFirst({
          where: { id: template.commissionTemplateId },
          select: { commissionGroupId: true },
        });

        if (!agreementTemplate?.commissionGroupId) continue;

        const commissionRanges = await prisma.commission.findMany({
          where: { commissionGroupId: agreementTemplate.commissionGroupId },
          orderBy: { studentRangeLower: "asc" },
        });

        const applicableRange =
          commissionRanges.find(
            (c) =>
              totalStudents >= c.studentRangeLower &&
              (c.studentRangeUpper === null || totalStudents <= c.studentRangeUpper),
          ) || commissionRanges[commissionRanges.length - 1];

        const agentPaymentRecords = await prisma.paymentRecord.findMany({
          where: {
            application: {
              status: "APPROVED",
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: { userPortalCategory: { user: { id: agentId } }, role: { name: "agent" } },
                },
              },
            },
            paymentStatus: "PAID",
          },
          select: { totalFee: true, installmentsPaid: true },
        });

        for (const payment of agentPaymentRecords) {
          const installmentsPaid = payment.installmentsPaid ?? 0;
          let rate = 10;

          if (applicableRange) {
            if (installmentsPaid === 0) rate = applicableRange.firstRate ?? 10;
            else if (installmentsPaid === 1) rate = applicableRange.secondRate ?? 10;
            else if (installmentsPaid === 2) rate = applicableRange.thirdRate ?? 10;
            else if (installmentsPaid >= 3) rate = applicableRange.fourthRate ?? 10;
          }

          potentialCommission += (payment.totalFee * rate) / 100;
        }
      }

      const clawbackData = await prisma.paymentHistory.aggregate({
        where: {
          paymentRecord: {
            application: {
              status: "APPROVED",
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: { userPortalCategory: { user: { id: agentId } }, role: { name: "agent" } },
                },
              },
            },
          },
        },
        _sum: { amount: true },
      });

      const clawback = clawbackData._sum.amount || 0;

      const academicSession = application.courseSelection?.session?.name || "N/A";

      const recentPayment = await prisma.paymentHistory.findFirst({
        where: {
          paymentRecord: {
            application: {
              status: "APPROVED",
              userPortalCategoryRoleApplications: {
                some: { userPortalCategoryRole: { userPortalCategory: { user: { id: agentId } } } },
              },
            },
          },
        },
        orderBy: { paymentDate: "desc" },
        select: { paymentDate: true },
      });

      let status = "INACTIVE";
      if (recentPayment) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        status = recentPayment.paymentDate > thirtyDaysAgo ? "ACTIVE" : "DORMANT";
      }

      const invoiceSum = await prisma.invoice.aggregate({
        where: {
          paymentHistory: {
            paymentRecord: {
              application: {
                status: "APPROVED",
                userPortalCategoryRoleApplications: {
                  some: {
                    userPortalCategoryRole: { userPortalCategory: { user: { id: agentId } }, role: { name: "agent" } },
                  },
                },
              },
            },
          },
        },
        _sum: { invoiceAmount: true },
      });

      const totalInvoiceAmount = invoiceSum._sum.invoiceAmount ?? 0;
      return {
        agentId,
        agentName: user.agentUser || `${user.firstName} ${user.lastName}`,
        totalStudent: totalStudents,
        academicSession,
        // clawback: Math.round(clawback * 100) / 100,
        potentialCommission: Math.round(potentialCommission * 100) / 100,
        status,
        totalInvoiceAmount,
        commissionTiers,
      };
    }),
  );

  const paginationData = {
    count: agents.length,
    total: uniqueUsers.length,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(uniqueUsers.length / limit),
  };

  return {
    agents,
    pagination: paginationData,
  };
};

// Add the helper function for commission tier
const getCommissionTier = async (commissionTemplateId: string | null, totalStudents: number): Promise<string> => {
  if (!commissionTemplateId) {
    return "No Tier";
  }

  const commissionRates = await prisma.commission.findFirst({
    where: {
      commissionGroup: {
        agreementTemplate: {
          some: {
            id: commissionTemplateId,
          },
        },
      },
      studentRangeLower: {
        lte: totalStudents,
      },
      OR: [
        {
          studentRangeUpper: {
            gte: totalStudents,
          },
        },
        {
          studentRangeUpper: null,
        },
      ],
    },
    orderBy: {
      studentRangeLower: "desc",
    },
  });

  if (!commissionRates) {
    return "No Tier";
  }

  if (commissionRates.studentRangeUpper) {
    return `Tier ${commissionRates.studentRangeLower}-${commissionRates.studentRangeUpper}`;
  } else {
    return `Tier ${commissionRates.studentRangeLower}+`;
  }
};
const updateInvoiceStatus = async (input: UpdateInvoiceStatusInput) => {
  const { invoiceIds, invoiceStatus, notes, processedBy } = input;

  // First, check if all invoices exist with detailed logging
  const existingInvoices = await prisma.invoice.findMany({
    where: {
      id: {
        in: invoiceIds,
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceStatus: true,
    },
  });

  // Check if all requested invoices were found
  if (existingInvoices.length !== invoiceIds.length) {
    const foundInvoiceNumbers = existingInvoices.map((inv) => inv.invoiceNumber);
    const missingInvoices = invoiceIds.filter((id) => !foundInvoiceNumbers.includes(id));
    throw new AppError(`Invoices not found: ${missingInvoices.join(", ")}`, "NOT_FOUND", 404);
  }

  // Update invoices in a single transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update the invoices using invoiceNumber
    const updatedInvoices = await tx.invoice.updateMany({
      where: {
        id: {
          in: invoiceIds,
        },
      },
      data: {
        invoiceStatus,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    });

    return {
      updatedCount: updatedInvoices.count,
      invoiceIds,
      invoiceStatus,
      notes: notes || undefined,
    };
  });

  return result;
};

const getUserInvoices = async (userId: string, reqBody: GetInvoiceWithUserIdBody) => {
  // Get agent's commission info for proper commission calculation
  const agentCommissionInfo = (await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategory: {
        userId: userId,
      },
      role: {
        name: "agent",
      },
    },
    select: {
      roleData: true,
    },
  })) as AgentCommissionInfo | null;

  const roleData = agentCommissionInfo?.roleData;

  // Get commissionGroupId from awardingBodyTemplates
  let commissionGroupId = null;
  if (roleData && roleData?.awardingBodyTemplates && roleData?.awardingBodyTemplates?.length > 0) {
    const firstTemplateId = roleData.awardingBodyTemplates[0].commissionTemplateId;
    if (firstTemplateId) {
      const agreementTemplate = await prisma.agreementTemplate.findFirst({
        where: {
          id: firstTemplateId,
        },
        select: {
          commissionGroupId: true,
        },
      });
      commissionGroupId = agreementTemplate?.commissionGroupId;
    }
  }

  // Count total APPROVED students for this agent to determine commission tier
  const totalAgentStudents = await prisma.application.count({
    where: {
      status: "APPROVED", // Only count approved applications
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRole: {
            userPortalCategory: { userId },
            role: { name: "agent" },
          },
        },
      },
    },
  });

  // Get ALL commission ranges for this commission group
  let allCommissionRanges: CommissionRates[] = [];
  if (commissionGroupId) {
    allCommissionRanges = await prisma.commission.findMany({
      where: {
        commissionGroupId: commissionGroupId,
      },
      orderBy: {
        studentRangeLower: "asc",
      },
    });
  }

  // Function to find applicable commission rates based on student count
  const findApplicableCommission = (studentCount: number): CommissionRates | null => {
    if (allCommissionRanges.length === 0) return null;

    // Find the range that matches the student count
    const applicableRange = allCommissionRanges.find(
      (commission) =>
        studentCount >= commission.studentRangeLower &&
        (commission.studentRangeUpper === null || studentCount <= commission.studentRangeUpper),
    );

    // If no exact range found, use the highest available range
    return applicableRange || allCommissionRanges[allCommissionRanges.length - 1];
  };

  // Get general commission rates for this agent's student count
  const generalCommissionRates = findApplicableCommission(totalAgentStudents);

  // Helper function to get commission rate by installments
  const getCommissionRateByInstallments = (
    paymentRecord: number | undefined,
    commissionRates: CommissionRates,
  ): number => {
    if (!commissionRates) return 10; // Fallback 10%

    const installmentsPaid = paymentRecord ?? 0;

    // Use installment-based rates if available, otherwise use general rates
    if (installmentsPaid === 0) {
      return commissionRates.firstRate ?? 10;
    } else if (installmentsPaid === 1) {
      return commissionRates.secondRate ?? 10;
    } else if (installmentsPaid === 2) {
      return commissionRates.thirdRate ?? 10;
    } else if (installmentsPaid >= 3) {
      return commissionRates.fourthRate ?? 10;
    }

    return commissionRates.firstRate || 10;
  };

  const [invoices] = await prisma.$transaction([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        paymentHistory: {
          paymentRecord: {
            application: {
              status: "APPROVED", // Only approved applications
              ...(reqBody.sessionId && {
                courseSelection: {
                  session: {
                    id: reqBody.sessionId,
                  },
                },
              }),
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    userPortalCategory: { userId },
                    role: { name: "agent" },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceStatus: true,
        invoiceAmount: true,
        createdAt: true,
        paymentHistory: {
          select: {
            status: true,
            paymentDate: true,
            paymentRecord: {
              select: {
                id: true,
                applicantId: true,
                totalFee: true,
                paidAmount: true,
                remainingAmount: true,
                paymentStatus: true,
                installmentsPaid: true,
                totalInstallments: true,
                paymentPlan: true,
                application: {
                  select: {
                    id: true,
                    applicationId: true,
                    status: true,
                    personalInformation: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                    courseSelection: {
                      select: {
                        session: { select: { name: true, id: true } },
                        course: { select: { courseSnapshot: true } },
                        awardingBody: { select: { name: true, id: true } },
                      },
                    },
                    userPortalCategoryRoleApplications: {
                      where: {
                        userPortalCategoryRole: {
                          userPortalCategory: { userId },
                          role: { name: "agent" },
                        },
                      },
                      select: {
                        userPortalCategoryRole: { select: { roleData: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const formattedRecords = await Promise.all(
    invoices.map(async (invoice) => {
      const ph = invoice.paymentHistory;
      const pr = ph?.paymentRecord;
      const app = pr?.application;
      const courseSnapshot = app?.courseSelection?.course?.courseSnapshot as CourseResponse | undefined;
      const awardingBodyId = app?.courseSelection?.awardingBody?.id;

      // Calculate potential payout using the same sophisticated logic
      let potentialPayout = 0;
      let earnedCommission = 0;
      let commissionRate = 0;
      let commissionSource = "general";

      // Get the role data for this specific application
      // const recordRoleData = app?.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole?.roleData as any;
      const recordRoleData = app?.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole?.roleData as unknown as
        | UserPortalCategoryRoleData
        | undefined;
      const awardingBodyTemplates = recordRoleData?.awardingBodyTemplates || [];

      if (generalCommissionRates) {
        // Try to find specific commission for this awarding body
        const awardingBodyTemplate = awardingBodyTemplates.find(
          (template: AwardingBodyTemplate) => template.awardingBodyId === awardingBodyId,
        );

        if (awardingBodyTemplate && awardingBodyTemplate.commissionTemplateId) {
          try {
            // Get the agreement template
            const agreementTemplate = await prisma.agreementTemplate.findFirst({
              where: {
                id: awardingBodyTemplate.commissionTemplateId,
              },
              select: {
                commissionGroupId: true,
              },
            });

            if (agreementTemplate?.commissionGroupId) {
              // Get commission ranges for this specific agreement template's commission group
              const specificCommissionRanges = await prisma.commission.findMany({
                where: {
                  commissionGroupId: agreementTemplate.commissionGroupId,
                },
                orderBy: {
                  studentRangeLower: "asc",
                },
              });

              // Find applicable commission rates for this specific group
              const specificCommissionRates =
                specificCommissionRanges.find(
                  (commission) =>
                    totalAgentStudents >= commission.studentRangeLower &&
                    (commission.studentRangeUpper === null || totalAgentStudents <= commission.studentRangeUpper),
                ) || specificCommissionRanges[specificCommissionRanges.length - 1];
              // console.log("PRPRPRPRPRP", pr);
              if (specificCommissionRates) {
                commissionRate = getCommissionRateByInstallments(pr?.installmentsPaid, specificCommissionRates);
                commissionSource = "specific";
              } else {
                commissionRate = getCommissionRateByInstallments(pr?.installmentsPaid, generalCommissionRates);
                commissionSource = "general_fallback";
              }
            } else {
              commissionRate = getCommissionRateByInstallments(pr?.installmentsPaid, generalCommissionRates);
              commissionSource = "general_no_specific_group";
            }
          } catch (error) {
            commissionRate = getCommissionRateByInstallments(pr?.installmentsPaid, generalCommissionRates);
            commissionSource = "general_error";
          }
        } else {
          // No specific awarding body template found, use general rates
          commissionRate = getCommissionRateByInstallments(pr?.installmentsPaid, generalCommissionRates);
          commissionSource = "general_no_template";
        }
      } else {
        // Fallback: 10% commission if no commission rates found
        commissionRate = 10;
        commissionSource = "fallback_10_percent";
      }

      // Calculate commission payment (potential payout)
      const totalFee = pr?.totalFee || 0;
      const paidAmount = pr?.paidAmount || 0;

      potentialPayout = (totalFee * commissionRate) / 100;
      earnedCommission = (paidAmount * commissionRate) / 100;

      // Determine enrollment status
      let enrollmentStatus = "Not Enrolled";
      if (app?.status === "APPROVED" && pr?.paymentStatus === "PAID") {
        enrollmentStatus = "Enrolled";
      } else if (app?.status === "APPROVED" && pr?.paymentStatus !== "PAID") {
        enrollmentStatus = "Approved - Pending Payment";
      } else if (app?.status === "PENDING") {
        enrollmentStatus = "Application Pending";
      } else if (app?.status === "REJECTED") {
        enrollmentStatus = "Application Rejected";
      }

      return {
        id: app?.id || "N/A",
        applicantId: app?.applicationId || pr?.applicantId || "N/A",
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber || "N/A",
        invoiceStatus: invoice.invoiceStatus || "PENDING",
        fullName: `${app?.personalInformation?.firstName || ""} ${app?.personalInformation?.lastName || ""}`.trim(),
        enrollmentStatus,
        firstPaymentStatus: ph?.status || "PENDING",
        academicSessionId: app?.courseSelection?.session?.id || "N/A",
        academicSession: app?.courseSelection?.session?.name || "N/A",
        potentialPayout: Math.round(potentialPayout * 100) / 100,
        earnedCommission: Math.round(earnedCommission * 100) / 100,
        commissionRate: commissionRate,
        totalFee: totalFee,
        paidAmount: paidAmount,
        remainingAmount: pr?.remainingAmount || 0,
        paymentStatus: pr?.paymentStatus || "PENDING",
        installmentsPaid: pr?.installmentsPaid || 0,
        totalInstallments: pr?.totalInstallments || 0,
        paymentPlan: pr?.paymentPlan || "ONE_TIME",
        courseName: courseSnapshot?.title || "N/A",
        awardingBody: app?.courseSelection?.awardingBody?.name || "N/A",
        awardingBodyId: awardingBodyId,
        totalAgentStudents,
        commissionGroupId: commissionGroupId,
        commissionSource: commissionSource,
        hasMatchingAwardingBody: !!awardingBodyTemplates.find(
          (t: AwardingBodyTemplate) => t.awardingBodyId === awardingBodyId,
        ),
        invoiceAmount: invoice.invoiceAmount,
        invoiceCreatedAt: invoice.createdAt,
        paymentDate: ph?.paymentDate,
      };
    }),
  );

  return {
    paymentRecords: formattedRecords,
    pagination: null,
  };
};

// const getUserInvoices = async (userId: string) => {
//   const [invoices] = await prisma.$transaction([
//     prisma.invoice.findMany({
//       // skip: offset,
//       // take: limit,
//       orderBy: { createdAt: "desc" },
//       select: {
//         id: true,
//         invoiceNumber: true,
//         invoiceStatus: true,
//         invoiceAmount: true,
//         createdAt: true,
//         paymentHistory: {
//           select: {
//             status: true,
//             paymentDate: true,
//             paymentRecord: {
//               select: {
//                 id: true,
//                 applicantId: true,
//                 totalFee: true,
//                 paidAmount: true,
//                 paymentStatus: true,
//                 installmentsPaid: true,
//                 totalInstallments: true,
//                 application: {
//                   select: {
//                     id: true,
//                     applicationId: true,
//                     status: true,
//                     personalInformation: {
//                       select: {
//                         firstName: true,
//                         lastName: true,
//                         email: true,
//                       },
//                     },
//                     courseSelection: {
//                       select: {
//                         session: { select: { name: true } },
//                         course: { select: { courseSnapshot: true } },
//                         awardingBody: { select: { name: true, id: true } },
//                       },
//                     },
//                     userPortalCategoryRoleApplications: {
//                       where: {
//                         userPortalCategoryRole: {
//                           userPortalCategory: { userId },
//                           role: { name: "agent" },
//                         },
//                       },
//                       select: {
//                         userPortalCategoryRole: { select: { roleData: true } },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     }),
//   ]);

//   // Count total students for this agent
//   const totalAgentStudents = await prisma.application.count({
//     where: {
//       userPortalCategoryRoleApplications: {
//         some: {
//           userPortalCategoryRole: {
//             userPortalCategory: { userId },
//             role: { name: "agent" },
//           },
//         },
//       },
//     },
//   });

//   const formattedRecords = invoices.map((invoice) => {
//     const ph = invoice.paymentHistory;
//     const pr = ph?.paymentRecord;
//     const app = pr?.application;
//     const courseSnapshot = app?.courseSelection?.course?.courseSnapshot as any;

//     // Enrollment status logic
//     let enrollmentStatus = "Not Enrolled";
//     if (app?.status === "APPROVED" && pr?.paymentStatus === "PAID") {
//       enrollmentStatus = "Enrolled";
//     } else if (app?.status === "APPROVED" && pr?.paymentStatus !== "PAID") {
//       enrollmentStatus = "Approved - Pending Payment";
//     } else if (app?.status === "PENDING") {
//       enrollmentStatus = "Application Pending";
//     } else if (app?.status === "REJECTED") {
//       enrollmentStatus = "Application Rejected";
//     }

//     return {
//       id: app?.id || "N/A",
//       applicantId: app?.applicationId || pr?.applicantId || "N/A",
//       invoiceId: invoice.id,
//       invoiceNumber: invoice.invoiceNumber || "N/A",
//       invoiceStatus: invoice.invoiceStatus || "PENDING",
//       fullName: `${app?.personalInformation?.firstName || ""} ${app?.personalInformation?.lastName || ""}`.trim(),
//       enrollmentStatus,
//       firstPaymentStatus: ph?.status || "PENDING",
//       academicSession: app?.courseSelection?.session?.name || "N/A",
//       potentialPayout: 0, // Placeholder (can calculate if needed)
//       totalFee: pr?.totalFee || 0,
//       paidAmount: pr?.paidAmount || 0,
//       paymentStatus: pr?.paymentStatus || "PENDING",
//       courseName: courseSnapshot?.name || "N/A",
//       awardingBody: app?.courseSelection?.awardingBody?.name || "N/A",
//       totalAgentStudents,
//     };
//   });

//   return {
//     paymentRecords: formattedRecords,
//     pagination: null,
//   };
// };

// const updatePaymentHistoryStatus = async (input: UpdatePaymentHistoryStatusInput) => {
//   return await prisma.$transaction(async (tx) => {
//     // 1. Find the payment history with related payment record
//     const existingPaymentHistory = await tx.paymentHistory.findUnique({
//       where: {
//         id: input.id,
//       },
//       include: {
//         paymentRecord: true,
//       },
//     });

//     if (!existingPaymentHistory) {
//       throw new AppError("Payment history not found", "BAD_REQUEST", 400);
//     }

//     // 2. Update the payment history status
//     const paymentHistory = await tx.paymentHistory.update({
//       where: {
//         id: input.id,
//       },
//       data: {
//         status: input.status,
//         payment_status: input.status === "PAID" || input.status === "APPROVED",
//         processedDate: input.status === "PAID" || input.status === "APPROVED" ? new Date() : null,
//       },
//       include: {
//         paymentRecord: {
//           include: {
//             application: true,
//           },
//         },
//       },
//     });

//     let paymentRecord;

//     // 3. If payment is approved or paid, update the payment record
//     if (input.status === "PAID" || input.status === "APPROVED") {
//       const currentPaidAmount = existingPaymentHistory.paymentRecord.paidAmount;
//       const paymentAmount = existingPaymentHistory.amount;
//       const totalFee = existingPaymentHistory.paymentRecord.totalFee;

//       const newPaidAmount = currentPaidAmount + paymentAmount;
//       const newRemainingAmount = Math.max(0, totalFee - newPaidAmount);

//       // Determine new payment status based on amounts
//       let newPaymentStatus: "PAID" | "PENDING"; // Use any to avoid type issues
//       if (newRemainingAmount === 0) {
//         newPaymentStatus = "PAID";
//       } else if (newPaidAmount > 0) {
//         newPaymentStatus = "PENDING"; // Partial payment
//       } else {
//         newPaymentStatus = "PENDING";
//       }

//       // Update installments paid if it's an installment plan
//       const newInstallmentsPaid =
//         existingPaymentHistory.paymentRecord.paymentPlan === "INSTALLMENT"
//           ? existingPaymentHistory.paymentRecord.installmentsPaid + 1
//           : existingPaymentHistory.paymentRecord.installmentsPaid;

//       // 4. Update the payment record
//       paymentRecord = await tx.paymentRecord.update({
//         where: {
//           id: existingPaymentHistory.paymentRecordId,
//         },
//         data: {
//           paidAmount: newPaidAmount,
//           remainingAmount: newRemainingAmount,
//           paymentStatus: newPaymentStatus,
//           installmentsPaid: newInstallmentsPaid,
//         },
//         include: {
//           application: {
//             include: {
//               personalInformation: true,
//             },
//           },
//         },
//       });
//     } else if (input.status === "REJECTED" || input.status === "FAILED") {
//       paymentRecord = await tx.paymentRecord.update({
//         where: {
//           id: existingPaymentHistory.paymentRecordId,
//         },
//         data: {
//           paymentStatus: "PENDING",
//         },
//         include: {
//           application: {
//             include: {
//               personalInformation: true,
//             },
//           },
//         },
//       });
//     } else {
//       // For other statuses (PENDING), just return the current payment record
//       paymentRecord = existingPaymentHistory.paymentRecord;
//     }

//     return { paymentHistory, paymentRecord };
//   });
// };

const updatePaymentHistoryStatus = async (
  input: UpdatePaymentHistoryStatusInput,
): Promise<{ paymentHistory: PaymentHistory; paymentRecord: PaymentRecord }> => {
  return await prisma.$transaction(async (tx) => {
    const existingPaymentHistory = await tx.paymentHistory.findUnique({
      where: { id: input.id },
      include: { paymentRecord: true },
    });

    if (!existingPaymentHistory) {
      throw new AppError("Payment history not found", "BAD_REQUEST", 400);
    }
    const paymentHistory = await tx.paymentHistory.update({
      where: { id: input.id },
      data: {
        status: input.status,
        payment_status: input.status === "PAID" || input.status === "APPROVED",
        processedDate: input.status === "PAID" || input.status === "APPROVED" ? new Date() : null,
      },
      include: {
        paymentRecord: true,
      },
    });

    let paymentRecord: PaymentRecord;

    if (input.status === "PAID" || input.status === "APPROVED") {
      const histories = await tx.paymentHistory.findMany({
        where: { paymentRecordId: existingPaymentHistory.paymentRecordId },
      });

      const totalPaid = histories
        .filter((h) => h.status === "PAID" || h.status === "APPROVED")
        .reduce((acc, h) => acc + h.amount, 0);

      const remainingAmount = Math.max(0, existingPaymentHistory.paymentRecord.totalFee - totalPaid);

      const newInstallmentsPaid =
        existingPaymentHistory.paymentRecord.paymentPlan === "INSTALLMENT"
          ? histories.filter((h) => h.status === "PAID" || h.status === "APPROVED").length
          : existingPaymentHistory.paymentRecord.installmentsPaid;

      const newPaymentStatus = totalPaid >= existingPaymentHistory.paymentRecord.totalFee ? "PAID" : "PENDING";

      paymentRecord = await tx.paymentRecord.update({
        where: { id: existingPaymentHistory.paymentRecordId },
        data: {
          paidAmount: totalPaid,
          remainingAmount,
          paymentStatus: newPaymentStatus,
          installmentsPaid: newInstallmentsPaid,
        },
      });
    } else if (input.status === "REJECTED" || input.status === "FAILED") {
      paymentRecord = await tx.paymentRecord.update({
        where: { id: existingPaymentHistory.paymentRecordId },
        data: { paymentStatus: "PENDING" },
      });
    } else {
      paymentRecord = existingPaymentHistory.paymentRecord;
    }

    return { paymentHistory, paymentRecord };
  });
};

export const PaymentService = {
  getPaymentRecords,
  getPaymentRecordByApplication,
  updatePaymentStatus,
  getCommissionRecords,
  getInvoices,
  getInvoicesByApplication,
  createInvoice,
  createBulkInvoices,
  updateInvoice,
  getInvoiceById,
  getAgentsFromPaymentHistory,
  getAllPaymentRecords,
  updateInvoiceStatus,
  getUserInvoices,
  updateMultipleInvoicesPaidStatus,
  updatePaymentHistoryStatus,
  getInvoicesForAgentsFromApplication,
  getPaymentHistories,
};
