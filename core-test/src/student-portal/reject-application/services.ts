import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { TimeChecker } from "../../utils/timeChecker";

const rejectedApplicationServices = async (applicationsId: string) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationsId,
      status: { not: "APPROVED" },
    },
    select: {
      offerExpired: true,
      status: true,
    },
  });

  if (!application) {
    return { status: "NOT_FOUND" as const };
  }

  if (application.status === "REJECTED") {
    return { status: "ALREADY_REJECTED" as const };
  }

  const isExpired = TimeChecker.has72HoursPassed(application.offerExpired);

  if (isExpired) {
    return { status: "EXPIRED" as const };
  }

  const result = await prisma.application.update({
    where: { id: applicationsId },
    data: { status: "REJECTED" },
    select: {
      status: true,
      applicationId: true,
    },
  });
  console.log("result", result);

  return { statusCode: "SUCCESS", applicantId: result.applicationId, status: result.status };
};

// const rejectedApplicationServices = async (applicationsId: string) => {
//   const application = await prisma.application.findUnique({
//     where: {
//       id: applicationsId,
//       NOT: { status: "APPROVED" },
//     },
//     select: {
//       offerExpired: true,
//       status: true,
//     },
//   });
//
//   if (!application) {
//     throw new AppError(
//       "We couldn't find this application or it has already been approved.",
//       "APPLICATION_NOT_FOUND",
//       404,
//     );
//   }
//
//   if (application.status === "REJECTED") {
//     throw new AppError("This application has already been rejected.", "APPLICATION_ALREADY_REJECTED", 400);
//   }
//
//   const isPassed = TimeChecker.has72HoursPassed(application?.offerExpired);
//
//   if (isPassed) {
//     throw new AppError(
//       "This rejection link is no longer valid because it expired after 72 hours.",
//       "LINK_EXPIRED",
//       400,
//     );
//   }
//
//   const result = await prisma.application.update({
//     where: { id: applicationsId },
//     data: { status: "REJECTED" },
//     select: {
//       status: true,
//     },
//   });
//
//   return {
//     result,
//   };
// };

export const RejectApplicationServices = {
  rejectedApplicationServices,
};
