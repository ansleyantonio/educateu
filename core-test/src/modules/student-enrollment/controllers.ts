import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { getEnrollmentsReqBodySchema, migrateEnrollmentsSchema } from "./types";
import { StudentEnrollmentService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import createAuditLog from "../../utils/auditlog";
import prisma from "../../prismaClient";
import { createStudent } from "../../utils/createStudent";
import { AppError } from "../../utils/AppError";

const getEnrollments = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.body, getEnrollmentsReqBodySchema);

  const { enrollments, pagination } = await StudentEnrollmentService.getStudentEnrollments(reqQuery);

  sendSuccessResponse(res, enrollments, "Student enrollment data fetched successfully", 200, pagination);
};

const migrateEnrollments = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, migrateEnrollmentsSchema);

  const result = await StudentEnrollmentService.migrateEnrollments(reqBody);
  if (req.user) {
    const studentNames = await prisma.studentEnrollments.findMany({
      where: {
        id: {
          in: reqBody.studentEnrollmentIds,
        },
      },
      select: {
        application: {
          select: {
            courseSelection: {
              select: {
                course: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            personalInformation: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    for (const s of studentNames) {
      const firstName = s.application?.personalInformation?.firstName || "";
      const lastName = s.application?.personalInformation?.lastName || "";
      const sessionCourseId = s.application?.courseSelection?.course?.id || "";
      await createStudent({
        firstName: firstName,
        lastName: lastName,
        email: s?.application?.personalInformation?.email || "",
        password: "123456",
        sessionCourseId: sessionCourseId,
      });

      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Migrated student enrollment For: ${firstName} ${lastName}`,
        actionType: "student_enrollment",
      });
    }
  }

  sendSuccessResponse(res, result, "Student enrollments migrated successfully", 200);
};

export const StudentEnrollmentController = {
  getEnrollments,
  migrateEnrollments,
};
