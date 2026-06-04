import { Response } from "express";
import { studentRequest } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  loginSchema,
  changePasswordSchema,
  createPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyMFASchema,
  setupMFASchema,
  updateProfileSchema,
  getStudentReqQuerySchema,
  studentIdParamSchema,
  answerSecurityQuestionSchema,
  loginWithOTPSchema,
  createSecurityQuestions, // Add this import
} from "./schema";
import { StudentAuthService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import prisma from "../../prismaClient";
import z from "zod";

export class StudentAuthController {
  // Login
  static async login(req: studentRequest, res: Response) {
    const reqBody = zodSafeParse(req.body, loginSchema);

    const result = await StudentAuthService.login(reqBody, req.ip);

    sendSuccessResponse(res, result, "Login successful");
  }

  // Login with OTP (for MFA enabled accounts)
  static async loginWithOTP(req: studentRequest, res: Response) {
    const reqBody = zodSafeParse(req.body, loginWithOTPSchema);

    const result = await StudentAuthService.loginWithOTP(reqBody, req.ip);

    sendSuccessResponse(res, result, "Login successful");
  }

  // Send OTP for MFA login
  static async sendLoginOTP(req: studentRequest, res: Response) {
    const reqBody = zodSafeParse(req.body, loginSchema);

    const result = await StudentAuthService.sendLoginOTP(reqBody);

    sendSuccessResponse(res, result, "OTP sent successfully");
  }

  // Verify MFA
  static async verifyMFA(req: studentRequest, res: Response) {
    const studentId = zodSafeParse(req.params, studentIdParamSchema).studentId;

    const reqBody = zodSafeParse(req.body, verifyMFASchema);

    const result = await StudentAuthService.verifyMFA(studentId, reqBody);

    sendSuccessResponse(res, result, "MFA verified successfully");
  }

  // Change password (authenticated)
  static async changePassword(req: studentRequest, res: Response) {
    const studentId = req.user?.userId;
    console.log("Change password requested by studentId:", studentId);

    if (!studentId) {
      return sendSuccessResponse(res, undefined, "Unauthorized", 401);
    }

    const reqBody = zodSafeParse(req.body, changePasswordSchema);
    const result = await StudentAuthService.changePassword(studentId, reqBody);

    sendSuccessResponse(res, result, "Password changed successfully");
  }

  // Forgot password
  static async forgotPassword(req: studentRequest, res: Response) {
    const reqBody = zodSafeParse(req.body, forgotPasswordSchema);

    const result = await StudentAuthService.forgotPassword(reqBody);

    sendSuccessResponse(res, result, "Password reset email sent successfully");
  }

  // Reset password with token
  static async resetPassword(req: studentRequest, res: Response) {
    const reqBody = zodSafeParse(req.body, resetPasswordSchema);

    const result = await StudentAuthService.resetPassword(reqBody);

    sendSuccessResponse(res, result, "Password reset successfully");
  }

  // Setup MFA
  static async setupMFA(req: studentRequest, res: Response) {
    const studentId = req.user?.userId;

    if (!studentId) {
      return sendSuccessResponse(res, undefined, "Unauthorized", 401);
    }

    const reqBody = zodSafeParse(req.body, setupMFASchema);

    const result = await StudentAuthService.setupMFA(studentId, reqBody);

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: `Student ${reqBody.enable ? "enabled" : "disabled"} MFA`,
          userId: req.user?.userId,
        },
      });
    }

    sendSuccessResponse(
      res,
      result,
      `MFA ${reqBody.enable ? "enabled" : "disabled"} successfully`
    );
  }

  // Verify MFA setup
  static async verifyMFASetup(req: studentRequest, res: Response) {
    const studentId = req.user?.userId;
    const { code } = zodSafeParse(req.body, z.object({ code: z.string() }));

    if (!studentId) {
      return sendSuccessResponse(res, undefined, "Unauthorized", 401);
    }

    const result = await StudentAuthService.verifyMFASetup(studentId, code);

    sendSuccessResponse(res, result, "MFA setup verified successfully");
  }

  // Update student profile
  static async updateProfile(req: studentRequest, res: Response) {
    const studentId = req.user?.userId;

    if (!studentId) {
      return sendSuccessResponse(res, undefined, "Unauthorized", 401);
    }

    const reqBody = zodSafeParse(req.body, updateProfileSchema);

    const updatedProfile = await StudentAuthService.updateProfile(
      studentId,
      reqBody
    );

    // if (req.user) {
    //   await prisma.auditLog.create({
    //     data: {
    //       action: "Student updated profile",
    //       userId: req.user?.userId,
    //     },
    //   });
    // }

    sendSuccessResponse(
      res,
      { profile: updatedProfile },
      "Profile updated successfully"
    );
  }

  // Refresh token
  static async refreshToken(req: studentRequest, res: Response) {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return sendSuccessResponse(res, undefined, "Refresh token required", 400);
    }

    const result = await StudentAuthService.refreshToken(refreshToken);

    sendSuccessResponse(res, result, "Token refreshed successfully");
  }

  static async verifyEmail(req: studentRequest, res: Response) {
    const data = zodSafeParse(req.body, resetPasswordSchema);

    const result = await StudentAuthService.resetPasswordWithToken(data);

    sendSuccessResponse(res, result, "Email verified successfully");
  }

  static async getSecurityQuestions(req: studentRequest, res: Response) {
    const questions = await prisma.securityQuestion.findMany({
      select: {
        id: true,
        question: true,
      },
    });
    sendSuccessResponse(
      res,
      { questions },
      "Security questions fetched successfully"
    );
  }

  static async createSecurityQuestions(req: studentRequest, res: Response) {
    const createSecurityQuestionsData = zodSafeParse(
      req.body,
      createSecurityQuestions
    );
    const newQuestion = await prisma.securityQuestion.create({
      data: {
        question: createSecurityQuestionsData.name,
      },
    });
    sendSuccessResponse(
      res,
      { question: newQuestion },
      "Security question created successfully"
    );
  }
  static async updateSecurityQuestions(req: studentRequest, res: Response) {
    const questionId = req.params.id;
    const updateData = zodSafeParse(req.body, createSecurityQuestions);
    const updatedQuestion = await prisma.securityQuestion.update({
      where: { id: questionId },
      data: {
        question: updateData.name,
      },
    });
    sendSuccessResponse(
      res,
      { question: updatedQuestion },
      "Security question updated successfully"
    );
  }

  static async getProfile(req: studentRequest, res: Response) {
    const studentId = req.user?.userId;

    if (!studentId) {
      return sendSuccessResponse(res, undefined, "Unauthorized", 401);
    }

    const profile = await StudentAuthService.getProfile(studentId);

    sendSuccessResponse(res, { profile }, "Profile fetched successfully");
  }

  static async getAcademicInformation(req: studentRequest, res: Response) {
    const studentId = req.user?.userId;

    if (!studentId) {
      return sendSuccessResponse(res, undefined, "Unauthorized", 401);
    }

    const academicInformation =
      await StudentAuthService.getAcademicInformation(studentId);

    sendSuccessResponse(
      res,
      { academicInformation },
      "Academic Information fetched successfully"
    );
  }
}
