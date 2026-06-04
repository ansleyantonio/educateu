import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import axios from "axios";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultAccessTokenSecret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "defaultRefreshTokenSecret";
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || "1h";
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || "7d";

import { PaymentMethod } from "@prisma/client";
import prisma from "../prisma/prisma.service";
import { AppError } from "../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { AuthSchemaType, loginType, ManualPaymentForm } from "./schema";

class AuthService {
  static async login(
    username: string,
    password: string,
    userPortal: string,
    ip: string,
    deviceId?: string,
    platform: string = "Unknown",
    browser: string = "Unknown",
  ) {
    let user;

    if (userPortal === "faculty") {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            {
              facultyUser: { equals: username, mode: "insensitive" },
            },
            { facultyEmail: { equals: username, mode: "insensitive" } },
          ],
        },
        include: {
          userRoles: { include: { role: true } },
          userPortalCategories: {
            include: {
              portalCategory: true,
            },
          },
        },
      });
    } else if (userPortal === "agent") {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { agentUser: { equals: username, mode: "insensitive" } },
            { agentEmail: { equals: username, mode: "insensitive" } },
          ],
        },
        include: {
          userRoles: { include: { role: true } },
          userPortalCategories: {
            include: {
              portalCategory: true,
            },
          },
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: username, mode: "insensitive" } },
            { username: { equals: username, mode: "insensitive" } },
          ],
        },
        include: {
          userRoles: { include: { role: true } },
          userPortalCategories: {
            include: {
              portalCategory: true,
            },
          },
        },
      });
    }

    if (!user) {
      throw new AppError(
        "Username and password combination is incorrect",
        "UNAUTHORIZED",
        401,
      );
    }
    if (user.userStatus !== "ACTIVE") {
      throw new AppError("User account is not active", "FORBIDDEN", 403);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await prisma.auditLog.create({
        data: {
          action: " has attempted to log in",
          userId: user.id,
          actionType: "failed_login",
        },
      });
      throw new AppError("Password is incorrect", "UNAUTHORIZED", 401);
    }

    const hasPortalAccess = user.userPortalCategories.some(
      (category) => category.portalCategory?.name === userPortal,
    );

    if (!hasPortalAccess) {
      throw new AppError(
        "You do not have access to this portal.",
        "FORBIDDEN",
        403,
      );
    }
    const activeDevices = await prisma.browsersAndDevices.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    const isDeviceActive = activeDevices.some(
      (device) => device.deviceId === deviceId,
    );

    if (!isDeviceActive && activeDevices.length >= 2) {
      setImmediate(() =>
        axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/email/multi-device-login-alert`,
          {
            userId: user.id,
          },
        ),
      );

      throw new AppError(
        "Maximum login limit reached. Please log out from other devices to continue.",
        "SESSION_LIMIT_EXCEEDED",
        403,
        true,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isForceLogout: false },
    });

    // Select a user portal category (assuming you want to include the first one in the list)
    const userPortalCategory =
      user.userPortalCategories.length > 0
        ? user.userPortalCategories[0].id
        : null;

    const accessToken = jwt.sign(
      {
        userId: user.id,
        userPortalCategoryId: userPortalCategory, // Add user portal category id here
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION },
    );

    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    // Extract roles (roleId and name)

    // return { user, roles, accessToken, refreshToken };
    const { password: _password, ...userWithoutPassword } = user;

    let needMFALogin: boolean;

    if (user.mfaEnabled) {
      if (user.lastMFALogin) {
        // const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // NOTE: test purpose
        const mfaThreshold = new Date(Date.now() - 5 * 60 * 1000);
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        if (
          user.lastMFALogin < mfaThreshold ||
          (user.logoutTime && user.logoutTime < fifteenMinutesAgo)
        ) {
          needMFALogin = true;
        } else {
          needMFALogin = false;
        }
      } else {
        needMFALogin = true;
      }
    } else {
      needMFALogin = false;
    }

    // return { user: { ...user, needMFALogin }, accessToken, refreshToken };
    const finalUser = {
      ...user,
      email: user.email || user.agentEmail || user.facultyEmail, // 👈 override only this
      needMFALogin,
      deviceId,
    };

    return { user: finalUser, accessToken, refreshToken };
  }

  static verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET,
      ) as JwtPayload;
      const userId = decoded.userId;

      const newAccessToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      });

      return { newAccessToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  static async getDeviceHistory(userId: string) {
    // Fetch all device records for the given userId
    const devices = await prisma.browsersAndDevices.findMany({
      where: { userId: userId },
    });

    // if (!devices.length) {
    //   throw new App
    // }

    return devices;
  }

  static async deleteDeviceHistory(userId: string, id: string) {
    try {
      await prisma.browsersAndDevices.delete({
        where: {
          userId: userId,
          id: id, // Convert id to number
        },
      });
    } catch (error) {
      throw new Error("Failed to delete device history");
    }
  }
  static async generateToken(data: AuthSchemaType) {
    const user = await prisma.user.findFirst({
      where: {
        // OR: [{ email: username }, { mobile: username }, { username: username }],
        OR: [{ id: data.id }, { username: data.username }],
      },
      include: {
        userRoles: { include: { role: true } },
        userPortalCategories: {
          include: {
            portalCategory: true, // Ensure portalCategory is included
          },
        },
      },
    });

    if (!user) {
      throw new Error("Username and password combination is incorrect");
    }
    if (user.userStatus !== "ACTIVE") {
      throw new Error("User account is not active");
    }

    const userportal = await prisma.userPortalCategory.findFirst({
      where: {
        userId: user.id,
        portalCategoryId: user.userPortalCategories[0].portalCategoryId,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isForceLogout: false },
    });

    // Select a user portal category (assuming you want to include the first one in the list)
    const userPortalCategory =
      user.userPortalCategories.length > 0
        ? user.userPortalCategories[0].id
        : null;

    const accessToken = jwt.sign(
      {
        userId: user.id,
        userPortalCategoryId: userPortalCategory, // Add user portal category id here
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION },
    );

    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    // Extract roles (roleId and name)

    // return { user, roles, accessToken, refreshToken };
    const { password: _password, ...userWithoutPassword } = user;

    let needMFALogin: boolean;

    if (user.mfaEnabled) {
      if (user.lastMFALogin) {
        // const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // NOTE: test purpose
        const mfaThreshold = new Date(Date.now() - 5 * 60 * 1000);
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        if (
          user.lastMFALogin < mfaThreshold ||
          (user.logoutTime && user.logoutTime < fifteenMinutesAgo)
        ) {
          needMFALogin = true;
        } else {
          needMFALogin = false;
        }
      } else {
        needMFALogin = true;
      }
    } else {
      needMFALogin = false;
    }

    return { user: { ...user, needMFALogin }, accessToken, refreshToken };
  }
}

export default AuthService;

const loginStudent = async (data: loginType) => {
  // First, try to find just the ID and password
  const student = await prisma.student.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.username }],
    },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      accountStatus: true,
      // ONLY essential fields
    },
  });

  if (!student) {
    throw new AppError("Username or email not found", "NOT_FOUND", 404);
  }
  if (student.accountStatus !== "ACTIVE") {
    throw new AppError("Student account is not active", "FORBIDDEN", 403);
  }
  const isPasswordValid = await bcrypt.compare(data.password, student.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", "UNAUTHORIZED", 401);
  }

  // If password is valid, fetch the full student data (excluding problematic fields)
  const fullStudent = await prisma.student.findUnique({
    where: { id: student.id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      mobile: true,
      address: true,
      photo: true,
      nationality: true,
      studentNo: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Generate JWT tokens
  const accessToken = generateAccessToken({
    id: student.id,
    email: student.email,
    username: student.username,
  });
  const refreshToken = generateRefreshToken({
    id: student.id,
    email: student.email,
    username: student.username,
  });

  return {
    student: fullStudent,
    accessToken,
    refreshToken,
  };
};
// const createManualPayment = async (data: ManualPaymentForm) => {
//   return await prisma.$transaction(async (tx) => {
//     const application = await tx.application.findUnique({
//       where: { id: data.applicationId },
//     });

//     if (!application) {
//       throw new AppError("Application not found", "NOT_FOUND", 404);
//     }

//     const paymentRecord = await tx.paymentRecord.create({
//       data: {
//         applicantId: data.applicationId,
//         totalFee: data.amount,
//         paidAmount: data.amount,
//         remainingAmount: 0,
//         paymentPlan:
//           data.paymentType === "FULL" ? "FULL_PAYMENT" : "INSTALLMENT",
//         paymentStatus: "PENDING",
//         dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       },
//     });

//     const paymentHistory = await tx.paymentHistory.create({
//       data: {
//         paymentRecordId: paymentRecord.id,
//         amount: data.amount,
//         paymentMethod: "BANK_TRANSFER",
//         status: "PENDING",
//         paymentDate: new Date(),
//         reference: data.referenceNo,
//         bank_account_number: data.accountNo,
//         bank_account_name: data.accountName,
//         bank_name: data.bankName || "",
//         receipt_url: data.receipts || "",
//         // notes: `Manual payment submitted for approval (${currency || "USD"})`,
//         payment_status: false,
//       },
//     });

//     return {
//       paymentRecord,
//       paymentHistory,
//     };
//   });
// };

const createManualPayment = async (data: ManualPaymentForm) => {
  return await prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: { id: data.applicationId },
      include: {
        courseSelection: {
          include: {
            course: {
              include: {
                course: true,
                courseFees: {
                  where: { status: "ACTIVE" },
                  include: {
                    courseFeeStructure: {
                      include: {
                        semesters: { orderBy: { semesterOrder: "asc" } },
                      },
                    },
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    const semesters =
      application.courseSelection?.course?.courseFees?.[0]?.courseFeeStructure
        ?.semesters || [];

    // Calculate total fee from all semesters
    const totalSemesterFee = semesters.reduce(
      (sum, sem) => sum + sem.semesterFee,
      0,
    );

    // Check if payment record already exists
    const existingPaymentRecord = await tx.paymentRecord.findFirst({
      where: {
        applicantId: data.applicationId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        paymentHistories: true,
      },
    });

    if (existingPaymentRecord) {
      // Check for duplicate reference number to prevent duplicate payments
      const duplicateReference = await tx.paymentHistory.findFirst({
        where: {
          paymentRecordId: existingPaymentRecord.id,
          reference: data.referenceNo,
        },
      });

      if (duplicateReference) {
        throw new AppError(
          "Payment with this reference number already exists",
          "DUPLICATE_REFERENCE",
          409,
        );
      }

      // Payment record exists - add new payment history (for subsequent payments)
      if (existingPaymentRecord.paymentPlan === "INSTALLMENT") {
        const paidInstallments = existingPaymentRecord.paymentHistories.filter(
          (ph) => ph.status === "PAID" || ph.status === "PENDING",
        ).length;
        const nextSemesterIndex = paidInstallments;

        if (nextSemesterIndex >= semesters.length) {
          throw new AppError(
            "All semester payments have already been made",
            "ALL_PAID",
            400,
          );
        }

        const expectedSemesterAmount = semesters[nextSemesterIndex].semesterFee;

        if (data.amount < expectedSemesterAmount) {
          console.warn(
            `Partial payment detected: Expected ${expectedSemesterAmount}, got ${data.amount} for semester ${semesters[nextSemesterIndex].semesterName}`,
          );
        }

        const paymentHistory = await tx.paymentHistory.create({
          data: {
            paymentRecordId: existingPaymentRecord.id,
            amount: data.amount,
            status: "PENDING",
            paymentMethod: "BANK_TRANSFER",
            reference: data.referenceNo,
            paymentDate: new Date(),
            notes: `Manual payment for ${semesters[nextSemesterIndex].semesterName}`,
            payment_status: false,
            bank_account_name: data.accountName,
            bank_name: data.bankName || "",
            bank_account_number: data.accountNo,
            receipt_url: data.receipts,
          },
        });

        const updatedPaidAmount =
          existingPaymentRecord.paidAmount + data.amount;
        const updatedRemainingAmount = Math.max(
          0,
          existingPaymentRecord.totalFee - updatedPaidAmount,
        );
        const newPaymentStatus =
          updatedRemainingAmount <= 0 ? "PAID" : "PENDING";

        await tx.paymentRecord.update({
          where: { id: existingPaymentRecord.id },
          data: {
            paidAmount: updatedPaidAmount,
            remainingAmount: updatedRemainingAmount,
            paymentStatus: newPaymentStatus,
            installmentsPaid: nextSemesterIndex + 1,
          },
        });

        if (newPaymentStatus === "PAID") {
          await tx.application.update({
            where: { id: application.id },
            data: { status: "APPROVED" },
          });
        }

        return {
          paymentHistory,
          message: `Manual payment for ${semesters[nextSemesterIndex].semesterName} recorded successfully`,
        };
      }

      // FULL_PAYMENT - add payment history
      const firstSemesterPaid = existingPaymentRecord.paymentHistories.some(
        (history) =>
          history.status === "PAID" &&
          semesters.length > 0 &&
          Math.abs(history.amount - semesters[0].semesterFee) < 0.01,
      );

      const paymentHistory = await tx.paymentHistory.create({
        data: {
          paymentRecordId: existingPaymentRecord.id,
          amount: data.amount,
          status: "PENDING",
          paymentMethod: "BANK_TRANSFER",
          reference: data.referenceNo,
          paymentDate: new Date(),
          notes: firstSemesterPaid
            ? "Manual payment for remaining balance"
            : "Manual payment recorded by student",
          payment_status: false,
          bank_account_name: data.accountName,
          bank_name: data.bankName || "",
          bank_account_number: data.accountNo,
          receipt_url: data.receipts,
        },
      });

      const updatedPaidAmount = existingPaymentRecord.paidAmount + data.amount;
      const updatedRemainingAmount = Math.max(
        0,
        existingPaymentRecord.totalFee - updatedPaidAmount,
      );
      const newPaymentStatus = updatedRemainingAmount <= 0 ? "PAID" : "PENDING";

      await tx.paymentRecord.update({
        where: { id: existingPaymentRecord.id },
        data: {
          paidAmount: updatedPaidAmount,
          remainingAmount: updatedRemainingAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      if (newPaymentStatus === "PAID") {
        await tx.application.update({
          where: { id: application.id },
          data: { status: "APPROVED" },
        });
      }

      return {
        paymentHistory,
        message: firstSemesterPaid
          ? "Manual payment for remaining balance recorded successfully"
          : "Manual payment recorded successfully",
      };
    }

    // No payment record exists - create new one based on paymentType
    if (data.paymentType === "FULL") {
      // FULL payment: Create single payment record with full amount
      const paymentRecord = await tx.paymentRecord.create({
        data: {
          applicantId: data.applicationId,
          totalFee: data.amount,
          paidAmount: data.amount,
          remainingAmount: 0,
          paymentPlan: "FULL_PAYMENT",
          paymentStatus: "PENDING",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const paymentHistory = await tx.paymentHistory.create({
        data: {
          paymentRecordId: paymentRecord.id,
          amount: data.amount,
          status: "PENDING",
          paymentMethod: "BANK_TRANSFER",
          reference: data.referenceNo,
          paymentDate: new Date(),
          payment_status: false,
          bank_account_name: data.accountName,
          bank_name: data.bankName || "",
          bank_account_number: data.accountNo,
          receipt_url: data.receipts,
        },
      });

      return {
        paymentRecord,
        paymentHistory,
      };
    } else {
      // SEMESTER payment: Create payment record with total fee from all semesters
      const numberOfSemesters = semesters.length || 2;
      const firstSemesterAmount = semesters[0]?.semesterFee || data.amount;

      // Validate if payment amount matches first semester fee
      if (Math.abs(data.amount - firstSemesterAmount) > 0.01) {
        console.warn(
          `Payment amount mismatch: Expected ${firstSemesterAmount} for Semester 1, got ${data.amount}`,
        );
      }

      const paymentRecord = await tx.paymentRecord.create({
        data: {
          applicantId: data.applicationId,
          totalFee: totalSemesterFee || data.amount * numberOfSemesters,
          paidAmount: data.amount,
          remainingAmount: Math.max(
            0,
            (totalSemesterFee || data.amount * numberOfSemesters) - data.amount,
          ),
          paymentPlan: "INSTALLMENT",
          paymentStatus: "PENDING",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalInstallments: numberOfSemesters,
          installmentsPaid: 1,
        },
      });

      const paymentHistory = await tx.paymentHistory.create({
        data: {
          paymentRecordId: paymentRecord.id,
          amount: data.amount,
          status: "PENDING",
          paymentMethod: "BANK_TRANSFER",
          reference: data.referenceNo,
          paymentDate: new Date(),
          notes: `Manual payment for ${semesters[0]?.semesterName || "Semester 1"}`,
          payment_status: false,
          bank_account_name: data.accountName,
          bank_name: data.bankName || "",
          bank_account_number: data.accountNo,
          receipt_url: data.receipts,
        },
      });

      return {
        paymentRecord,
        paymentHistory,
      };
    }
  });
};

export const createStudentManualPaymentByCourse = async (
  studentId: string,
  paymentData: {
    studentCourseId: string;
    amount: number;
    transactionId?: string;
    paymentMethod?: PaymentMethod;
    paymentDate?: string;
    notes?: string;
    image?: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    swiftCode?: string;
    currencyType?: string;
  },
) => {
  const {
    studentCourseId,
    amount,
    transactionId,
    paymentMethod = PaymentMethod.CASH,
    paymentDate,
    notes,
  } = paymentData;

  // Find the StudentCourse record by studentId and studentCourseId
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId,
    },
    include: {
      student: true,
      sessionCourse: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found", "NOT_FOUND", 404);
  }

  // Find applications with courseSelection matching this sessionCourse
  const applications = await prisma.application.findMany({
    where: {
      courseSelection: {
        courseId: studentCourse.sessionCourse.id,
      },
    },
    include: {
      personalInformation: true,
    },
  });

  // Filter applications by student email
  const application = applications.find(
    (app) => app.personalInformation?.email === studentCourse.student.email,
  );

  if (!application) {
    throw new AppError(
      "Application not found for this student and course",
      "NOT_FOUND",
      404,
    );
  }

  // Find the payment record for this application
  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      application: {
        id: application.id,
      },
    },
    include: {
      paymentHistories: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!paymentRecord) {
    throw new AppError(
      "No payment record found for this application",
      "NOT_FOUND",
      404,
    );
  }

  // Determine if this is an installment payment or full payment
  if (paymentRecord.paymentPlan === "INSTALLMENT") {
    const applicationWithCourse = await prisma.application.findUnique({
      where: { id: application.id },
      include: {
        courseSelection: {
          include: {
            course: {
              include: {
                course: true,
                courseFees: {
                  where: { status: "ACTIVE" },
                  include: {
                    courseFeeStructure: {
                      include: {
                        semesters: { orderBy: { semesterOrder: "asc" } },
                      },
                    },
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!applicationWithCourse) {
      throw new AppError(
        "Application with course details not found",
        "NOT_FOUND",
        404,
      );
    }

    const courseFee =
      applicationWithCourse.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];

    const paidInstallments = paymentRecord.paymentHistories.filter(
      (ph) => ph.status === "PAID",
    ).length;
    const nextSemesterIndex = paidInstallments;

    if (nextSemesterIndex >= semesters.length) {
      throw new AppError(
        "All semester payments have already been made",
        "ALL_PAID",
        400,
      );
    }

    const expectedSemesterAmount = semesters[nextSemesterIndex].semesterFee;

    if (amount < expectedSemesterAmount) {
      console.warn(
        `Partial payment detected: Expected ${expectedSemesterAmount}, got ${amount} for semester ${semesters[nextSemesterIndex].semesterName}`,
      );
    }

    const newPaymentHistory = await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount,
        status: "PAID",
        paymentMethod,
        transactionId: transactionId || `MANUAL_${Date.now()}`,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes:
          notes ||
          `Manual payment for ${semesters[nextSemesterIndex].semesterName}`,
        payment_status: false,
        bank_account_name: paymentData.accountName,
        bank_name: paymentData.bankName,
        bank_branch: paymentData.branchName,
        bank_account_number: paymentData.accountNumber,
        bank_swift_code: paymentData.swiftCode,
        receipt_url: paymentData.image,
      },
    });

    const updatedPaidAmount = paymentRecord.paidAmount + amount;
    const updatedRemainingAmount = Math.max(
      0,
      paymentRecord.totalFee - updatedPaidAmount,
    );
    const newPaymentStatus = updatedRemainingAmount <= 0 ? "PAID" : "PENDING";

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        paidAmount: updatedPaidAmount,
        remainingAmount: updatedRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    if (newPaymentStatus === "PAID") {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: "APPROVED" },
      });

      const isForFirstSemester = nextSemesterIndex === 0;
      // sendEnrollmentNotification({
      //   applicationId: application.id,
      //   amount,
      //   paymentType: isForFirstSemester ? "SEMESTER" : "FULL",
      // });
    }

    return {
      paymentHistory: newPaymentHistory,
      message: `Manual payment for ${semesters[nextSemesterIndex].semesterName} recorded successfully`,
    };
  } else {
    // FULL_PAYMENT
    const applicationWithCourse = await prisma.application.findUnique({
      where: { id: application.id },
      include: {
        courseSelection: {
          include: {
            course: {
              include: {
                course: true,
                courseFees: {
                  where: { status: "ACTIVE" },
                  include: {
                    courseFeeStructure: {
                      include: {
                        semesters: { orderBy: { semesterOrder: "asc" } },
                      },
                    },
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const semesters =
      applicationWithCourse?.courseSelection?.course?.courseFees?.[0]
        ?.courseFeeStructure?.semesters || [];
    const firstSemesterPaid = paymentRecord.paymentHistories.some(
      (history) =>
        history.status === "PAID" &&
        semesters.length > 0 &&
        Math.abs(history.amount - semesters[0].semesterFee) < 0.01,
    );

    const newPaymentHistory = await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount,
        status: "PENDING",
        paymentMethod,
        transactionId: transactionId || `MANUAL_${Date.now()}`,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes:
          notes ||
          (firstSemesterPaid
            ? "Manual payment for remaining balance"
            : "Manual payment recorded by student"),
        payment_status: false,
        bank_account_name: paymentData.accountName,
        bank_name: paymentData.bankName,
        bank_branch: paymentData.branchName,
        bank_account_number: paymentData.accountNumber,
        bank_swift_code: paymentData.swiftCode,
        receipt_url: paymentData.image,
      },
    });

    const updatedPaidAmount = paymentRecord.paidAmount + amount;
    const updatedRemainingAmount = Math.max(
      0,
      paymentRecord.totalFee - updatedPaidAmount,
    );
    const newPaymentStatus = updatedRemainingAmount <= 0 ? "PAID" : "PENDING";

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        paidAmount: updatedPaidAmount,
        remainingAmount: updatedRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    if (newPaymentStatus === "PAID") {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: "APPROVED" },
      });

      const isForFirstSemester =
        !firstSemesterPaid &&
        semesters.length > 0 &&
        Math.abs(amount - semesters[0].semesterFee) < 0.01;
      // await sendEnrollmentEmail(application.id, amount, isForFirstSemester ? "SEMESTER" : "FULL");
    }

    return {
      paymentHistory: newPaymentHistory,
      message: firstSemesterPaid
        ? "Manual payment for remaining balance recorded successfully"
        : "Manual payment recorded successfully",
    };
  }
};

export const StudentManagementService = {
  loginStudent,
  createManualPayment,
  createStudentManualPaymentByCourse,
};
