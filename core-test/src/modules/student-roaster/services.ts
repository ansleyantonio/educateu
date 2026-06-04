import chalk from "chalk";

import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
// import { AppError } from "../../utils/AppError";
import { CourseType, EnrollmentStatus, Prisma } from "@prisma/client";
import {
  RegistriesRequestBody,
  GetRegisteredStudentDetailsRequestBody,
  // GetSupportTokensRequestBody,
  // GetSupportTokensResponse,
  // CourseSnapshot,
  // CourseModuleItem,
  // FacultyMember,
} from "./types";
import { parse } from "json2csv";
import { AppError } from "../../utils/AppError";
import createAuditLog from "../../utils/auditlog";
import userDetails from "../../utils/userinfo";
// import createAuditLog from "../../utils/auditlog";
// import userDetails from "../../utils/userinfo";

// Field mapping to database fields
const fieldMapping: { [key: string]: string } = {
  "Student ID": "studentEnrollment.application.applicationId", // Use applicationId instead of internal id
  "College Email": "studentEnrollment.application.personalInformation.email",
  Title: "studentEnrollment.application.personalInformation.title",
  Sex: "studentEnrollment.application.personalInformation.sex",
  "Other Sex": "studentEnrollment.application.personalInformation.otherSex",
  "First Name": "studentEnrollment.application.personalInformation.firstName",
  "Middle Name": "studentEnrollment.application.personalInformation.middleName",
  "Last Name": "studentEnrollment.application.personalInformation.lastName",
  "Date of Birth": "studentEnrollment.application.personalInformation.dateOfBirth",
  "Current Nationality": "studentEnrollment.application.personalInformation.currentNationality",
  "Country of Residence": "studentEnrollment.application.personalInformation.countryOfResidence",
  "Current Post code": "studentEnrollment.application.personalInformation.currentPostCode",
  "Country of Birth": "studentEnrollment.application.personalInformation.countryOfBirth",
  Ethnicity: "studentEnrollment.application.personalInformation.ethnicity",
  "Marital Status": "studentEnrollment.application.personalInformation.maritalStatus",
  "Current Address": "studentEnrollment.application.personalInformation.currentAddress",
  "Permanent Address": "studentEnrollment.application.personalInformation.permanentAddress",
  Phone: "studentEnrollment.application.personalInformation.mobileNumber",
  Email: "studentEnrollment.application.personalInformation.email",
  "Student Status": "studentEnrollment.application.status",
  "Student Registration Outcome": "studentEnrollment.application.outcome",
  "Next of Kin Relationship": "studentEnrollment.application.nextOfKin.relationship",
  "Next of Kin Full Name": "studentEnrollment.application.nextOfKin.fullName",
  "Next of Kin Phone": "studentEnrollment.application.nextOfKin.phoneOrMobile",
  "Next of Kin Address": "studentEnrollment.application.nextOfKin.address",
  "Agent First Name": "", // This would need to be added to the schema
  "Agent Last Name": "", // This would need to be added to the schema
  "Agent Phone": "", // This would need to be added to the schema
  "Agent Email": "", // This would need to be added to the schema
  "Sub Agent First Name": "", // This would need to be added to the schema
  "Sub Agent Last Name": "", // This would need to be added to the schema
  "Status Effective From": "", // This would need to be added to the schema
  "Status Created By": "", // This would need to be added to the schema
  "Reason for Withdrawal": "", // This would need to be added to the schema
  "Course Title": "studentEnrollment.application.courseSelection.course.title",
  "Awarding Body Name": "studentEnrollment.application.courseSelection.course.awardingBody.name",
  "Course Start Date": "studentEnrollment.application.courseSelection.course.session.startTime",
  "Course End Date": "studentEnrollment.application.courseSelection.course.session.endTime",
  "Year of Entry": "", // This would need to be added to the schema
  "Course Fees": "", // This would need to be added to the schema or calculated
  "Awarding Body ID": "studentEnrollment.application.courseSelection.course.awardingBodyId",
};

const getRegisteredStudentDetails = async (reqBody: GetRegisteredStudentDetailsRequestBody) => {
  const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.RegisteredStudentWhereInput = {
    AND: [...(reqBody.registrationId ? [{ id: reqBody.registrationId }] : [])],
  };

  //Execute database transaction to get registered student details and total count atomically
  const [student, count] = await prisma.$transaction([
    // Fetch registered student details with complex filtering and relations
    prisma.registeredStudent.findFirst({
      where,
      take: limit, // Limit number of results
      skip: offset, // Skip records for pagination
      orderBy: {
        createdAt: "desc", // Order by creation date, newest first
      },
      include: {
        studentEnrollment: {
          include: {
            application: {
              include: {
                personalInformation: true,
                supportingDocument: {
                  include: {
                    supportingDocumentAttachments: {
                      include: {
                        attachment: true,
                      },
                    },
                  },
                },
                applicationNotes: {
                  include: {
                    note: true,
                  },
                },
                courseSelection: {
                  include: {
                    course: true,
                  },
                },
                nextOfKin: true,
                userPortalCategoryRoleApplications: {
                  include: {
                    userPortalCategoryRole: {
                      include: {
                        userPortalCategory: {
                          include: {
                            user: true,
                          },
                        },
                        role: true,
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
    // Get total count for pagination metadata
    prisma.registeredStudent.count({
      where,
    }),
  ]);

  // Find the agent role application
  const agentRoleApplication = student?.studentEnrollment.application?.userPortalCategoryRoleApplications.find(
    (upcra) => upcra.userPortalCategoryRole.role.name === "agent",
  );

  const courseStatus = await prisma.studentCourse.findFirst({
    where: {
      studentId: reqBody?.studentId,
      sessionCourseId: student?.studentEnrollment.application?.courseSelection?.courseId ?? "",
    },
    select: {
      enrollmentStatus: true,
    },
  });

  const formattedStudent = {
    id: student?.id,
    enrollmentStatus: courseStatus?.enrollmentStatus,
    profileInfo: student?.studentEnrollment.application?.personalInformation,
    registrationDetails: student?.studentEnrollment.application?.courseSelection,
    documents: student?.studentEnrollment.application?.supportingDocument,
    notes: student?.studentEnrollment.application?.applicationNotes,
    nextOfKin: student?.studentEnrollment.application?.nextOfKin,
    agent:
      agentRoleApplication?.userPortalCategoryRole?.userPortalCategory?.user.firstName +
      " " +
      agentRoleApplication?.userPortalCategoryRole?.userPortalCategory?.user.lastName,
  };

  const paginationData = {
    count: student ? 1 : 0, // Number of items in current page (1 if student found, else 0)
    total: count, // Total number of enrollments
    page: reqBody.page, // Current page number
    perPage: limit, // Items per page
    totalPages: Math.ceil(count / limit), // Total number of pages
  };

  return { studentInfo: formattedStudent, pagination: paginationData };
};

const getStudentRegistries = async (reqBody: RegistriesRequestBody, returnRawData = false) => {
  const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.RegisteredStudentWhereInput = {
    ...(reqBody.applicationId && { id: reqBody.applicationId }),
    application: {
      userPortalCategoryRoleApplications: {
        some: { userPortalCategoryRoleId: reqBody.agentId },
      },
      courseSelection: {
        course: {
          ...(reqBody.sessionId && { sessionId: reqBody.sessionId }),
          ...(reqBody.courseId && { id: reqBody.courseId }),
          course: {
            ...(reqBody.awardingBodyId && { awardingBodyId: reqBody.awardingBodyId }),
            courseType: reqBody.courseType ?? { in: ["DEGREE_COURSE", "DIPLOMA_COURSE"] },
          },
        },
      },
    },
  };

  const include = {
    studentEnrollment: {
      include: {
        application: {
          include: {
            personalInformation: true,
            nextOfKin: true,
            courseSelection: {
              include: {
                course: {
                  include: {
                    course: { include: { awardingBody: true } },
                    session: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const [registries, total] = await prisma.$transaction([
    prisma.registeredStudent.findMany({ where, include, take: limit, skip: offset, orderBy: { createdAt: "desc" } }),
    prisma.registeredStudent.count({ where }),
  ]);

  if (returnRawData) {
    return {
      registries,
      pagination: {
        count: registries.length,
        total,
        page: reqBody.page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // collect emails
  const emails = registries
    .map((r) => r.studentEnrollment.application?.personalInformation?.email)
    .filter(Boolean) as string[];

  // get students
  const students = await prisma.student.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });

  const studentMap = Object.fromEntries(students.map((s) => [s.email, s.id]));

  const formatted = registries.map((r) => {
    const app = r.studentEnrollment.application;
    const p = app?.personalInformation;
    const course = app?.courseSelection?.course;

    return {
      id: r.id,
      firstName: p?.firstName,
      lastName: p?.lastName,
      studentId: studentMap[p?.email || ""] || null,
      course: course?.course?.title,
      awardingBody: course?.course?.awardingBody?.name,
      email: p?.email,
      progress: "0%",
      status: app?.status,
    };
  });

  return {
    registries: formatted,
    pagination: {
      count: formatted.length,
      total,
      page: reqBody.page,
      perPage: limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getStudentRegistriesByIds = async (ids: string[]) => {
  // Fetch registries by IDs with all necessary relations for CSV generation
  const registries = await prisma.registeredStudent.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      studentEnrollment: {
        include: {
          application: {
            include: {
              personalInformation: true,
              courseSelection: {
                include: {
                  course: {
                    include: {
                      course: {
                        include: {
                          awardingBody: true,
                        },
                      },
                      session: true,
                    },
                  },
                },
              },
              nextOfKin: true,
            },
          },
        },
      },
    },
  });

  return registries;
};

const generateCsvData = async (reqBody: { ids: string[]; fields?: string[] }) => {
  // Get raw data based on IDs for CSV generation
  const registries = await getStudentRegistriesByIds(reqBody.ids);

  // If no fields are specified, use all available fields from fieldMapping
  const effectiveFields = reqBody.fields && reqBody.fields.length > 0 ? reqBody.fields : Object.keys(fieldMapping);

  // Define which fields should be masked for privacy
  const sensitiveFields = ["College Email", "Email", "Phone", "Next of Kin Phone", "Agent Phone", "Agent Email"];

  // Define which fields are dates that need formatting
  const dateFields = ["Date of Birth", "Course Start Date", "Course End Date"];

  // Function to mask email addresses
  const maskEmail = (email: string): string => {
    if (!email || typeof email !== "string") return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return "***@***";

    // Keep first and last character of local part, mask the rest
    const maskedLocalPart =
      localPart.length > 2
        ? localPart[0] + "*".repeat(localPart.length - 2) + localPart[localPart.length - 1]
        : "*".repeat(localPart.length);

    // Keep domain as is or mask it too
    return `${maskedLocalPart}@${domain}`;
  };

  // Function to mask phone numbers
  const maskPhone = (phone: string): string => {
    if (!phone || typeof phone !== "string") return "";
    // Keep only last 2 digits, mask the rest
    const digits = phone.replace(/\D/g, ""); // Remove non-digits
    if (digits.length <= 2) return "**";
    return "*".repeat(digits.length - 2) + digits.slice(-2);
  };

  // Function to format dates to ISO format (YYYY-MM-DD)
  const formatDate = (dateString: string): string => {
    if (!dateString || typeof dateString !== "string") return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid date
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Transform data to match selected fields
  const csvData = registries.map((registry) => {
    const row: Record<string, string> = {};
    effectiveFields.forEach((field) => {
      // Get the path to the data property
      const path = fieldMapping[field];
      let value: string | undefined;

      if (path) {
        // Navigate through the object properties to get the value
        const rawValue = path.split(".").reduce((obj: unknown, prop: string) => {
          if (obj && typeof obj === "object" && prop in obj) {
            return (obj as Record<string, unknown>)[prop];
          }
          return undefined;
        }, registry as unknown);
        value = rawValue ? String(rawValue) : "";
      } else {
        // If no mapping is found, use the field name directly
        value = registry[field as keyof typeof registry] ? String(registry[field as keyof typeof registry]) : "";
      }

      // Apply formatting based on field type
      if (dateFields.includes(field)) {
        row[field] = formatDate(value);
      } else if (sensitiveFields.includes(field)) {
        if (field.includes("Email")) {
          row[field] = maskEmail(value);
        } else if (field.includes("Phone")) {
          row[field] = maskPhone(value);
        } else {
          // For other sensitive fields, mask completely
          row[field] = "*".repeat(Math.min(value.length, 10));
        }
      } else {
        row[field] = value;
      }
    });
    return row;
  });

  // Generate CSV using only the field names (headers)
  const csv = parse(csvData, { fields: effectiveFields });
  return csv;
};

// Withdrawable Course Details
const getWithdrawableCourseDetails = async (reqParams: { sessionCourseId: string; studentId: string }) => {
  const { sessionCourseId, studentId } = reqParams;

  // Get the student ID from the authenticated student
  const data = await prisma.studentCourse.findFirst({
    where: {
      studentId: studentId,
      sessionCourseId: sessionCourseId,
    },
    select: {
      student: {
        select: {
          email: true,
        },
      },
      id: true,
      enrollmentStatus: true,
      sessionCourse: {
        select: {
          id: true,
          courseFees: {
            where: {
              status: "ACTIVE",
            },
            select: {
              overallCourseFee: true,
              currencyType: true,
              status: true,
            },
          },
          course: {
            select: {
              title: true,
              code: true,
              startDate: true,
              endDate: true,
            },
          },
          session: {
            select: {
              name: true,
              intakePeriod: true,
              year: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  // Get fund data if email exists and is not a student
  if (!data) {
    throw new AppError(`No enrollment found for this student and course.`, "NOT_FOUND", 404);
  }

  // Get fund data if email exists
  let fundData = null;
  if (data?.student?.email) {
    const application = await prisma.application.findFirst({
      where: {
        personalInformation: {
          email: data.student.email,
        },
      },
      select: {
        fund: {
          select: {
            source: true,
            otherSource: true,
          },
        },
      },
    });
    fundData = application?.fund;
  }

  return {
    fundData,
    sessionCourseId: data?.sessionCourse?.id,
    courseFees: data?.sessionCourse?.courseFees[0] ?? null,
    course: data?.sessionCourse?.course,
    session: data?.sessionCourse?.session,
  };
};

const getStudentPaymentDetails = async (email: string) => {
  const applications = await prisma.application.findMany({
    where: {
      personalInformation: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      paymentRecords: {
        some: {
          totalFee:{
            gt: 0
          }
        },
      }
    },

    select: {
      courseSelection: {
        select: {
          course: {
            select: {
              course: {
                select: {
                  title: true,
                },
              },

              courseFees: {
                select: {
                  courseFeeStructure: {
                    select: {
                      totalSemesters: true,
                    },
                  },
                },
              },
            },
          },
        },
      },

      paymentRecords: {
        select: {
          totalFee: true,
          installmentsPaid: true,
          totalInstallments: true,
          paymentStatus: true,

          paymentHistories: {
            where: {
              status: "PAID",
            },
            orderBy: {
              paymentDate: "desc",
            },
            select: {
              amount: true,
              paymentMethod: true,
              paymentDate: true,
              status: true,
            },
          },
        },
      },
    },
  });

  return applications.map((app) => {
    const courseName = app.courseSelection?.course?.course?.title || "";
    const totalSemesters = app.courseSelection?.course?.courseFees?.[0]?.courseFeeStructure?.totalSemesters || 0;
    const paidSemesters = app.paymentRecords.reduce((sum, payment) => sum + (payment.installmentsPaid || 0), 0);
    const totalFee = app.paymentRecords.reduce((sum, payment) => sum + (payment.totalFee || 0), 0);
    const paymentHistory = app.paymentRecords.flatMap((payment) => payment.paymentHistories);
    return {
      courseName,
      totalFee,
      totalSemesters,
      paidSemesters,
      remainingSemesters: totalSemesters - paidSemesters > 0 ? totalSemesters - paidSemesters : 0,
      paymentHistory,
    };
  });
};
// Withdrawal Course
const withdrawCourse = async (userId: string, reqBody: { studentId: string; sessionCourseId: string }) => {
  const { studentId, sessionCourseId } = reqBody;

  const studentCourse = await prisma.studentCourse.findUnique({
    where: {
      studentId_sessionCourseId: {
        studentId,
        sessionCourseId,
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student is not enrolled in this session course", "NOT_FOUND", 404);
  }
  if (studentCourse.enrollmentStatus === EnrollmentStatus.WITHDRAWN) {
    throw new AppError("Student already withdrawn from this session course", "ALREADY_PROCESSED", 400);
  }

  const withdrawn = await prisma.studentCourse.update({
    where: {
      studentId_sessionCourseId: {
        studentId,
        sessionCourseId,
      },
    },
    data: {
      enrollmentStatus: EnrollmentStatus.WITHDRAWN,
    },
    select: {
      createdAt: true,
      updatedAt: true,
      enrollmentStatus: true,
      sessionCourseId: true,
      studentId: true,
    },
  });

  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `${userDetails(userId)} withdrawn from ${userDetails(studentId)} session-course:${sessionCourseId}`,
    courseId: sessionCourseId,
    targetUserId: studentId,
  });

  return withdrawn;
};

export const StudentRoasterService = {
  getStudentRegistries,
  getRegisteredStudentDetails,
  generateCsvData,
  getWithdrawableCourseDetails,
  withdrawCourse,
  getStudentPaymentDetails,
};
