import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
// import dotenv from "dotenv";
// const JWT_SECRET = process.env.JWT_SECRET || "defaultAccessTokenSecret";
// const JWT_REFRESH_SECRET =
//   process.env.JWT_REFRESH_SECRET || "defaultRefreshTokenSecret";
// const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || "1h";
// const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || "7d";
type CourseSnapshot = {
  title?: string;
  startDate?: string;
  endDate?: string;
};

import {
  LoginReqBody,
  ChangePasswordReqBody,
  CreatePasswordReqBody,
  ForgotPasswordReqBody,
  ResetPasswordReqBody,
  VerifyMFAReqBody,
  SetupMFAReqBody,
  UpdateProfileReqBody,
  GetStudentReqQuery,
  AnswerSecurityQuestionReqBody,
  LoginWithOTPReqBody,
} from "./schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";
import { emailVerification, sendOtpEmail } from "../communication/mail/mailer";
import { send } from "process";
import axios from "axios";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MINUTES = 15;
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15; // 4-digit OTP expires in 15 minutes
const OTP_EXPIRY_MINUTES = 5; // Login OTP expires in 5 minutes

export class StudentAuthService {
  // Login
  static async login(loginData: LoginReqBody, ipAddress?: string) {
    const { email, username, password } = loginData;

    // Find student by email or username
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
          ...(username && username.includes("@") ? [{ email: username }] : []),
        ],
      },
      include: {
        securityQuestion: true,
      },
    });

    if (!student) {
      throw new AppError("Invalid credentials", "UNAUTHORIZED", 401);
    }

    // Check account status
    if (student.accountStatus === "SUSPENDED") {
      throw new AppError("Account is suspended", "FORBIDDEN", 403);
    }

    if (student.accountStatus === "INACTIVE") {
      throw new AppError("Account is inactive", "FORBIDDEN", 403);
    }

    // Check if account is locked
    if (student.accountLockedUntil && student.accountLockedUntil > new Date()) {
      const lockTime = Math.ceil(
        (student.accountLockedUntil.getTime() - Date.now()) / 60000,
      );
      setImmediate(() =>
        axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/email/multiple-login-alert`,
          {
            email: student.email || "",
          },
        ),
      );
      throw new AppError(
        `Account is locked. Try again in ${lockTime} minutes`,
        "FORBIDDEN",
        403,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await prisma.student.update({
        where: { id: student.id },
        data: {
          failedLoginAttempts: student.failedLoginAttempts + 1,
          ...(student.failedLoginAttempts + 1 >= MAX_FAILED_ATTEMPTS && {
            accountLockedUntil: new Date(
              Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
            ),
          }),
        },
      });

      throw new AppError("Invalid credentials", "UNAUTHORIZED", 401);
    }

    // Reset failed attempts on successful login
    await prisma.student.update({
      where: { id: student.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Check if password is temporary (first-time login)
    // if (student.isTemporaryPassword) {
    //   return {
    //     requiresPasswordChange: true,
    //     studentId: student.id,
    //     email: student.email,
    //   };
    // }

    // Check if MFA is enabled
    if (student.mfaEnabled) {
      await this.sendLoginOTP({ password, email, username });

      return {
        // mfaEnabled: true,
        message: "Please use login with OTP endpoint",
        student: {
          mfaEnabled: student.mfaEnabled,
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          username: student.username,
        },
      };
    }

    // Generate tokens

    // In StudentAuthService.login() method:
    const accessToken = generateAccessToken({ userId: student.id });
    const refreshToken = generateRefreshToken({ userId: student.id });

    return {
      accessToken,
      refreshToken,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        username: student.username,
        mfaEnabled: student.mfaEnabled,
        isTemporaryPassword: student.isTemporaryPassword,
      },
    };
  }

  // Login with username/password and OTP together (when MFA is enabled)
  static async loginWithOTP(
    loginData: LoginWithOTPReqBody,
    ipAddress?: string,
  ) {
    const { email, username, otp } = loginData;

    // Find student by email or username
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
          ...(username && username.includes("@") ? [{ email: username }] : []),
        ],
      },
      include: {
        securityQuestion: true,
      },
    });

    if (!student) {
      throw new AppError("Invalid credentials", "UNAUTHORIZED", 401);
    }

    // Check account status
    if (student.accountStatus === "SUSPENDED") {
      throw new AppError("Account is suspended", "FORBIDDEN", 403);
    }

    if (student.accountStatus === "INACTIVE") {
      throw new AppError("Account is inactive", "FORBIDDEN", 403);
    }

    // Check if account is locked
    if (student.accountLockedUntil && student.accountLockedUntil > new Date()) {
      const lockTime = Math.ceil(
        (student.accountLockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new AppError(
        `Account is locked. Try again in ${lockTime} minutes`,
        "FORBIDDEN",
        403,
      );
    }

    // Check if MFA is enabled
    // if (!student.mfaEnabled) {
    //   throw new AppError(
    //     "MFA is not enabled for this account",
    //     "BAD_REQUEST",
    //     400
    //   );
    // }

    // Verify OTP
    if (!student.mfaSecret) {
      throw new AppError("OTP not generated or expired", "BAD_REQUEST", 400);
    }

    // Check OTP expiry
    let isValidOTP = false;
    if (student.mfaSecret.includes(":")) {
      // New format with expiry timestamp
      const [storedOtp, expiryTimestamp] = student.mfaSecret.split(":");
      const expiryTime = parseInt(expiryTimestamp);

      if (Date.now() > expiryTime) {
        // Clear expired OTP
        await prisma.student.update({
          where: { id: student.id },
          data: { mfaSecret: null },
        });
        throw new AppError("OTP expired", "BAD_REQUEST", 400);
      }

      isValidOTP = storedOtp === otp;
    } else {
      // Legacy format (no expiry)
      isValidOTP = student.mfaSecret === otp;
    }

    if (!isValidOTP) {
      throw new AppError("Invalid OTP", "UNAUTHORIZED", 401);
    }

    // Reset failed attempts and clear OTP on successful login
    await prisma.student.update({
      where: { id: student.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLogin: new Date(),
        mfaSecret: null, // Clear OTP after use
      },
    });

    // Check if password is temporary (first-time login)
    // if (student.isTemporaryPassword) {
    //   return {
    //     requiresPasswordChange: true,
    //     studentId: student.id,
    //     email: student.email,
    //   };
    // }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: student.id,
      // email: student.email,
    });

    const refreshToken = generateRefreshToken({
      userId: student.id,
      // email: student.email,
    });

    return {
      accessToken,
      refreshToken,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        username: student.username,
        mfaEnabled: student.mfaEnabled,
        isTemporaryPassword: student.isTemporaryPassword,
      },
    };
  }

  // Generate and send OTP for MFA login
  static async sendLoginOTP(loginData: LoginReqBody) {
    const { email, username } = loginData;

    // Find student by email or username
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
          ...(username && username.includes("@") ? [{ email: username }] : []),
        ],
      },
    });

    if (!student) {
      // Don't reveal that user doesn't exist for security
      return { success: true, message: "OTP sent if account exists" };
    }

    // Check if MFA is enabled
    if (!student.mfaEnabled) {
      throw new AppError(
        "MFA is not enabled for this account",
        "BAD_REQUEST",
        400,
      );
    }

    // Check if account is active
    if (student.accountStatus === "SUSPENDED") {
      throw new AppError("Account is suspended", "FORBIDDEN", 403);
    }

    if (student.accountStatus === "INACTIVE") {
      throw new AppError("Account is inactive", "FORBIDDEN", 403);
    }

    // Check if account is locked
    if (student.accountLockedUntil && student.accountLockedUntil > new Date()) {
      throw new AppError("Account is locked", "FORBIDDEN", 403);
    }

    // Generate 4-digit OTP
    const otp = this.generate4DigitOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP with expiry timestamp
    await prisma.student.update({
      where: { id: student.id },
      data: {
        mfaSecret: `${otp}:${otpExpiry.getTime()}`,
      },
    });
    console.log(otp);
    // Send OTP via email
    // await sendOtpEmail(
    //   {
    //     email: student.email!,
    //     firstName: student.firstName || "there",
    //   },
    //   otp,
    // );

    setImmediate(() =>
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/forgot-password`, {
        email: student.email,
        firstName: student.firstName,
        otp: otp,
      }),
    );
    return {
      success: true,
      message: "OTP sent to your email",
      studentId: student.id,
      otpExpiresIn: OTP_EXPIRY_MINUTES, // minutes
    };
  }

  // Verify MFA OTP (for separate verification flow)
  static async verifyMFA(studentId: string, mfaData: VerifyMFAReqBody) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.mfaSecret) {
      throw new AppError("OTP not generated or expired", "BAD_REQUEST", 400);
    }

    // Check OTP expiry
    let isValidOTP = false;
    if (student.mfaSecret.includes(":")) {
      // New format with expiry timestamp
      const [storedOtp, expiryTimestamp] = student.mfaSecret.split(":");
      const expiryTime = parseInt(expiryTimestamp);

      if (Date.now() > expiryTime) {
        // Clear expired OTP
        await prisma.student.update({
          where: { id: studentId },
          data: { mfaSecret: null },
        });
        throw new AppError("OTP expired", "BAD_REQUEST", 400);
      }

      isValidOTP = storedOtp === mfaData.code;
    } else {
      // Legacy format (no expiry)
      isValidOTP = student.mfaSecret === mfaData.code;
    }

    if (!isValidOTP) {
      throw new AppError("Invalid OTP", "UNAUTHORIZED", 401);
    }

    // Clear OTP after verification
    await prisma.student.update({
      where: { id: studentId },
      data: {
        mfaSecret: null, // Clear OTP after use
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: student.id,
      // email: student.email,
    });

    const refreshToken = generateRefreshToken({
      userId: student.id,
      // email: student.email,
    });

    return {
      accessToken,
      refreshToken,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        username: student.username,
        mfaEnabled: student.mfaEnabled,
      },
    };
  }

  // Change password (authenticated)
  static async changePassword(
    studentId: string,
    passwordData: ChangePasswordReqBody,
  ) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        password: true,
        securityQuestionId: true,
        securityQuestion: true,
      },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      student.password,
    );

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", "UNAUTHORIZED", 401);
    }

    // Validate new password strength
    this.validatePassword(passwordData.newPassword);

    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

    // Update student
    await prisma.student.update({
      where: { id: studentId },
      data: {
        password: hashedPassword,
        isTemporaryPassword: false,
        securityQuestionId: passwordData.securityQuestionId,
        securityQuestionAnswer: passwordData.securityQuestionAnswer || "",
      },
    });

    return { success: true };
  }

  // Forgot password - Generate 4-digit OTP
  static async forgotPassword(forgotData: ForgotPasswordReqBody) {
    const student = await prisma.student.findUnique({
      where: { email: forgotData.email },
      include: { securityQuestion: true },
    });

    if (!student) {
      // Don't reveal that email doesn't exist for security
      throw new AppError("student not found", "NOT_FOUND", 404);
    }

    const accessToken = generateAccessToken({
      userId: student.id,
    });
    // Check if account is active
    // if (student.accountStatus === "SUSPENDED") {
    //   throw new AppError("Account is suspended", "FORBIDDEN", 403);
    // }

    // if (student.accountStatus === "INACTIVE") {
    //   throw new AppError("Account is inactive", "FORBIDDEN", 403);
    // }

    // Generate 4-digit OTP
    // const otp = this.generate4DigitOTP();
    // const expiresAt = new Date(
    //   Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    // );

    // // Delete any existing tokens
    // await prisma.studentPasswordResetToken.deleteMany({
    //   where: { studentId: student.id, used: false },
    // });

    // // Create new OTP token
    // await prisma.studentPasswordResetToken.create({
    //   data: {
    //     otp,
    //     studentId: student.id,
    //     expiresAt,
    //   },
    // });

    // Send email with OTP
    await emailVerification(
      {
        email: student.email!,
        firstName: student.firstName || "there",
      },
      accessToken,
    );

    return {
      success: true,
      message: "Email sent to your email",
    };
  }

  // Reset password with 4-digit OTP
  static async resetPassword(resetData: ResetPasswordReqBody) {
    // Find by OTP
    const resetToken = await prisma.studentPasswordResetToken.findFirst({
      where: { otp: resetData.token },
      include: { student: true },
    });

    if (!resetToken) {
      throw new AppError("Invalid OTP", "UNAUTHORIZED", 401);
    }

    if (resetToken.used) {
      throw new AppError("OTP already used", "BAD_REQUEST", 400);
    }

    if (resetToken.expiresAt < new Date()) {
      throw new AppError("OTP expired", "BAD_REQUEST", 400);
    }

    // Validate new password strength
    this.validatePassword(resetData.newPassword);

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetData.newPassword, 10);

    // Update student password
    await prisma.student.update({
      where: { id: resetToken.studentId },
      data: {
        password: hashedPassword,
        isTemporaryPassword: false,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // Mark OTP as used
    await prisma.studentPasswordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return { success: true };
  }

  // Setup MFA - Enable/Disable email OTP for login
  static async setupMFA(studentId: string, mfaData: SetupMFAReqBody) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    // Update MFA setting
    await prisma.student.update({
      where: { id: studentId },
      data: {
        mfaEnabled: mfaData.enable,
        mfaSecret: null, // Clear any existing OTP
      },
    });

    return {
      success: true,
      message: `Login OTP ${mfaData.enable ? "enabled" : "disabled"} successfully`,
    };
  }

  // Verify MFA setup (not needed for simple OTP, but keeping for compatibility)
  static async verifyMFASetup(studentId: string, code: string) {
    return { verified: true };
  }

  // Get student profile
  static async getStudentProfile(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        securityQuestion: true,
        // Include other relations as needed
      },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    // Remove sensitive data
    const { password, mfaSecret, ...studentData } = student;

    return studentData;
  }

  // Update student profile
  static async updateProfile(
    studentId: string,
    profileData: UpdateProfileReqBody,
  ) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    if (
      profileData.alternateEmail !== undefined &&
      profileData.alternateEmail !== student.alternateEmail
    ) {
      const emailInUse = await prisma.student.findFirst({
        where: {
          alternateEmail: profileData.alternateEmail,
          id: { not: studentId },
        },
      });

      if (emailInUse) {
        throw new AppError(
          "Alternate email is already in use by another student",
          "BAD_REQUEST",
          400,
        );
      }
    }

    const updateData: Prisma.StudentUpdateInput = {
      ...profileData,
    };

    if (profileData.alternateEmail === "") {
      updateData.alternateEmail = null;
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: {
        securityQuestion: true,
      },
    });

    const { password, mfaSecret, ...studentData } = updatedStudent;
    return studentData;
  }

  // Refresh token
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken) as {
        studentId: string;
        email: string;
      };

      const student = await prisma.student.findUnique({
        where: { id: decoded.studentId },
      });

      if (!student) {
        throw new AppError("Student not found", "UNAUTHORIZED", 401);
      }

      // Check if account is suspended or inactive
      if (
        student.accountStatus === "SUSPENDED" ||
        student.accountStatus === "INACTIVE"
      ) {
        throw new AppError("Account is not active", "UNAUTHORIZED", 401);
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: student.id,
      });

      const newRefreshToken = generateRefreshToken({
        userId: student.id,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError("Invalid refresh token", "UNAUTHORIZED", 401);
    }
  }

  // Answer security question (for additional verification if needed)
  static async answerSecurityQuestion(
    studentId: string,
    answerData: AnswerSecurityQuestionReqBody,
  ) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { securityQuestion: true },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    if (!student.securityQuestionId) {
      throw new AppError("Security question not set", "BAD_REQUEST", 400);
    }

    // Note: You need to add a securityAnswerHash field to your Student model
    // For now, we'll return success if answer is provided
    if (!answerData.answer) {
      throw new AppError("Answer is required", "BAD_REQUEST", 400);
    }

    return { verified: true };
  }

  // Get all students with pagination and filtering
  static async getAllStudents(query: GetStudentReqQuery) {
    const { page = 1, search, status } = query;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { studentNo: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.accountStatus = status;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          studentNo: true,
          mobile: true,
          address: true,
          photo: true,
          nationality: true,
          accountStatus: true,
          mfaEnabled: true,
          lastLogin: true,
          createdAt: true,
          securityQuestion: {
            select: {
              id: true,
              question: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Generate 4-digit OTP
  private static generate4DigitOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Validate password strength
  private static validatePassword(password: string): void {
    if (password.length < 6) {
      throw new AppError(
        "Password must be at least 6 characters long",
        "BAD_REQUEST",
        400,
      );
    }

    // // Check for at least one uppercase letter
    // if (!/[A-Z]/.test(password)) {
    //   throw new AppError(
    //     "Password must contain at least one uppercase letter",
    //     "BAD_REQUEST",
    //     400
    //   );
    // }

    // // Check for at least one lowercase letter
    // if (!/[a-z]/.test(password)) {
    //   throw new AppError(
    //     "Password must contain at least one lowercase letter",
    //     "BAD_REQUEST",
    //     400
    //   );
    // }

    // // Check for at least one number
    // if (!/\d/.test(password)) {
    //   throw new AppError(
    //     "Password must contain at least one number",
    //     "BAD_REQUEST",
    //     400
    //   );
    // }

    // // Check for at least one special character
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //   throw new AppError(
    //     "Password must contain at least one special character",
    //     "BAD_REQUEST",
    //     400
    //   );
    // }
  }

  // Helper method to generate backup codes (optional)
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character backup codes
      codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
    }
    return codes;
  }

  // Resend login OTP
  static async resendLoginOTP(loginData: LoginReqBody) {
    const { email, username } = loginData;

    // Find student by email or username
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
          ...(username && username.includes("@") ? [{ email: username }] : []),
        ],
      },
    });

    if (!student) {
      // Don't reveal that user doesn't exist for security
      return { success: true, message: "OTP sent if account exists" };
    }

    // Check if MFA is enabled
    if (!student.mfaEnabled) {
      throw new AppError(
        "MFA is not enabled for this account",
        "BAD_REQUEST",
        400,
      );
    }

    // Check if account is active
    if (student.accountStatus === "SUSPENDED") {
      throw new AppError("Account is suspended", "FORBIDDEN", 403);
    }

    // Check rate limiting: Don't resend if OTP was sent recently
    if (student.mfaSecret && student.mfaSecret.includes(":")) {
      const [_, expiryTimestamp] = student.mfaSecret.split(":");
      const expiryTime = parseInt(expiryTimestamp);
      const timeLeft = expiryTime - Date.now();

      // If OTP was sent less than 1 minute ago, prevent resend
      if (timeLeft > (OTP_EXPIRY_MINUTES - 1) * 60 * 1000) {
        throw new AppError(
          "Please wait before requesting new OTP",
          "TOO_MANY_REQUESTS",
          429,
        );
      }
    }

    // Generate new 4-digit OTP
    const otp = this.generate4DigitOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP with expiry timestamp
    await prisma.student.update({
      where: { id: student.id },
      data: {
        mfaSecret: `${otp}:${otpExpiry.getTime()}`,
      },
    });

    // Send OTP via email
    await sendOtpEmail(
      {
        email: student.email!,
        firstName: student.firstName || "there",
      },
      otp,
    );

    return {
      success: true,
      message: "OTP resent successfully",
      studentId: student.id,
      otpExpiresIn: OTP_EXPIRY_MINUTES,
    };
  }

  // Resend password reset OTP
  static async resendPasswordResetOTP(email: string) {
    const student = await prisma.student.findUnique({
      where: { email },
      include: { securityQuestion: true },
    });

    if (!student) {
      // Don't reveal that email doesn't exist for security
      return { success: true };
    }

    // Check if account is active
    if (student.accountStatus === "SUSPENDED") {
      throw new AppError("Account is suspended", "FORBIDDEN", 403);
    }

    if (student.accountStatus === "INACTIVE") {
      throw new AppError("Account is inactive", "FORBIDDEN", 403);
    }

    // Check if account is locked
    if (student.accountLockedUntil && student.accountLockedUntil > new Date()) {
      throw new AppError("Account is locked", "FORBIDDEN", 403);
    }

    // Check for existing unused OTP
    const existingToken = await prisma.studentPasswordResetToken.findFirst({
      where: { studentId: student.id, used: false },
    });

    // If OTP was sent recently, prevent resend
    if (existingToken) {
      const timeSinceCreation = Date.now() - existingToken.createdAt.getTime();
      const oneMinute = 60 * 1000;

      if (timeSinceCreation < oneMinute) {
        throw new AppError(
          "Please wait before requesting new OTP",
          "TOO_MANY_REQUESTS",
          429,
        );
      }

      // Mark old OTP as used
      await prisma.studentPasswordResetToken.update({
        where: { id: existingToken.id },
        data: { used: true },
      });
    }

    // Generate new 4-digit OTP
    const otp = this.generate4DigitOTP();
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    // Create new OTP token
    await prisma.studentPasswordResetToken.create({
      data: {
        otp,
        studentId: student.id,
        expiresAt,
      },
    });

    // Send email with OTP
    await sendOtpEmail(
      {
        email: student.email!,
        firstName: student.firstName || "there",
      },
      otp,
    );

    return {
      success: true,
      message: "OTP resent successfully",
    };
  }

  static async resetPasswordWithToken(data: ResetPasswordReqBody) {
    const token = data.token;

    // decode (for display/debug only)
    const decoded = jwt.decode(token) as {
      userId: string;
      iat: number;
      exp: number;
    } | null;
    // console.log(decoded);
    // if (!decoded)
    // {
    //   throw new AppError("")
    // }
    const studentId = decoded?.userId;

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        password: hashedPassword,
        isTemporaryPassword: false,
        updatedAt: new Date(),
      },
    });
    return updatedStudent;
  }

  static async getProfile(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        studentCourses: {
          include: {
            sessionCourse: {
              select: {
                courseSnapshot: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    const studentData = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      alternateEmail: student.alternateEmail || "",
      bio: student.bio || "",
      username: student.username || "",
      studentNo: student.studentNo || "",
      mobile: student.mobile || "",
      address: student.address || "",
      photo: student.photo || "",
      nationality: student.nationality || "",
      accountStatus: student.accountStatus || "INACTIVE",
      accountLockedUntil: student.accountLockedUntil || null,
      joinDate: student.createdAt,
      mfaEnabled: student.mfaEnabled,
      isTemporaryPassword: student.isTemporaryPassword,

      // academicInfo: student.studentCourses?.map(
      //   (sc) => sc.sessionCourse?.courseSnapshot
      // ),

      academicInfo: student.studentCourses
        .map((sc) => sc.sessionCourse?.courseSnapshot)
        .filter(
          (snapshot): snapshot is CourseSnapshot =>
            typeof snapshot === "object" &&
            snapshot !== null &&
            "title" in snapshot,
        )
        .map((snapshot) => snapshot.title ?? null),
    };

    return studentData;
  }

  static async getAcademicInformation(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        studentCourses: {
          include: {
            sessionCourse: {
              select: {
                courseSnapshot: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new AppError("Student not found", "NOT_FOUND", 404);
    }

    const academicData = {
      studentId: student.id,
      academicInfo: student.studentCourses
        .map((sc) => sc.sessionCourse?.courseSnapshot)
        .filter(
          (snapshot): snapshot is CourseSnapshot =>
            typeof snapshot === "object" &&
            snapshot !== null &&
            "title" in snapshot,
        )
        .map((snapshot) => ({
          title: snapshot.title ?? "",
          startDate: snapshot.startDate ?? "",
          endDate: snapshot.endDate ?? "",
        })),
    };

    return academicData;
  }
}
