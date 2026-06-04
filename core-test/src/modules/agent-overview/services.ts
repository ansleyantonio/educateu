import { Prisma } from "@prisma/client";
import { Commission } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { GetAgentCommissionsReqQuery, AgentCommissionData, CommissionBreakdown } from "./types";
import {
  CommissionRates,
  AgentCommissionInfo,
  AwardingBodyTemplate,
  UserPortalCategoryRoleData,
  RoleData,
  ApplicationWrapper,
} from "./interface";
import { getPagination } from "../../utils/paginationUtils";

const getAgentCommissions = async (reqQuery: GetAgentCommissionsReqQuery) => {
  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);

  // Build where clause for agents with search functionality
  const where: Prisma.UserPortalCategoryRoleWhereInput = {
    role: {
      name: "agent",
    },
    ...(reqQuery.sessionId && {
      userPortalCategoryRoleApplications: {
        some: {
          application: {
            courseSelection: {
              sessionId: reqQuery.sessionId,
            },
          },
        },
      },
    }),

    ...(reqQuery.searchTerm && {
      OR: [
        {
          userPortalCategory: {
            user: {
              firstName: {
                contains: reqQuery.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
        {
          userPortalCategory: {
            user: {
              lastName: {
                contains: reqQuery.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
        {
          userPortalCategory: {
            user: {
              agentUser: {
                contains: reqQuery.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
        {
          userPortalCategory: {
            user: {
              email: {
                contains: reqQuery.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),
  };

  const [agentRoles, totalAgents] = await prisma.$transaction([
    prisma.userPortalCategoryRole.findMany({
      where,
      skip: offset,
      take: limit,
      select: {
        id: true,
        roleData: true,
        userPortalCategoryId: true,
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
                userStatus: true,
                createdAt: true,
              },
            },
          },
        },
        userPortalCategoryRoleApplications: {
          where: {
            application: {
              status: "APPROVED", // Only get approved applications
            },
          },
          select: {
            application: {
              select: {
                id: true,
                status: true,
                outcome: true,
                createdAt: true,
                courseSelection: {
                  select: {
                    sessionId: true,
                    awardingBody: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    session: {
                      select: {
                        id: true,
                        startDate: true,
                      },
                    },
                  },
                },
                paymentRecords: {
                  select: {
                    id: true,
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
                    paymentHistories: {
                      select: {
                        status: true,
                        paymentDate: true,
                        amount: true,
                        invoices: {
                          select: {
                            invoiceAmount: true,
                            invoiceStatus: true,
                          },
                        },
                      },
                    },
                  },
                },
                agentCommissions: {
                  select: {
                    commissionAmount: true,
                    paidAmount: true,
                    status: true,
                  },
                },
                RegisteredStudent: {
                  select: {
                    id: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.userPortalCategoryRole.count({ where }),
  ]);

  // Process each agent's commission data
  const agents = await Promise.all(
    agentRoles.map(async (agentRole) => {
      const user = agentRole.userPortalCategory.user;
      const roleData: RoleData | null = agentRole.roleData as unknown as RoleData;
      // Calculate commission metrics - ONLY for approved applications
      const commissionBreakdown = await calculateCommissionBreakdown(
        agentRole.userPortalCategoryRoleApplications,
        roleData,
        user.id,
        reqQuery.sessionId,
      );

      // Get commission tier - Use the first commission template ID from awardingBodyTemplates
      const firstCommissionTemplateId = roleData?.awardingBodyTemplates?.[0]?.commissionTemplateId;
      const commissionTier = await getCommissionTier(firstCommissionTemplateId, commissionBreakdown.totalStudents);

      // Determine agent status
      const status = determineAgentStatus(user.userStatus, commissionBreakdown.recentActivity);

      return {
        agentId: user.id,
        agentName: user.agentUser || `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        commissionTier,
        totalStudent: commissionBreakdown.totalStudents,
        potentialCommission: Math.round(commissionBreakdown.potentialCommission * 100) / 100,
        eligibleCommission: Math.round(commissionBreakdown.eligibleCommission * 100) / 100,
        paidCommission: Math.round(commissionBreakdown.paidCommission * 100) / 100,
        totalApprovedInvoices: commissionBreakdown.totalApprovedInvoices,
        status,
        firstYear: commissionBreakdown.firstYear.count,
        secondYear: commissionBreakdown.secondYear.count,
        thirdYear: commissionBreakdown.thirdYear.count,
        fourthYear: commissionBreakdown.fourthYear.count,
        semesterWise: commissionBreakdown.semesterWise,
      } as AgentCommissionData;
    }),
  );

  const paginationData = {
    count: agents.length,
    total: totalAgents,
    page: reqQuery.page,
    perPage: limit,
    totalPages: Math.ceil(totalAgents / limit),
  };

  return { agents, pagination: paginationData };
};

// Helper function to get commission rate by installments (from your payment records function)
const getCommissionRateByInstallments = (paymentRecord: number, commissionRates: CommissionRates): number => {
  if (!commissionRates) return 10; // Fallback 10%

  const installmentsPaid = paymentRecord || 0;

  // Use installment-based rates if available, otherwise use general rates
  if (installmentsPaid === 0) {
    return commissionRates.firstRate || commissionRates.firstRate || 10;
  } else if (installmentsPaid === 1) {
    return commissionRates.secondRate || commissionRates.secondRate || 10;
  } else if (installmentsPaid === 2) {
    return commissionRates.thirdRate || commissionRates.thirdRate || 10;
  } else if (installmentsPaid >= 3) {
    return commissionRates.fourthRate || commissionRates.fourthRate || 10;
  }

  return commissionRates.firstRate || 10;
};

// Calculates comprehensive commission breakdown for an agent using ONLY approved applications
const calculateCommissionBreakdown = async (
  applications: ApplicationWrapper[],
  // applications: any[],
  roleData: RoleData,
  userId: string,
  sessionId?: string,
): Promise<CommissionBreakdown> => {
  // Filter to ensure only approved applications are processed
  // const approvedApplications = applications.filter((app) => app.application.status === "APPROVED");
  const approvedApplications = applications.filter(
    (app) =>
      app.application.status === "APPROVED" && (!sessionId || app.application.courseSelection?.sessionId === sessionId),
  );

  const applicationIds = approvedApplications.map((app) => app.application.id);
  const currentYear = new Date().getFullYear();

  // Get total approved invoices in a single query - ONLY for approved applications
  const approvedInvoicesResult = await prisma.invoice.aggregate({
    where: {
      paymentHistory: {
        paymentRecord: {
          application: {
            id: {
              in: applicationIds,
            },
            status: "APPROVED", // Ensure only approved applications
          },
        },
      },
      invoiceStatus: "PAID",
    },
    _sum: {
      invoiceAmount: true,
    },
  });

  const breakdown: CommissionBreakdown = {
    totalStudents: 0,
    potentialCommission: 0,
    eligibleCommission: 0,
    paidCommission: 0,
    totalApprovedInvoices: approvedInvoicesResult._sum?.invoiceAmount || 0,
    recentActivity: null,
    firstYear: { count: 0, amount: 0 },
    secondYear: { count: 0, amount: 0 },
    thirdYear: { count: 0, amount: 0 },
    fourthYear: { count: 0, amount: 0 },
    semesterWise: [],
  };

  const semesterMap: Record<string, { totalPaid: number; totalCommission: number }> = {};
  const awardingBodyTemplates = roleData?.awardingBodyTemplates || [];

  // Get agent's general commission info (similar to payment records function)
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

  const agentRoleData = agentCommissionInfo?.roleData;

  // Get commissionGroupId from awardingBodyTemplates
  let commissionGroupId = null;
  if (agentRoleData && agentRoleData?.awardingBodyTemplates && agentRoleData?.awardingBodyTemplates?.length > 0) {
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
  const totalAgentStudents = await prisma.application.count({
    where: {
      status: "APPROVED",
      courseSelection: {
        sessionId: sessionId || undefined,
      },
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

  // Process ONLY approved applications
  for (const appRole of approvedApplications) {
    const application = appRole.application;
    const awardingBodyId = application.courseSelection?.awardingBody?.id;

    // Enrollment date (based on student registration or application date)
    const enrollmentDate = application.RegisteredStudent?.[0]?.createdAt ?? application.createdAt ?? new Date();
    const enrollmentYear = new Date(enrollmentDate).getFullYear();
    const yearDiff = currentYear - enrollmentYear;

    // Count students per year
    if (yearDiff === 0) breakdown.firstYear.count++;
    else if (yearDiff === 1) breakdown.secondYear.count++;
    else if (yearDiff === 2) breakdown.thirdYear.count++;
    else if (yearDiff >= 3) breakdown.fourthYear.count++;

    breakdown.totalStudents++;

    // Track latest activity
    if (application.createdAt) {
      if (!breakdown.recentActivity || application?.createdAt > breakdown.recentActivity) {
        breakdown.recentActivity = application.createdAt;
      }
    }

    // Determine semester name
    const sessionStart = application.courseSelection?.session?.startDate;
    let semesterName = "Unknown Semester";

    if (sessionStart) {
      const startDate = new Date(sessionStart);
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const semester = month < 6 ? "Spring" : "Autumn";
      semesterName = `${semester} ${year}`;
    } else {
      const fallbackDate = new Date(application.createdAt ?? 0);
      const year = fallbackDate.getFullYear();
      const month = fallbackDate.getMonth();
      const semester = month < 6 ? "Spring" : "Autumn";
      semesterName = `${semester} ${year}`;
    }

    // Ensure semester exists in map
    if (!semesterMap[semesterName]) {
      semesterMap[semesterName] = { totalPaid: 0, totalCommission: 0 };
    }

    // Calculate potential commission using the same logic as payment records
    for (const paymentRecord of application.paymentRecords || []) {
      if (paymentRecord.paymentStatus === "PAID") {
        let commissionRate = 0;
        let commissionPayment = 0;
        // Get the role data for this specific application
        const recordRoleData = roleData as UserPortalCategoryRoleData | undefined;
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
            // No specific awarding body template found, use general rates
            commissionRate = getCommissionRateByInstallments(paymentRecord?.installmentsPaid, generalCommissionRates);
          }
        } else {
          // Fallback: 10% commission if no commission rates found
          commissionRate = 10;
        }

        // Calculate commission payment (this is the potentialPayout equivalent)
        commissionPayment = (paymentRecord.totalFee * commissionRate) / 100;

        breakdown.potentialCommission += commissionPayment;

        // Add to year-wise breakdown
        if (yearDiff === 0) breakdown.firstYear.amount += commissionPayment;
        else if (yearDiff === 1) breakdown.secondYear.amount += commissionPayment;
        else if (yearDiff === 2) breakdown.thirdYear.amount += commissionPayment;
        else if (yearDiff >= 3) breakdown.fourthYear.amount += commissionPayment;

        // Add to semester-wise totals
        semesterMap[semesterName].totalPaid += paymentRecord.paidAmount;
        semesterMap[semesterName].totalCommission += commissionPayment;
      }
    }
    // Eligible & paid commissions (existing logic) - ONLY for approved applications
    for (const commission of application.agentCommissions || []) {
      if (commission.status === "APPROVED") {
        breakdown.eligibleCommission += commission.commissionAmount || 0;
      }
      if (commission.status === "PAID") {
        breakdown.paidCommission += commission.paidAmount || 0;
      }
    }
  }

  // Assign semester-wise breakdown
  breakdown.semesterWise = Object.entries(semesterMap).map(([semester, data]) => ({
    semester,
    totalPaid: Math.round(data.totalPaid * 100) / 100,
    totalCommission: Math.round(data.totalCommission * 100) / 100,
  }));

  // Round all financial values
  breakdown.potentialCommission = Math.round(breakdown.potentialCommission * 100) / 100;
  breakdown.eligibleCommission = Math.round(breakdown.eligibleCommission * 100) / 100;
  breakdown.paidCommission = Math.round(breakdown.paidCommission * 100) / 100;
  breakdown.totalApprovedInvoices = Math.round(breakdown.totalApprovedInvoices * 100) / 100;

  // Round year-wise amounts
  breakdown.firstYear.amount = Math.round(breakdown.firstYear.amount * 100) / 100;
  breakdown.secondYear.amount = Math.round(breakdown.secondYear.amount * 100) / 100;
  breakdown.thirdYear.amount = Math.round(breakdown.thirdYear.amount * 100) / 100;
  breakdown.fourthYear.amount = Math.round(breakdown.fourthYear.amount * 100) / 100;

  return breakdown;
};

// Gets commission rates for a specific template based on student count
const getCommissionRatesForTemplate = async (commissionTemplateId: string, totalStudents: number) => {
  try {
    const commissionRates = await prisma.commission.findFirst({
      where: {
        commissionGroupId: commissionTemplateId,
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

    return commissionRates;
  } catch (error) {
    console.error("Error fetching commission rates for template:", error);
    return null;
  }
};

// Determines commission tier based on student count and commission group.
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

// Determines agent status based on user status and recent activity.
const determineAgentStatus = (userStatus: string, recentActivity: Date | null): string => {
  if (userStatus !== "ACTIVE") {
    return "Inactive";
  }

  if (!recentActivity) {
    return "No Activity";
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return recentActivity > thirtyDaysAgo ? "Active" : "Dormant";
};

export const AgentCommissionService = {
  getAgentCommissions,
};
