import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (
  user: { email: string; firstName?: string },
  otp: string,
  template: "forgot" | "register"
) => {
  const templatesDir = path.join(__dirname, "../templates");

  // Create the templates directory if it does not exist
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
    console.log(`Created templates directory at ${templatesDir}`);
  }
  const templatePath = path.join(__dirname, `./templates/${template}.html`);
  let html = fs.readFileSync(templatePath, "utf-8");

  // Replace placeholders
  html = html
    .replace(/\${firstName}/g, user.firstName || "User")
    .replace(/\${otp}/g, otp)
    .replace(/\${year}/g, new Date().getFullYear().toString());

  const mailOptions = {
    from: process.env.EMAIL_USER || "no-reply@example.com",
    to: user.email,
    subject:
      template === "forgot"
        ? "Password Reset OTP"
        : "Complete Your Registration",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};
