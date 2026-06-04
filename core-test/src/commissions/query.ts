import { Prisma } from "@prisma/client";
import { PaymentGetRecordsRequestBody } from "./types";

export const buildPaymentRecordWhere = (
  reqBody: PaymentGetRecordsRequestBody,
): {
  where: Prisma.PaymentRecordWhereInput;
  orderBy?: Prisma.PaymentRecordOrderByWithRelationInput;
} => {
  const where: Prisma.PaymentRecordWhereInput = {
    AND: [
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
      {
        ...(reqBody.paymentStatus && {
          paymentStatus: reqBody.paymentStatus,
        }),
      },
      {
        ...(reqBody.dateFrom && {
          createdAt: { gte: new Date(reqBody.dateFrom) },
        }),
      },
      {
        ...(reqBody.dateTo && {
          createdAt: { lte: new Date(reqBody.dateTo) },
        }),
      },
      {
        ...(reqBody.agentId && {
          application: {
            userPortalCategoryRoleApplications: {
              some: { userPortalCategoryRoleId: reqBody.agentId },
            },
          },
        }),
      },
      {
        ...(reqBody.subAgentId && {
          application: {
            userPortalCategoryRoleApplications: {
              some: { userPortalCategoryRoleId: reqBody.subAgentId },
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

  let orderBy: Prisma.PaymentRecordOrderByWithRelationInput | undefined;

  switch (reqBody.sortColumn) {
    case "applicantId":
      orderBy = { applicantId: reqBody.sortOrder === "desc" ? "desc" : "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  return { where, orderBy };
};
