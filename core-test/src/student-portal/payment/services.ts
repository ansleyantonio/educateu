import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import stripe, { StripePaymentService } from "../../payments/sevices";
import { sendEnrollmentEmail } from "../../modules/student-management/mail/enrollMail";

type InstallmentPayment = {
  installmentNumber: number;
  // paymentRecordId: string;
  semesterName: string;
  // nextPaymentAmount: number;
  dueDate: Date | null;
  courseName: string;
  applicationId: string;
  amount: number;
  status: "OVERDUE" | "PENDING" | "PAID";
  paymentPlan: string;
  payable: boolean;
  semesterOrder: number;
};

import { getPagination } from "../../utils/paginationUtils";

export const getStudentPaymentTransactions = async (studentId: string, page: number = 1, pageSize: number = 10) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { email: true },
  });

  if (!student?.email) {
    throw new Error("Student not found or email is missing");
  }

  const { offset, limit } = getPagination(page, pageSize);

  const [paymentHistories, totalCount] = await prisma.$transaction([
    prisma.paymentHistory.findMany({
      where: {
        amount: { gt: 0 },
        paymentRecord: {
          application: {
            personalInformation: {
              email: student.email,
            },
          },
        },
      },
      select: {
        transactionId: true,
        amount: true,
        status: true,
        paymentMethod: true,
        paymentDate: true,
        receipt_url: true,
        paymentRecord: {
          select: {
            application: {
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
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paymentDate: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.paymentHistory.count({
      where: {
        amount: { gt: 0 },
        paymentRecord: {
          application: {
            personalInformation: {
              email: student.email,
            },
          },
        },
      },
    }),
  ]);

  const mappedPaymentHistories = paymentHistories.map((p) => {
    const courseTitle = p.paymentRecord.application.courseSelection?.course?.course?.title;

    return {
      transactionId: p.transactionId ?? "N/A",
      description: courseTitle ? `${courseTitle} payment` : "Course payment",
      amount: p.amount,
      status: p.status,
      receiptUrl: p.receipt_url || "N/A",
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
    };
  });
  const paginationData = {
    count: mappedPaymentHistories.length,
    total: totalCount,
    page,
    perPage: limit,
    totalPages: Math.ceil(totalCount / limit),
  };

  return {
    payments: mappedPaymentHistories,
    pagination: paginationData,
  };
};

// Define the structure for semester-wise due payments
type SemesterDuePayment = {
  semesterName: string;
  semesterOrder: number;
  dueDate: Date | null;
  courseName: string;
  applicationId: string;
  amount: number;
  status: "OVERDUE" | "PENDING" | "PAID";
  paymentPlan: string;
};

type ApplicationWithSemesterPayments = {
  applicationId: string;
  courseName: string;
  semesters: SemesterDuePayment[];
};

export const getStudentDuePayments = async (studentId: string, page: number = 1, pageSize: number = 10) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      email: true,
      // added this part
      studentCourses: {
        select: {
          enrollmentStatus: true,
          sessionCourseId: true,
        },
      },
      // added this part
    },
  });

  if (!student?.email) {
    throw new AppError("Student not found or email missing", "NOT_FOUND", 404);
  }

  // added this part
  const activeSessionCourseIds = student.studentCourses
  .filter((c) => c.enrollmentStatus !== "WITHDRAWN")
  .map((c) => c.sessionCourseId);
  // added this part

  const { offset, limit } = getPagination(page, pageSize);

  // Get all applications with their payment records for this student
  const allApplications = await prisma.application.findMany({
    where: {
      personalInformation: { email: student.email },
      // added this part
      courseSelection: {
        courseId: {
          in: activeSessionCourseIds,
        },
      }
      // added this part
    },
    select: {
      id: true,
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
                where: { status: "ACTIVE" },
                include: {
                  courseFeeStructure: {
                    include: { semesters: { orderBy: { semesterOrder: "asc" } } },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
      paymentRecords: {
        include: {
          paymentHistories: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { dueDate: "desc" },
      },
    },
  });

  // Calculate all due payments for all applications grouped by application and semester
  const applicationsWithSemesterPayments: ApplicationWithSemesterPayments[] = allApplications.map((app) => {
    const courseFee = app.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters ?? [];

    // Process each payment record for the application
    const semesterPayments: SemesterDuePayment[] = [];

    app.paymentRecords.forEach((pr) => {
      // For installment plans, calculate semester-wise payments
      if (pr.paymentPlan === "INSTALLMENT") {
        const paidHistories = pr.paymentHistories.filter((ph) => ph.status === "PAID");

        // Map each semester to its payment status
        semesters.forEach((semester, index) => {
          // Check if this semester has been paid
          const semesterPaid = paidHistories.some(
            (ph) => Math.abs(ph.amount - semester.semesterFee) < 0.01, // Using small tolerance for floating point comparison
          );

          // Determine status based on payment history
          let status: "OVERDUE" | "PENDING" | "PAID" = "PENDING";
          if (semesterPaid) {
            status = "PAID";
          } else if (pr.dueDate && new Date() > new Date(pr.dueDate)) {
            status = "OVERDUE";
          }

          // Only add to due payments if not already paid
          if (!semesterPaid) {
            semesterPayments.push({
              semesterName: semester.semesterName,
              semesterOrder: semester.semesterOrder,
              dueDate: pr.dueDate,
              courseName: app.courseSelection?.course?.course?.title || "Course",
              applicationId: app.id,
              amount: semester.semesterFee,
              status,
              paymentPlan: pr.paymentPlan,
            });
          }
        });
      }
      // For full payment plans that are not fully paid
      else if (pr.paymentPlan === "FULL_PAYMENT" && pr.paymentStatus !== "PAID") {
        // For full payment plans, we need to check which semesters have been paid
        // and show the remaining semesters individually
        const paidHistories = pr.paymentHistories.filter((ph) => ph.status === "PAID");

        // For each semester, check if it has been paid
        semesters.forEach((semester, index) => {
          const semesterPaid = paidHistories.some(
            (history) => history.status === "PAID" && Math.abs(history.amount - semester.semesterFee) < 0.01,
          );

          // Only add to due payments if not already paid
          if (!semesterPaid) {
            // Determine status based on payment history
            let status: "OVERDUE" | "PENDING" | "PAID" = "PENDING";
            if (semesterPaid) {
              status = "PAID";
            } else if (pr.dueDate && new Date() > new Date(pr.dueDate)) {
              status = "OVERDUE";
            }

            semesterPayments.push({
              semesterName: semester.semesterName,
              semesterOrder: semester.semesterOrder,
              dueDate: pr.dueDate,
              courseName: app.courseSelection?.course?.course?.title || "Course",
              applicationId: app.id,
              amount: semester.semesterFee,
              status,
              paymentPlan: pr.paymentPlan,
            });
          }
        });
      }
    });

    return {
      applicationId: app.id,
      courseName: app.courseSelection?.course?.course?.title || "Course",
      semesters: semesterPayments,
    };
  });

  // Flatten all semester payments from all applications for pagination
  const allSemesterPayments = applicationsWithSemesterPayments.flatMap((app) =>
    app.semesters.map((semester) => ({
      ...semester,
      applicationId: app.applicationId,
      courseName: app.courseName,
    })),
  );

  // Apply pagination to the flattened semester payments
  const paginatedSemesterPayments = allSemesterPayments.slice(offset, offset + limit);
  const totalCount = allSemesterPayments.length;

  const paginationData = {
    count: paginatedSemesterPayments.length,
    total: totalCount,
    page,
    perPage: limit,
    totalPages: Math.ceil(totalCount / limit),
  };

  // Add payable flag to indicate which payments can be made
  const paymentsWithPayable = paginatedSemesterPayments.map((payment, index, arr) => {
    // For both installment and full payment plans, only the earliest unpaid semester should be payable
    const isEarliestUnpaid = !arr.some(
      (p, i) =>
        i < index &&
        p.applicationId === payment.applicationId &&
        p.semesterOrder < payment.semesterOrder &&
        p.status !== "PAID",
    );

    return {
      installmentNumber: payment.semesterOrder,
      semesterName: payment.semesterName,
      dueDate: payment.dueDate,
      courseName: payment.courseName,
      applicationId: payment.applicationId,
      amount: payment.amount,
      status: payment.status,
      paymentPlan: payment.paymentPlan,
      payable: isEarliestUnpaid && payment.status !== "PAID",
      semesterOrder: payment.semesterOrder,
    };
  });

  return {
    payments: paymentsWithPayable,
    pagination: paginationData,
  };
};

export const createStudentCheckoutSession = async (applicationId: string, studentId: string, semesterNo?: number) => {
  // First, get the application and associated payment records
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
      paymentRecords: {
        include: {
          paymentHistories: true,
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
              courseFees: {
                where: { status: "ACTIVE" },
                include: {
                  courseFeeStructure: {
                    include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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

  // Check if the student is associated with this application
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError("Student not found", "NOT_FOUND", 404);
  }

  // Verify that the application belongs to this student
  if (application.personalInformation?.email !== student.email) {
    throw new AppError("Unauthorized: This application does not belong to the current student", "UNAUTHORIZED", 401);
  }

  // Check if full payment has already been made for this application
  const fullPaymentMade = application.paymentRecords.some(
    (record) => record.paymentStatus === "PAID" && record.paymentPlan === "FULL_PAYMENT",
  );

  // If full payment has been made, don't allow any more payments
  if (fullPaymentMade) {
    throw new AppError("Full payment has already been made for this application", "FULL_PAYMENT_MADE", 400);
  }

  // Find an unpaid payment record for this application
  // Look for records that have either:
  // 1. Installment plans that have unpaid semesters
  // 2. Full payment plans that are not fully paid
  const unpaidPaymentRecord = application.paymentRecords.find((record) => {
    if (record.paymentPlan === "INSTALLMENT") {
      // For installment plans, check if there are unpaid semesters
      const courseFee = application.courseSelection?.course?.courseFees?.[0];
      const semesters = courseFee?.courseFeeStructure?.semesters || [];
      const paidInstallments = record.paymentHistories.filter((ph) => ph.status === "PAID").length;
      return paidInstallments < semesters.length;
    } else if (record.paymentPlan === "FULL_PAYMENT") {
      // For full payment plans, check if the payment status is not fully paid
      return record.paymentStatus !== "PAID";
    }
    return false;
  });

  if (!unpaidPaymentRecord) {
    throw new AppError("No pending payments found for this application", "NO_PENDING_PAYMENTS", 400);
  }

  // Prepare data for checkout session
  let paymentType: "FULL" | "SEMESTER" = "SEMESTER"; // Default to SEMESTER
  let amount = 0;
  let courseName = application.courseSelection?.course?.course?.title || "Course Payment";

  // Check if we're dealing with a specific semester payment
  if (semesterNo !== undefined) {
    // Get the course fee structure to determine the semester fee
    const courseFee = application.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];

    // Find the specific semester by number
    const semester = semesters.find((s) => s.semesterOrder === semesterNo);

    if (!semester) {
      throw new AppError(`Semester ${semesterNo} not found for this course`, "SEMESTER_NOT_FOUND", 404);
    }

    // Check if this specific semester has already been paid
    const semesterAlreadyPaid = unpaidPaymentRecord.paymentHistories.some(
      (history) => history.status === "PAID" && Math.abs(history.amount - semester.semesterFee) < 0.01, // Using small tolerance for floating point comparison
    );

    if (semesterAlreadyPaid) {
      throw new AppError(`Semester ${semesterNo} has already been paid`, "SEMESTER_ALREADY_PAID", 400);
    }

    amount = semester.semesterFee;
    courseName = `${courseName} - Semester ${semesterNo}`;
    paymentType = "SEMESTER";
  } else {
    // Determine which semester payment to make based on payment history
    // For both INSTALLMENT and FULL_PAYMENT plans, we want to find the first unpaid semester
    const courseFee = application.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];

    // Find the first unpaid semester by looking at payment histories
    // Sort semesters by order to ensure we process them in sequence
    const sortedSemesters = [...semesters].sort((a, b) => a.semesterOrder - b.semesterOrder);

    // Find the first semester that hasn't been paid
    for (const semester of sortedSemesters) {
      const semesterAlreadyPaid = unpaidPaymentRecord.paymentHistories.some(
        (history) => history.status === "PAID" && Math.abs(history.amount - semester.semesterFee) < 0.01,
      );

      if (!semesterAlreadyPaid) {
        // This is the first unpaid semester, so we'll charge for this
        amount = semester.semesterFee;
        courseName = `${courseName} - ${semester.semesterName}`;
        paymentType = "SEMESTER";
        break;
      }
    }

    // If all semesters are paid but payment status is still not "PAID", then it's a remaining balance situation
    if (amount === 0 && unpaidPaymentRecord.paymentStatus !== "PAID") {
      // Calculate remaining balance
      const totalPaid = unpaidPaymentRecord.paymentHistories.reduce(
        (sum: number, history) => (history.status === "PAID" ? sum + history.amount : sum),
        0,
      );
      amount = unpaidPaymentRecord.totalFee - totalPaid;
      courseName = `${courseName} - Remaining Balance`;
      paymentType = "FULL";
    }

    // If we still haven't found an amount to charge, throw an error
    if (amount === 0) {
      throw new AppError("No pending semester payments found for this application", "NO_PENDING_SEMESTERS", 400);
    }
  }

  const checkoutData = {
    applicationId: application.id,
    paymentRecordId: unpaidPaymentRecord.id,
    amount,
    currency: "USD", // Default currency, can be changed based on requirements
    paymentType,
    courseName,
    customerEmail: student.email,
  };

  // Create the checkout session using the existing Stripe service
  return await StripePaymentService.createCheckoutSession(checkoutData);
};

import { CreateManualPaymentData } from "./schema";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { send } from "process";
import { sendEnrollmentNotification } from "../../utils/notificationService";

export const createStudentManualPayment = async (studentId: string, paymentData: CreateManualPaymentData) => {
  const { applicationId, amount, transactionId, paymentMethod = PaymentMethod.CASH, paymentDate, notes } = paymentData;

  // Verify that the student is associated with the application
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { email: true },
  });

  if (!student?.email) {
    throw new AppError("Student not found or email missing", "NOT_FOUND", 404);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, personalInformation: { select: { email: true } } },
  });

  if (!application) {
    throw new AppError("Application not found", "NOT_FOUND", 404);
  }

  if (application.personalInformation?.email !== student.email) {
    throw new AppError("Unauthorized: This application does not belong to the current student", "UNAUTHORIZED", 401);
  }

  // Find the payment record for this application
  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      application: {
        id: applicationId,
      },
    },
    include: {
      paymentHistories: true,
    },
    orderBy: { createdAt: "desc" }, // Get the most recent payment record
  });

  if (!paymentRecord) {
    throw new AppError("No payment record found for this application", "NOT_FOUND", 404);
  }

  // Determine if this is an installment payment or full payment
  if (paymentRecord.paymentPlan === "INSTALLMENT") {
    // For installment payments, we need to find which semester this payment corresponds to
    const applicationWithCourse = await prisma.application.findUnique({
      where: { id: applicationId },
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
                      include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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
      throw new AppError("Application with course details not found", "NOT_FOUND", 404);
    }

    const courseFee = applicationWithCourse.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];

    // Calculate which semester payment is being made based on payment history
    const paidInstallments = paymentRecord.paymentHistories.filter((ph) => ph.status === "PAID").length;
    const nextSemesterIndex = paidInstallments; // 0-based index

    if (nextSemesterIndex >= semesters.length) {
      throw new AppError("All semester payments have already been made", "ALL_PAID", 400);
    }

    // Validate that all previous semesters are paid (sequential payment enforcement)
    const paidSemesterIndices = paymentRecord.paymentHistories
      .filter((ph) => ph.status === "PAID")
      .map((ph, index) => index);

    for (let i = 0; i < nextSemesterIndex; i++) {
      if (!paidSemesterIndices.includes(i)) {
        const nextUnpaidSemester = semesters[i];
        throw new AppError(
          `Semester ${i + 1} (${nextUnpaidSemester.semesterName}) must be paid before proceeding to semester ${nextSemesterIndex + 1}`,
          "SEQUENTIAL_PAYMENT_REQUIRED",
          400,
        );
      }
    }

    const expectedSemesterAmount = semesters[nextSemesterIndex].semesterFee;

    // Verify the amount matches the expected semester amount (or allow partial payments)
    if (amount < expectedSemesterAmount) {
      // Allow partial payments but warn
      console.warn(
        `Partial payment detected: Expected ${expectedSemesterAmount}, got ${amount} for semester ${semesters[nextSemesterIndex].semesterName}`,
      );
    }

    // Check for duplicate pending payment
    const existingPendingPayment = await prisma.paymentHistory.findFirst({
      where: {
        paymentRecordId: paymentRecord.id,
        amount: amount,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPendingPayment) {
      throw new AppError("Already in PENDING condition. Duplicate manual payment not allowed.", "BAD_REQUEST", 400);
    }

    console.log("Creating manual payment...", paymentData.image);
    // Create the manual payment in payment history
    const newPaymentHistory = await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount,
        status: PaymentStatus.PAID, // Manual payments are considered paid
        paymentMethod,
        transactionId: transactionId || `MANUAL_${Date.now()}`, // Generate a unique transaction ID if not provided
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(), // Use provided date or current date
        notes: notes || `Manual payment for ${semesters[nextSemesterIndex].semesterName}`,
        payment_status: false,
        // Save bank info if provided
        bank_account_name: paymentData.accountName,
        bank_name: paymentData.bankName,
        bank_branch: paymentData.branchName,
        bank_account_number: paymentData.accountNumber,
        bank_swift_code: paymentData.swiftCode,
        receipt_url: paymentData.image,
      },
    });

    // Update the payment record with the new payment information
    const updatedPaidAmount = paymentRecord.paidAmount + amount;
    const updatedRemainingAmount = Math.max(0, paymentRecord.totalFee - updatedPaidAmount);
    const newPaymentStatus = updatedRemainingAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        paidAmount: updatedPaidAmount,
        remainingAmount: updatedRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    // Send enrollment email if payment completes first semester or full payment
    if (newPaymentStatus === PaymentStatus.PAID) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "APPROVED" },
      });

      // Determine if this was a first semester payment
      const isForFirstSemester = nextSemesterIndex === 0;
      // await sendEnrollmentEmail(applicationId, amount, isForFirstSemester ? "SEMESTER" : "FULL");
      sendEnrollmentNotification({ applicationId, amount, paymentType: isForFirstSemester ? "SEMESTER" : "FULL" });
    }

    return {
      paymentHistory: newPaymentHistory,
      message: `Manual payment for ${semesters[nextSemesterIndex].semesterName} recorded successfully`,
    };
  } else {
    // For full payments, check if first semester has been paid and adjust accordingly
    const applicationWithCourse = await prisma.application.findUnique({
      where: { id: applicationId },
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
                      include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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

    // Check if first semester has been paid
    const semesters =
      applicationWithCourse?.courseSelection?.course?.courseFees?.[0]?.courseFeeStructure?.semesters || [];

    // Validate sequential semester payments for full payment plan
    // Find which semesters have been paid
    const paidSemesters = new Set<number>();
    paymentRecord.paymentHistories
      .filter((history) => history.status === "PAID")
      .forEach((history) => {
        const semesterIndex = semesters.findIndex((sem) => Math.abs(history.amount - sem.semesterFee) < 0.01);
        if (semesterIndex !== -1) {
          paidSemesters.add(semesterIndex);
        }
      });

    // Check for gaps in semester payments (sequential enforcement)
    let firstUnpaidSemesterIndex = -1;
    for (let i = 0; i < semesters.length; i++) {
      if (!paidSemesters.has(i)) {
        firstUnpaidSemesterIndex = i;
        break;
      }
    }

    // If all semesters are paid, allow remaining balance payment
    const allSemestersPaid = firstUnpaidSemesterIndex === -1;

    // If not all semesters are paid, validate that we're paying for the correct next semester
    if (!allSemestersPaid && firstUnpaidSemesterIndex > 0) {
      // Check if the payment amount matches the first unpaid semester
      const firstUnpaidSemester = semesters[firstUnpaidSemesterIndex];
      const isPayingForCorrectSemester =
        Math.abs(amount - firstUnpaidSemester.semesterFee) < 0.01 || amount >= firstUnpaidSemester.semesterFee;

      if (!isPayingForCorrectSemester) {
        // Check if user is trying to pay for a later semester
        const isPayingForLaterSemester = semesters.some(
          (sem, idx) => idx > firstUnpaidSemesterIndex && Math.abs(amount - sem.semesterFee) < 0.01,
        );

        if (isPayingForLaterSemester) {
          throw new AppError(
            `Semester ${firstUnpaidSemesterIndex + 1} (${firstUnpaidSemester.semesterName}) must be paid before proceeding to higher semesters`,
            "SEQUENTIAL_PAYMENT_REQUIRED",
            400,
          );
        }
      }
    }

    const firstSemesterPaid = paymentRecord.paymentHistories.some(
      (history) =>
        history.status === "PAID" && semesters.length > 0 && Math.abs(history.amount - semesters[0].semesterFee) < 0.01,
    );

    // Check for duplicate pending payment
    const existingPendingPayment = await prisma.paymentHistory.findFirst({
      where: {
        paymentRecordId: paymentRecord.id,
        amount: amount,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPendingPayment) {
      throw new AppError("Already in PENDING condition. Duplicate manual payment not allowed.", "BAD_REQUEST", 400);
    }

    // Verify the amount for partial payment warning (for full payment plan)
    const totalAmount = semesters.reduce((sum, sem) => sum + sem.semesterFee, 0);
    const expectedRemainingAmount = firstSemesterPaid
      ? semesters.slice(1).reduce((sum, sem) => sum + sem.semesterFee, 0)
      : totalAmount;

    if (amount < expectedRemainingAmount) {
      console.warn(
        `Partial payment detected: Expected ${expectedRemainingAmount}, got ${amount} for ${firstSemesterPaid ? "remaining balance" : "full payment"}`,
      );
    }

    // Create the manual payment in payment history
    const newPaymentHistory = await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount,
        status: PaymentStatus.PENDING, // Manual payments are considered paid
        paymentMethod,
        receipt_url: paymentData.image || "N/A",
        transactionId: transactionId || `MANUAL_${Date.now()}`, // Generate a unique transaction ID if not provided
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(), // Use provided date or current date
        notes:
          notes || (firstSemesterPaid ? "Manual payment for remaining balance" : "Manual payment recorded by student"),
      },
    });

    // Update the payment record with the new payment information
    const updatedPaidAmount = paymentRecord.paidAmount + amount;
    const updatedRemainingAmount = Math.max(0, paymentRecord.totalFee - updatedPaidAmount);
    const newPaymentStatus = updatedRemainingAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        paidAmount: updatedPaidAmount,
        remainingAmount: updatedRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    // Send enrollment email if payment completes first semester or full payment
    if (newPaymentStatus === PaymentStatus.PAID) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "APPROVED" },
      });

      // Determine if this was a first semester payment
      const isForFirstSemester =
        !firstSemesterPaid && semesters.length > 0 && Math.abs(amount - semesters[0].semesterFee) < 0.01;
      await sendEnrollmentEmail(applicationId, amount, isForFirstSemester ? "SEMESTER" : "FULL");
    }

    return {
      paymentHistory: newPaymentHistory,
      message: firstSemesterPaid
        ? "Manual payment for remaining balance recorded successfully"
        : "Manual payment recorded successfully",
    };
  }
};

export const createStudentCheckoutSessionByCourse = async (
  studentId: string,
  studentCourseId: string,
  semesterNo?: number,
) => {
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
          session: true,
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
      paymentRecords: {
        include: {
          paymentHistories: true,
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
              courseFees: {
                where: { status: "ACTIVE" },
                include: {
                  courseFeeStructure: {
                    include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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

  // Filter applications by student email
  const application = applications.find((app) => app.personalInformation?.email === studentCourse.student.email);

  if (!application) {
    throw new AppError("Application not found for this student and course", "NOT_FOUND", 404);
  }

  // Check if full payment has already been made for this application
  const fullPaymentMade = application.paymentRecords.some(
    (record: { paymentStatus: string; paymentPlan: string }) =>
      record.paymentStatus === "PAID" && record.paymentPlan === "FULL_PAYMENT",
  );

  // If full payment has been made, don't allow any more payments
  if (fullPaymentMade) {
    throw new AppError("Full payment has already been made for this application", "FULL_PAYMENT_MADE", 400);
  }

  // Find an unpaid payment record for this application
  const unpaidPaymentRecord = application.paymentRecords.find(
    (record: {
      paymentPlan: string;
      paymentHistories: { status: string; amount: number }[];
      paymentStatus: string;
    }) => {
      if (record.paymentPlan === "INSTALLMENT") {
        const courseFee = application.courseSelection?.course?.courseFees?.[0];
        const semesters = courseFee?.courseFeeStructure?.semesters || [];
        const paidInstallments = record.paymentHistories.filter(
          (ph: { status: string }) => ph.status === "PAID",
        ).length;
        return paidInstallments < semesters.length;
      } else if (record.paymentPlan === "FULL_PAYMENT") {
        return record.paymentStatus !== "PAID";
      }
      return false;
    },
  );

  if (!unpaidPaymentRecord) {
    throw new AppError("No pending payments found for this application", "NO_PENDING_PAYMENTS", 400);
  }

  // Prepare data for checkout session
  let paymentType: "FULL" | "SEMESTER" = "SEMESTER";
  let amount = 0;
  let courseName = application.courseSelection?.course?.course?.title || "Course Payment";

  // Check if we're dealing with a specific semester payment
  if (semesterNo !== undefined) {
    const courseFee = application.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];

    const semester = semesters.find((s: { semesterOrder: number }) => s.semesterOrder === semesterNo);

    if (!semester) {
      throw new AppError(`Semester ${semesterNo} not found for this course`, "SEMESTER_NOT_FOUND", 404);
    }

    const semesterAlreadyPaid = unpaidPaymentRecord.paymentHistories.some(
      (history: { status: string; amount: number }) =>
        history.status === "PAID" && Math.abs(history.amount - semester.semesterFee) < 0.01,
    );

    if (semesterAlreadyPaid) {
      throw new AppError(`Semester ${semesterNo} has already been paid`, "SEMESTER_ALREADY_PAID", 400);
    }

    amount = semester.semesterFee;
    courseName = `${courseName} - Semester ${semesterNo}`;
    paymentType = "SEMESTER";
  } else {
    const courseFee = application.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];
    const sortedSemesters = [...semesters].sort(
      (a: { semesterOrder: number }, b: { semesterOrder: number }) => a.semesterOrder - b.semesterOrder,
    );

    for (const semester of sortedSemesters) {
      const semesterAlreadyPaid = unpaidPaymentRecord.paymentHistories.some(
        (history: { status: string; amount: number }) =>
          history.status === "PAID" && Math.abs(history.amount - semester.semesterFee) < 0.01,
      );

      if (!semesterAlreadyPaid) {
        amount = semester.semesterFee;
        courseName = `${courseName} - ${semester.semesterName}`;
        paymentType = "SEMESTER";
        break;
      }
    }

    if (amount === 0 && unpaidPaymentRecord.paymentStatus !== "PAID") {
      const totalPaid = unpaidPaymentRecord.paymentHistories.reduce(
        (sum: number, history: { status: string; amount: number }) =>
          history.status === "PAID" ? sum + history.amount : sum,
        0,
      );
      amount = unpaidPaymentRecord.totalFee - totalPaid;
      courseName = `${courseName} - Remaining Balance`;
      paymentType = "FULL";
    }

    if (amount === 0) {
      throw new AppError("No pending semester payments found for this application", "NO_PENDING_SEMESTERS", 400);
    }
  }

  const checkoutData = {
    applicationId: application.id,
    paymentRecordId: unpaidPaymentRecord.id,
    amount,
    currency: "USD",
    paymentType,
    courseName,
    customerEmail: studentCourse.student.email ?? undefined,
  };

  return await StripePaymentService.createCheckoutSession(checkoutData);
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
  const application = applications.find((app) => app.personalInformation?.email === studentCourse.student.email);

  if (!application) {
    throw new AppError("Application not found for this student and course", "NOT_FOUND", 404);
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
    throw new AppError("No payment record found for this application", "NOT_FOUND", 404);
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
                      include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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
      throw new AppError("Application with course details not found", "NOT_FOUND", 404);
    }

    const courseFee = applicationWithCourse.courseSelection?.course?.courseFees?.[0];
    const semesters = courseFee?.courseFeeStructure?.semesters || [];

    const paidInstallments = paymentRecord.paymentHistories.filter(
      (ph: { status: string }) => ph.status === "PAID",
    ).length;
    const nextSemesterIndex = paidInstallments;

    if (nextSemesterIndex >= semesters.length) {
      throw new AppError("All semester payments have already been made", "ALL_PAID", 400);
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
        status: PaymentStatus.PAID,
        paymentMethod,
        transactionId: transactionId || `MANUAL_${Date.now()}`,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes || `Manual payment for ${semesters[nextSemesterIndex].semesterName}`,
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
    const updatedRemainingAmount = Math.max(0, paymentRecord.totalFee - updatedPaidAmount);
    const newPaymentStatus = updatedRemainingAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        paidAmount: updatedPaidAmount,
        remainingAmount: updatedRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    if (newPaymentStatus === PaymentStatus.PAID) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: "APPROVED" },
      });

      const isForFirstSemester = nextSemesterIndex === 0;
      sendEnrollmentNotification({
        applicationId: application.id,
        amount,
        paymentType: isForFirstSemester ? "SEMESTER" : "FULL",
      });
    }

    return {
      paymentHistory: newPaymentHistory,
      message: `Manual payment for ${semesters[nextSemesterIndex].semesterName} recorded successfully`,
    };
  } else {
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
                      include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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
      applicationWithCourse?.courseSelection?.course?.courseFees?.[0]?.courseFeeStructure?.semesters || [];
    const firstSemesterPaid = paymentRecord.paymentHistories.some(
      (history: { status: string; amount: number }) =>
        history.status === "PAID" && semesters.length > 0 && Math.abs(history.amount - semesters[0].semesterFee) < 0.01,
    );

    const newPaymentHistory = await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount,
        status: PaymentStatus.PENDING,
        paymentMethod,
        transactionId: transactionId || `MANUAL_${Date.now()}`,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes:
          notes || (firstSemesterPaid ? "Manual payment for remaining balance" : "Manual payment recorded by student"),
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
    const updatedRemainingAmount = Math.max(0, paymentRecord.totalFee - updatedPaidAmount);
    const newPaymentStatus = updatedRemainingAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        paidAmount: updatedPaidAmount,
        remainingAmount: updatedRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    if (newPaymentStatus === PaymentStatus.PAID) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: "APPROVED" },
      });

      const isForFirstSemester =
        !firstSemesterPaid && semesters.length > 0 && Math.abs(amount - semesters[0].semesterFee) < 0.01;
      await sendEnrollmentEmail(application.id, amount, isForFirstSemester ? "SEMESTER" : "FULL");
    }

    return {
      paymentHistory: newPaymentHistory,
      message: firstSemesterPaid
        ? "Manual payment for remaining balance recorded successfully"
        : "Manual payment recorded successfully",
    };
  }
};

export const StudentPaymentService = {
  getStudentPaymentTransactions,
  getStudentDuePayments,
  createStudentCheckoutSession,
  createStudentManualPayment,
  createStudentCheckoutSessionByCourse,
  createStudentManualPaymentByCourse,
};

/*
 * Gets due payment information for a specific student course and semester
 * Returns payment details for the specified semester or all due semesters
 */
export const getStudentDuePaymentByCourse = async (studentCourseId: string, semesterNo?: number) => {
  // Find the StudentCourse record
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
    },
    include: {
      student: true,
      sessionCourse: {
        include: {
          course: true,
          session: true,
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
      paymentRecords: {
        include: {
          paymentHistories: {
            orderBy: { paymentDate: "desc" },
          },
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
              courseFees: {
                where: { status: "ACTIVE" },
                include: {
                  courseFeeStructure: {
                    include: { semesters: { orderBy: { semesterOrder: "asc" } } },
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

  // Filter applications by student email
  const application = applications.find((app) => app.personalInformation?.email === studentCourse.student.email);

  if (!application) {
    throw new AppError("Application not found for this student and course", "NOT_FOUND", 404);
  }

  // Get course fee structure
  const courseFee = application.courseSelection?.course?.courseFees?.[0];
  const semesters = courseFee?.courseFeeStructure?.semesters || [];

  if (semesters.length === 0) {
    throw new AppError("No course fee structure found for this course", "NOT_FOUND", 404);
  }

  // Get payment records
  const paymentRecords = application.paymentRecords;

  if (paymentRecords.length === 0) {
    throw new AppError("No payment records found for this application", "NOT_FOUND", 404);
  }

  // Get the most recent payment record
  const paymentRecord = paymentRecords[0];

  // Calculate paid semesters
  const paidSemesterNumbers = paymentRecord.paymentHistories
    .filter((ph) => ph.status === "PAID")
    .map((ph) => {
      // Find which semester this payment corresponds to
      const matchingSemester = semesters.find((s) => Math.abs(s.semesterFee - ph.amount) < 0.01);
      return matchingSemester?.semesterOrder;
    })
    .filter(Boolean) as number[];

  // Filter semesters based on semesterNo parameter
  const dueSemesters = semesters.filter((semester) => {
    if (semesterNo !== undefined) {
      return semester.semesterOrder === semesterNo;
    }
    // If no semesterNo specified, return all unpaid semesters
    return !paidSemesterNumbers.includes(semester.semesterOrder);
  });

  // If specific semesterNo is provided, check if it's already paid
  if (semesterNo !== undefined) {
    const isPaid = paidSemesterNumbers.includes(semesterNo);
    if (isPaid) {
      throw new AppError(`Semester ${semesterNo} has already been paid`, "ALREADY_PAID", 400);
    }
  }

  // Format due payments
  const duePayments = dueSemesters.map((semester) => {
    const isPaid = paidSemesterNumbers.includes(semester.semesterOrder);
    const isOverdue = paymentRecord.dueDate ? new Date(paymentRecord.dueDate) < new Date() : false;

    return {
      semesterOrder: semester.semesterOrder,
      semesterName: semester.semesterName,
      semesterFee: semester.semesterFee,
      status: isPaid ? "PAID" : isOverdue ? "OVERDUE" : "PENDING",
      isPayable:
        !isPaid &&
        !dueSemesters.some(
          (s, index) => index < dueSemesters.indexOf(semester) && !paidSemesterNumbers.includes(s.semesterOrder),
        ),
    };
  });

  // Return single payment object if semesterNo is specified, otherwise return array
  if (semesterNo !== undefined) {
    return duePayments[0] || null;
  }
  return duePayments;
};

export const getPaymentStats = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { email: true },
  });

  if (!student?.email) {
    throw new AppError("Student not found or email missing", "NOT_FOUND", 404);
  }

  const [totalPaidResult, totalDueResult, paymentRecordsCount, duePaymentsCount] = await Promise.all([
    prisma.paymentHistory.aggregate({
      where: {
        payment_status: true,
        paymentRecord: {
          application: {
            personalInformation: {
              email: student.email,
            },
          },
        },
      },
      _sum: { amount: true },
    }),

    prisma.paymentRecord.aggregate({
      where: {
        application: {
          personalInformation: {
            email: student.email,
          },
        },
      },
      _sum: { remainingAmount: true },
    }),

    prisma.paymentRecord.count({
      where: {
        application: {
          personalInformation: {
            email: student.email,
          },
        },
      },
    }),

    prisma.paymentRecord.count({
      where: {
        application: {
          personalInformation: {
            email: student.email,
          },
        },
        remainingAmount: { gt: 0 },
      },
    }),
  ]);

  return {
    totalPaid: totalPaidResult._sum.amount || 0,
    totalDue: totalDueResult._sum.remainingAmount || 0,
    paymentRecordsCount,
    duePaymentsCount,
  };
};

export const StudentPaymentServiceWithDue = {
  ...StudentPaymentService,
  getStudentDuePaymentByCourse,
};
