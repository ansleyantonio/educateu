import { Request, Response } from "express";
import * as authService from "./service";
import prisma from "../../../prismaClient";
import { RequestWithUser } from "../../../types";
import bcrypt from "bcryptjs";
import createAuditLog from "../../../auditlog";
import { zodSafeParse } from "../../../utils/zodUtils";
import {
  mfaSchema,
  sendMultipleEmailsSchema,
  verifyOTPEmail,
  portalType,
} from "./schema";
import { sendSuccessResponse } from "../../../utils/responseUtils";
import { AppError } from "../../../utils/AppError";
import { decryptUrlSafe } from "./encryption";
import axios from "axios";
import app from "../../../app";

export const requestPasswordReset = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = zodSafeParse(req.body, verifyOTPEmail);
  const userPortal = zodSafeParse(req.query.userportal, portalType);

  const message = await authService.requestPasswordReset(email, userPortal);

  sendSuccessResponse(res, {
    status: "success",
    message,
    statusCode: 200,
  });
};

export const matchOtp = async (req: Request, res: Response): Promise<void> => {
  const { otp } = req.body;

  try {
    const message = await authService.matchOtp(otp);

    res
      .status(200)
      .json({ status: "success", message: message, statusCode: 200 });
  } catch (error: any) {
    res
      .status(400)
      .json({ status: "error", message: error.message, statusCode: 400 });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, otp, newPassword } = req.body;
  const userPortal = zodSafeParse(req.query.userportal, portalType);

  const message = await authService.resetPassword(
    email,
    otp,
    newPassword,
    userPortal,
  );
  sendSuccessResponse(res, {
    status: "success",
    message,
    statusCode: 200,
  });
};

export const changePasswordController = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify the old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        status: "error",
        message: "Invalid old password",
        statusCode: 400,
      });
      return;
    }

    const message = await authService.changePassword(
      userId,
      oldPassword,
      newPassword,
    );
    createAuditLog({
      action: "changed his own password",
      userId: userId,
    });
    res.status(200).json({
      message,
      status: "success",
      statusCode: 200,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changeNewPasswordController = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const message = await authService.changeNewPassword(
      userId,
      oldPassword,
      newPassword,
    );

    res.status(200).json({
      message,
      status: "success",
      statusCode: 200,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.query;

  const emailPart = typeof token === "string" ? token.slice(64) : "";

  try {
    if (!token) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    await prisma.user.update({
      where: { email: emailPart },
      data: { emailVerified: true },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// export const mafaStatusController = async (
//   req: RequestWithUser,
//   res: Response
// ): Promise<void> => {
//   const userId = req.params.userId;
//   const parsed = zodSafeParse(req.body, mfaSchema);
//   const data = authService.mfaStatusSettings(userId, parsed.mfa);

//   sendSuccessResponse(res, {
//     message: "MFA status updated successfully",
//     // data,
//     statusCode: 200,
//     status: "success",
//   });
// };
export const mafaStatusController = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  const userId = req.params.userId;
  const parsed = zodSafeParse(req.body, mfaSchema);

  // Await the actual message returned from the service
  const message = await authService.mfaStatusSettings(
    userId,
    parsed.mfaEnabled,
  );
  setImmediate(() =>
    axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
      userId: userId,
      type: "profile",
    }),
  );
  sendSuccessResponse(
    res,
    {
      status: "success",
      statusCode: 200,
      message,
    },
    message,
  ); // Use the returned message here
};

export const sendMultipleEmailsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = zodSafeParse(req.body, sendMultipleEmailsSchema);

  const message = await authService.sendMultipleEmails(parsed);

  sendSuccessResponse(res, {
    status: "success",
    statusCode: 200,
    message,
  });
};

export const verifyApplicationEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, applicationId } = req.query;

  if (!token || typeof token !== "string") {
    throw new AppError("Invalid verification token", "BAD_REQUEST", 400);
  }

  // Decrypt the email from the token
  const email = decryptUrlSafe(token);

  // First check if the record exists
  const existingRecord = await prisma.personalInformation.findFirst({
    where: { email, applicationId: String(applicationId) },
  });

  if (!existingRecord) {
    setImmediate(() =>
      axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/application-notification/verify-confirmed`,
        {
          applicationId: String(applicationId),
        },
      ),
    );
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Not Found</title>
          <style>body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }</style>
        </head>
        <body>
          <h1 class="error">❌ Email Not Found</h1>
          <p>The email associated with this verification link was not found in our system.</p>
          <p><a href="${process.env.FRONTEND_URL}">Return to Homepage</a></p>
        </body>
        </html>
      `);
    return;
  }

  // Check if already verified
  if (existingRecord.verifiedEmail) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Already Verified</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .info {
            color: #ffc107;
            font-size: 2em;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="info">ℹ️</div>
          <h1>Email Already Verified</h1>
          <p>This email address has already been verified for this application.</p>
          <p style="color: #666; margin-top: 30px;">
            <small>No further action is required.</small>
          </p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Update the record if not already verified
  await prisma.personalInformation.updateMany({
    where: { email, applicationId: String(applicationId) },
    data: { verifiedEmail: true },
  });
  setImmediate(() =>
    axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/application-notification/verify-confirmed`,
      {
        applicationId: String(applicationId),
      },
    ),
  );

  // Return HTML success page
  res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified Successfully</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success {
            color: #28a745;
            font-size: 2em;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Email Verified Successfully!</h1>
          <p>Your email address has been successfully verified.</p>


          <p style="color: #666; margin-top: 30px;">
            <small>If you're not redirected automatically, click the button above.</small>
          </p>
        </div>

      </body>
      </html>
    `);

  // if (updated.count === 0) {
  //   throw new AppError("Email not found", "NOT_FOUND", 404);
  // }

  // sendSuccessResponse(res, {
  //   status: "success",
  //   statusCode: 200,
  //   message: "Email verified successfully",
  // });
};
