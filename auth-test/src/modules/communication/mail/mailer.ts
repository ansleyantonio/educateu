import nodemailer from "nodemailer";
import crypto from "crypto";
import e from "express";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: parseInt(process.env.EMAIL_PORT || "587"), // 587
  secure: false, // Use TLS, not SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (
  user: { email: string; firstName?: string },
  otp: string,
  firstName = "there"
) => {
  const year = new Date().getFullYear();

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto">
          <p>Hi ${user.firstName},</p>
          <p> Use the OTP below:</p>
          <h3 style="color: #2f54eb">${otp}</h3>
          <p>This OTP is valid for 15 minutes.</p>
          <p>If you didn’t request this, you can ignore the email.</p>
          <p style="font-size: 12px; color: #888">&copy; ${year} Arbree</p>
          <p style="margin-top: 2rem">Best regards,<br />The Arbree Team</p>
        </div>
      </body>
    </html>`;

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@example.com",
    to: user.email,
    subject: "OTP",
    text: `Hi ${firstName}, your OTP is: ${otp}`, // Fallback for clients that don't support HTML
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

export const sendRegistrationEmail = async (
  user: {
    email?: string;
    username?: string;
    firstName?: string;
    password?: string;
  },
  loginUrl?: string
) => {
  const year = new Date().getFullYear();
  const { email, username, firstName, password } = user;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>
          An account has been created for you by the administrator on
          <strong>educate-u</strong>.
        </p>
        <h3>Account Details</h3>
        <ul style="list-style-type: none; padding-left: 0">
        <li><strong>Email:</strong> ${email}</li>
          <li><strong>Username:</strong> ${username}</li>
          ${password ? `<li><strong>Temporary Password:</strong> ${password}</li>` : ""}
          <li>
            <strong>Login URL:</strong>
            <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">${loginUrl}</a>
          </li>
        </ul>
        <p>
          We recommend logging in as soon as possible to update your password and
          complete your profile.
        </p>
        <p>
          If you have any questions or encounter any issues while logging in, feel
          free to email
          <a href="mailto:admin@arbreesolutions.com">admin@arbreesolutions.com</a>.
        </p>
        <p>Welcome, and we're glad to have you on board!</p>
        <p style="margin-top: 2rem">Best regards,<br />The Arbree Team</p>
        <p style="font-size: 12px; color: #888">&copy; ${year} Arbree</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@example.com",
    to: email,
    subject: "Your Account Has Been Created",
    text: `Hi ${firstName}, an account has been created for you on ${loginUrl}. 
Username: ${email}
${password ? `Temporary Password: ${password}` : ""}
Login URL: ${loginUrl}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log("Registration email sent successfully");
  } catch (error) {
    console.error("Error sending registration email:", error);
  }
};

export const sendUpdatePasswordEmail = async (
  user: {
    email?: string;
    username?: string;
    firstName?: string;
    password?: string;
  },
  loginUrl?: string
) => {
  const year = new Date().getFullYear();
  const { email, username, firstName, password } = user;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>
          An account password has been updated for you by the administrator on
          <strong>educate-u</strong>.
        </p>
        <h3>Account Details</h3>
        <ul style="list-style-type: none; padding-left: 0">
        <li><strong>Email:</strong> ${email}</li>
          <li><strong>Username:</strong> ${username}</li>
          ${password ? `<li><strong>Temporary Password:</strong> ${password}</li>` : ""}
          <li>
            <strong>Login URL:</strong>
            <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">${loginUrl}</a>
          </li>
        </ul>
        <p>
          We recommend logging in as soon as possible to update your password and
          complete your profile.
        </p>
        <p>
          If you have any questions or encounter any issues while logging in, feel
          free to email
          <a href="mailto:admin@arbreesolutions.com">admin@arbreesolutions.com</a>.
        </p>
        <p>Welcome, and we're glad to have you on board!</p>
        <p style="margin-top: 2rem">Best regards,<br />The Arbree Team</p>
        <p style="font-size: 12px; color: #888">&copy; ${year} Arbree</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@example.com",
    to: email,
    subject: "Your Account Password Has Been Updated",
    text: `Hi ${firstName}, an account has been created for you on ${loginUrl}. 
Username: ${email}
${password ? `Temporary Password: ${password}` : ""}
Login URL: ${loginUrl}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log("Registration email sent successfully");
  } catch (error) {
    console.error("Error sending registration email:", error);
  }
};

export const sendVerificationEmail = async (email: string) => {
  const token = crypto.randomBytes(32).toString("hex") + email;

  const mailOptions = {
    from: "no-reply@example.com",
    to: email,
    subject: "Verify Your Email",
    text: `Click the following link to verify your email: http://localhost:5000/mail/verify-email?token=${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email: ", error);
  }
};

export const emailVerification = async (
  user: { email: string; firstName?: string },
  accessToken: string,
  firstName = "there"
) => {
  // Encrypt the email for the verification URL
  const verificationUrl = `${process.env.STUDENT_LOGIN_URL}/password-recovery/${accessToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Email Verification",
    html: `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
        <h2>📋 Email Verification</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        ">Verify Email</a>
        
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <code style="background-color: #f4f4f4; padding: 5px; border-radius: 3px;">
            ${verificationUrl}
          </code>
        </p>
      </body>
    </html>
    `,
  };
  return transporter.sendMail(mailOptions);
};
