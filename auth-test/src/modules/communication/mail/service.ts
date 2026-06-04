import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendOtpEmail, transporter } from "./mailer";
import prisma from "../../../prismaClient";
import createAuditLog from "../../../auditlog";
import userDetails from "../../../../userInfo";
import { AppError } from "../../../utils/AppError";
import { sendMultipleEmailsSchemaType } from "./schema";
import axios from "axios";

export const generateOtp = (): number => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

export const requestPasswordReset = async (
  email: string,
  userPortal?: string,
) => {
  let user;

  if (userPortal === "faculty") {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ facultyEmail: email }],
      },
    });
  } else if (userPortal === "agent") {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ agentEmail: email }],
      },
    });
  } else {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }],
      },
    });
  }

  if (!user) {
    throw new AppError(
      "No account found with this email address.",
      "NOT_FOUND",
      404,
    );
  }

  const otp = generateOtp().toString();
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 15);

  const resetRequest = await prisma.passwordReset.findFirst({
    where: { userId: user.id },
  });

  if (resetRequest) {
    await prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { otp, expiredAt: expirationTime },
    });
  } else {
    // If no OTP request exists, create a new one
    await prisma.passwordReset.create({
      data: { userId: user.id, otp, expiredAt: expirationTime },
    });
  }

  // await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/forgot-password`, {
  //   email: user.email || user.facultyEmail || user.agentEmail || "",
  //   firstName: user.firstName,
  //   otp: otp,
  // });

  setImmediate(() =>
    axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/forgot-password`, {
      email: user.email || user.facultyEmail || user.agentEmail || "",
      firstName: user.firstName,
      otp: otp,
    }),
  );

  return "OTP sent to email";
};

export const matchOtp = async (otp: string) => {
  const parsedOtp = otp.toString();

  const resetRequest = await prisma.passwordReset.findFirst({
    where: {
      otp: parsedOtp, // Ensure that otp is a string
    },
  });

  if (!resetRequest) {
    throw new Error("Invalid OTP");
  }

  if (new Date() > resetRequest.expiredAt) {
    throw new Error("OTP expired");
  }

  await prisma.user.update({
    where: {
      id: resetRequest.userId,
    },
    data: {
      lastMFALogin: new Date(),
    },
  });

  return "OTP is valid";
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
  userPortal?: string,
) => {
  let user;

  if (userPortal === "faculty") {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ facultyEmail: email }],
      },
    });
  } else if (userPortal === "agent") {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ agentEmail: email }],
      },
    });
  } else {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }],
      },
    });
  }

  if (!user) {
    throw new Error("User not found");
  }
  const resetRequest = await prisma.passwordReset.findFirst({
    where: { userId: user.id, otp },
  });

  if (!resetRequest) {
    throw new Error("Invalid OTP");
  }

  if (new Date() > resetRequest.expiredAt) {
    throw new Error("OTP expired");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 8 characters long");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, passwordChanged: true },
  });
  await prisma.passwordReset.delete({
    where: { id: resetRequest.id },
  });
  await createAuditLog({
    userId: user.id ?? "",
    action: `Password updated for user ${(await userDetails(user.id)).username}`,
    actionType: "password_reset",
  });

  return "Password reset successful";
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify the old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, passwordChanged: true },
  });

  return "Password changed successfully";
};
export const changeNewPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify the old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password in the database
  await prisma.user.update({
    where: { email: user.email || user.facultyEmail || user.agentEmail || "" },
    data: {
      password: hashedPassword,
      passwordChanged: true,
    },
  });

  return "Password changed successfully";
};

export const mfaStatusSettings = async (
  userId: string,
  mfaEnabled: boolean,
): Promise<string> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: mfaEnabled },
  });
  // await createAuditLog({
  //   action: `  ${mfaEnabled ? "enabled" : "disabled"} MFA for user ${(await userDetails(userId)).username}`,
  //   userId: userId,
  //   actionType: "mfa_status",
  // });
  return user.mfaEnabled
    ? "Multi-Factor Authentication has been enabled successfully."
    : "Multi-Factor Authentication has been disabled successfully.";
};

export const sendMultipleEmails = async (
  data: sendMultipleEmailsSchemaType,
): Promise<string> => {
  if (!data.email || data.email.length === 0) {
    throw new AppError(
      "At least one recipient email  field is required.",
      "BAD_REQUEST",
      400,
    );
  }

  setImmediate(() => {
    axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/bulk-email`, data);
  });

  return "Emails sent successfully";
};
