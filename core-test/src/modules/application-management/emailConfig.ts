import nodemailer from "nodemailer";
// types/application.ts (you can split into its own file for clarity)
import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import { supportingDocumentSchema } from "../../prisma/zodSchema/application";
import fs from "fs";
import path from "path";
import { encryptUrlSafe } from "../student-management/mail/encryption";

// Create a type that includes relations you need
export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    personalInformation: true;
    personalStatement: true;
    academicBackground: true;
    courseSelection: true;
    disabilityAndAccessibility: true;
    nextOfKin: true;
    fund: true;
    reference: true;
    criminalBackground: true;
    supportingDocument: {
      include: {
        supportingDocumentAttachments: {
          include: { attachment: true };
        };
      };
    };
  };
}>;

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

export const sendEmail = async (app: ApplicationWithRelations) => {
  const personalInfo = app.personalInformation;
  const academic = app.academicBackground;
  const course = app.courseSelection;
  const statement = app.personalStatement;
  const disability = app.disabilityAndAccessibility;
  const kin = app.nextOfKin;
  const fund = app.fund;
  const ref = app.reference;
  const criminal = app.criminalBackground;

  //   const docHtml =
  //     app.supportingDocument?.supportingDocumentAttachments
  //       ?.map((doc) => {
  //         let html = `<p><strong>${doc.name}</strong> (status: ${doc.status})</p>`;
  //         if (Array.isArray(doc.attachment.paths)) {
  //           for (const rawPath of doc.attachment.paths) {
  //             if (typeof rawPath === "string") {
  //               try {
  //                 const file = JSON.parse(rawPath) as {
  //                   path: string;
  //                   mimetype: string;
  //                   size: number;
  //                   originalname: string;
  //                 };

  //                 // Construct public URL to your file server (adjust if needed)
  //                 const fileUrl = `${process.env.BASE_URL || ""}${file.path}`;

  //                 if (file.mimetype.startsWith("image/")) {
  //                   html += `<div><img src="${fileUrl}" alt="${file.originalname}" style="max-width:400px;border:1px solid #ccc;margin:8px 0;" /></div>`;
  //                 } else {
  //                   html += `<p><a href="${fileUrl}" target="_blank">${file.originalname}</a></p>`;
  //                 }
  //               } catch (err) {
  //                 console.error("❌ Failed to parse attachment path:", rawPath);
  //               }
  //             } else {
  //               console.warn("❌ Attachment path is not a string:", rawPath);
  //             }
  //           }
  //         }
  //         return html;
  //       })
  //       .join("<hr/>") ?? "<p>No supporting documents uploaded</p>";
  //   const attachments: { filename: string; path: string; contentType: string }[] =
  //     app.supportingDocument?.supportingDocumentAttachments
  //       ?.map((doc) => {
  //         if (!doc.attachment?.paths || !Array.isArray(doc.attachment.paths) || doc.attachment.paths.length === 0)
  //           return null;

  //         try {
  //           // paths are stored as JSON strings, parse them
  //           const rawPath = doc.attachment.paths[0];
  //           if (typeof rawPath !== "string") return null;
  //           const fileData: { path: string; mimetype: string; originalname: string } = JSON.parse(rawPath);

  //           // Resolve local file path
  //           const filePath = path.join(process.cwd(), fileData.path);
  //           if (!fs.existsSync(filePath)) return null;

  //           return {
  //             filename: fileData.originalname,
  //             path: filePath,
  //             contentType: fileData.mimetype,
  //           };
  //         } catch (err) {
  //           console.error("Error parsing attachment path:", err);
  //           return null;
  //         }
  //       })
  //       .filter((f): f is { filename: string; path: string; contentType: string } => f !== null) || [];

  const attachments: { filename: string; path: string; contentType: string }[] =
    app.supportingDocument?.supportingDocumentAttachments
      ?.map((doc) => {
        if (!doc.attachment?.paths || !Array.isArray(doc.attachment.paths) || doc.attachment.paths.length === 0)
          return null;

        try {
          const rawPath = doc.attachment.paths[0];
          if (typeof rawPath !== "string") return null;

          const fileData: { path: string; mimetype: string; originalname: string } = JSON.parse(rawPath);

          const filePath = path.join(process.cwd(), fileData.path);
          if (!fs.existsSync(filePath)) return null;

          return {
            filename: fileData.originalname,
            path: filePath,
            contentType: fileData.mimetype,
          };
        } catch (err) {
          console.error("Error parsing attachment path:", err);
          return null;
        }
      })
      .filter((f): f is { filename: string; path: string; contentType: string } => f !== null) || [];

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: personalInfo?.email,
    subject: "Application Profile Summary",
    html: `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
        <h2>📋 Application Profile Summary</h2>
        <p><strong>Application ID:</strong> ${app.applicationId ?? "N/A"}</p>
        <p><strong>Created At:</strong> ${new Date(app.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> ${app.status}</p>
        <p><strong>Stage:</strong> ${app.stage}</p>
        <p><strong>Interview Outcome:</strong> ${app.interviewOutcome}</p>
        <p><strong>Outcome:</strong> ${app.outcome}</p>

        <h3>👤 Personal Information</h3>
        <p>First Name: ${personalInfo?.firstName ?? "N/A"}</p>
        <p>Last Name: ${personalInfo?.lastName ?? "N/A"}</p>
        <p>Date of Birth: ${personalInfo?.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString().split("T")[0] : "N/A"}</p>
        <p>Email Address: ${personalInfo?.email ?? "N/A"}</p>
        <p>Country of Birth: ${personalInfo?.countryOfBirth ?? "N/A"}</p>
        <p>Nationality: ${personalInfo?.currentNationality ?? "N/A"}</p>
        <p>Sex: ${personalInfo?.sex ?? "N/A"}</p>
        <p>Other Sex: ${personalInfo?.otherSex ?? "N/A"}</p>
        <p>Ethnicity: ${personalInfo?.ethnicity ?? "N/A"}</p>
        <p>Mobile Number: ${personalInfo?.mobileNumber ?? "N/A"}</p>
        <p>Current Address: ${personalInfo?.currentAddress ?? "N/A"}</p>

        <h3>🎓 Academic Background</h3>
        <p>Highest Level of Qualification: ${academic?.highestLevelOfQualification ?? "N/A"}</p>
        <p>Area of Qualification: ${academic?.areaOfQualification ?? "N/A"}</p>
         <p>Grade/Result: ${academic?.gradeOrResult ?? "N/A"}</p>
        <p>Year Completed: ${academic?.yearCompleted ?? "N/A"}</p>
        <p>Country of Issue: ${academic?.countryOfIssue ?? "N/A"}</p>
        <p>Institution Name: ${academic?.institutionName ?? "N/A"}</p>

        <h3>📚 Course Selection</h3>
        <p>Faculty: ${course?.faculty ?? "N/A"}</p>
        <p>Course: ${course?.courseId ?? "N/A"}</p>
        <p>Intake: ${course?.intake ?? "N/A"}</p>
        <p>Year of Course: ${course?.yearOfCourse ? new Date(course.yearOfCourse).toISOString().split("T")[0] : "N/A"}</p>

        <h3>📝 Personal Statement</h3>
        <p>${statement?.statement ?? "N/A"}</p>

        <h3>♿ Disability & Accessibility</h3>
        // <p>${disability?.disabilityAndAccessibility ?? "N/A"}</p>

        <h3>👨‍👩‍👧 Next of Kin</h3>
        <p>Relationship: ${kin?.relationship ?? "N/A"}</p>
        <p>Full Name: ${kin?.fullName ?? "N/A"}</p>
        <p>Phone or Mobile: ${kin?.phoneOrMobile ?? "N/A"}</p>
        <p>Address: ${kin?.address ?? "N/A"}</p>

        <h3>💰 Fund Information</h3>
        <p>Source: ${fund?.source ?? "N/A"}</p>

        <h3>📄 References</h3>
        <p>${ref ?? "N/A"}</p>

        <h3>⚖️ Criminal Background</h3>
        <p>Offense or Penalty: ${criminal?.offenseOrPenalty ?? "N/A"}</p>
        <p>Disqualification or Sanction: ${criminal?.disqualificationOrSanction ?? "N/A"}</p>
        <p>Police Clearance: ${criminal?.policeClearance ?? "N/A"}</p>

        <h3>📂 Supporting Documents</h3>
    <ul>
          ${attachments.map((att) => `<li>${att.filename} (${att.contentType})</li>`).join("")}
        </ul>
      </body>
    </html>
    `,
    attachments,
  };

  //   console.log("📧 Sending Application Profile Summary to:", docHtml);
  return transporter.sendMail(mailOptions);
};

export const emailVerification = async (email: string) => {
  // Encrypt the email for the verification URL
  const encryptedEmail = encryptUrlSafe(email);
  const verificationUrl = `${process.env.AUTH_BACKEND_URL}/auth-management/verify-email/application?token=${encryptedEmail}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
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
