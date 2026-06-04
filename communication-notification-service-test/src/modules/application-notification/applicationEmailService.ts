import type { SendMailOptions, SentMessageInfo } from 'nodemailer';
// We'll define the types we need instead of importing from prisma client
// This avoids the dependency issue
// import type { Interview } from '@prisma/client';
import { EmailType } from '@prisma/client';
import { encryptUrlSafe } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';
import prisma from '../../prismaClient';
import type Stripe from 'stripe';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
// import { env } from '../../config/env';
import { logEmailNotification } from '../../utils/emailLogger';
import { renderTemplate } from '../../utils/renderTemplate';
import { transporter } from '../notification/mail.service';
import type { ISendApprovalEmailInput } from './schema';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env['AWS_REGION'] ?? 'eu-west-2',
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
  },
});

const S3_BUCKET_NAME = process.env['AWS_BUCKET_NAME'] ?? 'educateu';

// Define interfaces for the database models we need based on the Prisma schema
interface PrismaPersonalInformation {
  id: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: Date;
  email: string | null;
  verifiedEmail?: boolean;
  countryOfBirth?: string | null;
  currentNationality?: string | null;
  sex?: string | null;
  otherSex?: string | null;
  ethnicity?: string | null;
  mobileNumber: string | null;
  countryOfResidence?: string | null;
  currentAddress: string | null;
  currentPostCode?: string | null;
  permanentAddress: string | null;
  nationalIdentityType?: string | null;
  nationalIdentityNumber?: string | null;
  applicationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the Zod validation result
interface PersonalInformation {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // Changed from Date to string to match Zod validation
  email?: string;
  countryOfBirth?: string;
  currentNationality?: string;
  sex?: string;
  otherSex?: string;
  ethnicity?: string;
  mobileNumber?: string;
  currentAddress?: string;
}

interface TieredPricing {
  id: string;
  courseFeeId: string;
  tierName: string;
  price: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SemesterModule {
  id: string;
  courseSemesterId: string;
  moduleName: string;
  credits: number;
  moduleFee: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Semester {
  id: string;
  courseFeeStructureId: string;
  semesterName: string;
  semesterFee: number;
  semesterOrder: number;
  createdAt: Date;
  updatedAt: Date;
  semesterModules: SemesterModule[];
}

interface CourseFeeStructure {
  id: string;
  courseFeeId: string;
  totalSemesters: number;
  totalCredits?: number | null;
  createdAt: Date;
  updatedAt: Date;
  semesters: Semester[];
}

interface CourseFee {
  id: string;
  sessionCourseId?: string | null;
  overallCourseFee: number;
  currencyType: string;
  status: string;
  promoCodeStatus?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tieredPricings: TieredPricing[];
  courseFeeStructure?: CourseFeeStructure | null;
  courseId?: string | null;
}

interface SessionCourse {
  id: string;
  title?: string | null;
  courseFees?: CourseFee[];
}

interface CourseSelection {
  id: string;
  faculty?: string | null;
  sessionId?: string | null;
  courseId?: string | null;
  intake?: string | null;
  yearOfCourse?: string | null;
  applicationId: string;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    course?: SessionCourse;
  } | null; // Updated to use SessionCourse
}

interface User {
  id: string;
  email?: string | null;
  agentEmail?: string | null;
  facultyEmail?: string | null;
}

interface UserPortalCategory {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

interface UserPortalCategoryRole {
  id: string;
  userPortalCategoryId: string;
  createdAt: Date;
  updatedAt: Date;
  userPortalCategory: UserPortalCategory;
}

interface UserPortalCategoryRoleApplication {
  id: string;
  userPortalCategoryRoleId: string;
  applicationId: string;
  createdAt: Date;
  updatedAt: Date;
  userPortalCategoryRole: UserPortalCategoryRole;
}

interface Application {
  id: string;
  applicationId?: string | null;
  status?: string | null;
  outcome?: string | null;
  personalInformation?: PrismaPersonalInformation | null;
  courseSelection?: CourseSelection | null;
  userPortalCategoryRoleApplications?: UserPortalCategoryRoleApplication[];
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentRecord {
  id: string;
  applicantId: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentPlan: string;
  paymentStatus: string;
  installmentsPaid: number;
  totalInstallments?: number | null;
  nextPaymentDate?: Date | null;
  nextPaymentAmount?: number | null;
  dueDate?: Date | null;
  lastReminderDate?: Date | null;
  promotionalCodeId?: string | null;
  discountApplied?: number | null;
  createdAt: Date;
  updatedAt: Date;
  paymentHistories?: PaymentHistory[]; // Make this optional to handle Prisma return types
}

interface PaymentHistory {
  id: string;
  paymentRecordId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate: Date;
  transactionId?: string;
  reference?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_name?: string;
  bank_swift_code?: string;
  bank_branch?: string;
  receipt_url?: string;
  processedBy?: string;
  processedDate?: Date;
  notes?: string;
  payment_status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the remaining types we need
export interface PersonalStatement {
  statement?: string;
}

export interface AcademicBackground {
  highestLevelOfQualification?: string;
  areaOfQualification?: string;
  gradeOrResult?: string;
  yearCompleted?: string;
  countryOfIssue?: string;
  institutionName?: string;
}

export interface DisabilityAndAccessibility {
  disabilityAndAccessibility?: string;
}

export interface NextOfKin {
  relationship?: string;
  fullName?: string;
  phoneOrMobile?: string;
  address?: string;
}

export interface Fund {
  source?: string;
}

export interface Reference {
  [key: string]: unknown; // Flexible type for reference
}

export interface CriminalBackground {
  offenseOrPenalty?: string;
  disqualificationOrSanction?: string;
  policeClearance?: string;
}

export interface Attachment {
  paths?: string[];
}

export interface SupportingDocumentAttachment {
  name?: string;
  status?: string;
  attachment?: Attachment;
}

export interface SupportingDocument {
  supportingDocumentAttachments?: SupportingDocumentAttachment[];
}

export interface ApplicationWithRelations {
  applicationId?: string;
  createdAt?: string;
  status?: string;
  stage?: string;
  interviewOutcome?: string;
  outcome?: string;
  personalInformation?: PersonalInformation;
  personalStatement?: PersonalStatement;
  academicBackground?: AcademicBackground;
  courseSelection?: CourseSelection;
  disabilityAndAccessibility?: DisabilityAndAccessibility;
  nextOfKin?: NextOfKin;
  fund?: Fund;
  reference?: Reference;
  criminalBackground?: CriminalBackground;
  supportingDocument?: SupportingDocument;
}

// Helper function to convert S3 stream to Buffer
const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export const sendEmail = async (
  app: ApplicationWithRelations
): Promise<SentMessageInfo> => {
  const personalInfo = app.personalInformation;
  const academic = app.academicBackground;
  const course = app.courseSelection;
  const statement = app.personalStatement;
  const disability = app.disabilityAndAccessibility;
  const kin = app.nextOfKin;
  const fund = app.fund;
  const ref = app.reference;
  const criminal = app.criminalBackground;

  // Fetch attachments from S3
  const attachmentsResult = await Promise.all(
    app.supportingDocument?.supportingDocumentAttachments?.map(
      async (doc: SupportingDocumentAttachment) => {
        if (
          !doc.attachment?.paths ||
          !Array.isArray(doc.attachment.paths) ||
          doc.attachment.paths.length === 0
        )
          return null;

        try {
          const rawPath = doc.attachment.paths[0];
          if (typeof rawPath !== 'string') return null;

          const fileData: {
            path: string;
            mimetype: string;
            originalname: string;
          } = JSON.parse(rawPath);

          // Extract the S3 key from the path (remove leading slash if present)
          //  const s3Key = fileData.path.startsWith('/')
          //   ? fileData.path.slice(1)
          //   : fileData.path;
          let s3Key = decodeURIComponent(
            fileData.path.startsWith('/')
              ? fileData.path.slice(1)
              : fileData.path
          );
          // Aggressively remove redundant 'uploads/' or leading slashes
          s3Key = s3Key.replace(/^(uploads\/)+/g, 'uploads/');

          // Fetch file from S3
          const getObjectCommand = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
          });

          const response = await s3Client.send(getObjectCommand);
          const fileContent = await streamToBuffer(response.Body as Readable);

          return {
            filename: fileData.originalname,
            content: fileContent,
            contentType: fileData.mimetype,
          };
        } catch (err) {
          console.error(
            `Error fetching file from S3: ${err instanceof Error ? err.message : String(err)}`
          );
          return null;
        }
      }
    ) ?? []
  );

  // Filter out null results
  const attachments = attachmentsResult.filter(
    (f): f is { filename: string; content: Buffer; contentType: string } =>
      f !== null
  );
  const academicInfo =
    academic && typeof academic === 'object'
      ? `<ul>
      ${Object.entries(academic)
        .filter(
          ([key, value]) =>
            !['id', 'applicationId', 'createdAt', 'updatedAt'].includes(key) &&
            value !== null &&
            value !== undefined
        )
        .map(
          ([key, value]) => `
        <li><strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : String(value)}</li>
      `
        )
        .join('')}    
    </ul>`
      : `<p>${academic ?? 'N/A'}</p>`;

  // Format References (Skip null/undefined values)
  const referencesHtml =
    ref && typeof ref === 'object'
      ? `<ul>
      ${Object.entries(ref)
        .filter(
          ([key, value]) =>
            !['id', 'applicationId', 'createdAt', 'updatedAt'].includes(key) &&
            value !== null &&
            value !== undefined
        )
        .map(
          ([key, value]) => `
        <li><strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : String(value)}</li>
      `
        )
        .join('')}
    </ul>`
      : `<p>${ref ?? 'N/A'}</p>`;

  // Format Supporting Documents with Pre-signed URLs
  const supportingDocsItems = await Promise.all(
    (app.supportingDocument?.supportingDocumentAttachments ?? []).map(
      async (doc: SupportingDocumentAttachment) => {
        const docName = doc.name ?? 'Unnamed Document';
        const docStatus = doc.status ?? 'N/A';
        let downloadLink = '#';

        if (
          doc.attachment?.paths &&
          Array.isArray(doc.attachment.paths) &&
          doc.attachment.paths.length > 0
        ) {
          try {
            const rawPath = doc.attachment.paths[0];
            if (typeof rawPath === 'string') {
              const fileData: {
                path: string;
                mimetype: string;
                originalname: string;
              } = JSON.parse(rawPath);
              let s3Key = decodeURIComponent(
                fileData.path.startsWith('/')
                  ? fileData.path.slice(1)
                  : fileData.path
              );
              // Aggressively remove redundant 'uploads/' or leading slashes
              s3Key = s3Key.replace(/^(uploads\/)+/g, 'uploads/');

              const command = new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
              });
              // Pre-signed URL valid for 1 hour
              downloadLink = await getSignedUrl(s3Client, command, {
                expiresIn: 3600,
              });
            }
          } catch (e) {
            console.error('Error generating pre-signed URL:', e);
          }
        }
        return `<li><strong>${docName}</strong> - Status: ${docStatus} - <a href="${downloadLink}" target="_blank">Download</a></li>`;
      }
    )
  );

  const supportingDocumentsHtml =
    supportingDocsItems.length > 0
      ? `<ul>${supportingDocsItems.join('')}</ul>`
      : '<p>No supporting documents uploaded</p>';

  // Format Attachments (for display in body with pre-signed URLs)
  const attachmentsHtmlItems = await Promise.all(
    (app.supportingDocument?.supportingDocumentAttachments ?? []).map(
      async (doc: SupportingDocumentAttachment) => {
        let downloadLink = '';
        if (
          doc.attachment?.paths &&
          Array.isArray(doc.attachment.paths) &&
          doc.attachment.paths.length > 0
        ) {
          try {
            const rawPath = doc.attachment.paths[0];
            if (typeof rawPath === 'string') {
              const fileData: {
                path: string;
              } = JSON.parse(rawPath);
              let s3Key = decodeURIComponent(
                fileData.path.startsWith('/')
                  ? fileData.path.slice(1)
                  : fileData.path
              );
              // Aggressively remove redundant 'uploads/' or leading slashes
              s3Key = s3Key.replace(/^(uploads\/)+/g, 'uploads/');

              const command = new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
              });
              downloadLink = await getSignedUrl(s3Client, command, {
                expiresIn: 3600,
              });
            }
          } catch (e) {
            console.error('Error generating attachment pre-signed URL:', e);
          }
        }
        return downloadLink;
      }
    )
  );

  const validDownloadLinks = attachmentsHtmlItems.filter(link => link !== '');

  const attachmentsHtml =
    validDownloadLinks.length > 0
      ? `<p><strong>📎 Attachments:</strong></p>
     <ul>
       ${validDownloadLinks.map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`).join('')}
     </ul>`
      : '';

  // Format Disability & Accessibility
  const disabilityHtml = disability?.disabilityAndAccessibility
    ? Array.isArray(disability.disabilityAndAccessibility)
      ? disability.disabilityAndAccessibility.join(', ')
      : String(disability.disabilityAndAccessibility)
    : 'N/A';

  const infoData = {
    applicationId: app.applicationId,
    createdAt: app.createdAt,
    status: app.status,
    stage: app.stage,
    interviewOutcome: app.interviewOutcome,
    outcome: app.outcome,

    firstName: personalInfo?.firstName,
    lastName: personalInfo?.lastName,
    dateOfBirth: personalInfo?.dateOfBirth,
    email: personalInfo?.email,
    countryOfBirth: personalInfo?.countryOfBirth,
    currentNationality: personalInfo?.currentNationality,
    sex: personalInfo?.sex,
    otherSex: personalInfo?.otherSex,
    ethnicity: personalInfo?.ethnicity,
    mobileNumber: personalInfo?.mobileNumber,
    currentAddress: personalInfo?.currentAddress,

    highestLevelOfQualification: academic?.highestLevelOfQualification ?? 'N/A',
    areaOfQualification: academic?.areaOfQualification ?? 'N/A',
    gradeOrResult: academic?.gradeOrResult ?? 'N/A',
    yearCompleted: academic?.yearCompleted ?? 'N/A',
    countryOfIssue: academic?.countryOfIssue ?? 'N/A',
    institutionName: academic?.institutionName ?? 'N/A',
    academicBackground: academicInfo,

    faculty: course?.faculty,
    courseTitle: course?.course?.course?.title,
    courseId: course?.courseId,
    intake: course?.intake,
    yearOfCourse: course?.yearOfCourse,

    personalStatement: statement?.statement,

    disabilityAndAccessibility:
      disabilityHtml ?? disability?.disabilityAndAccessibility,
    references:
      referencesHtml ??
      (ref ? `<pre>${JSON.stringify(ref, null, 2)}</pre>` : 'N/A'),
    supportingDocuments:
      supportingDocumentsHtml ??
      app.supportingDocument?.supportingDocumentAttachments,
    attachments: attachmentsHtml ?? attachments,

    kinRelationship: kin?.relationship,
    kinFullName: kin?.fullName,
    kinPhoneOrMobile: kin?.phoneOrMobile,
    kinAddress: kin?.address,

    fundSource: fund?.source,

    offenseOrPenalty: criminal?.offenseOrPenalty,
    disqualificationOrSanction: criminal?.disqualificationOrSanction,
    policeClearance: criminal?.policeClearance,
  };

  const template = await renderTemplate(
    EmailType.APPLICATION_SUMMARY_EMAIL,
    {
      ...infoData,
    },
    {
      optionalFields: [
        'intake',
        'faculty',
        'otherSex',
        'kinAddress',
        'kinFullName',
        'kinRelationship',
        'kinPhoneOrMobile',
        'highestLevelOfQualification',
        'mobileNumber',
        'gradeOrResult',
        'yearCompleted',
        'countryOfIssue',
        'institutionName',
        'personalStatement',
        'areaOfQualification',
        'disabilityAndAccessibility',
        'countryOfBirth',
        'currentNationality',
        'sex',
        'ethnicity',
        'fundSource',
        'offenseOrPenalty',
        'disqualificationOrSanction',
        'policeClearance',
        'yearOfCourse',
        'references',
        'supportingDocuments',
        'attachments',
        'academicBackground',
      ],
    }
  );

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
        <h2>📋 Application Profile Summary</h2>
        <p><strong>Application ID:</strong> ${app.applicationId ?? 'N/A'}</p>
        <p><strong>Created At:</strong> ${app.createdAt ? new Date(app.createdAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Status:</strong> ${app.status}</p>
        <p><strong>Stage:</strong> ${app.stage}</p>
        <p><strong>Interview Outcome:</strong> ${app.interviewOutcome}</p>
        <p><strong>Outcome:</strong> ${app.outcome}</p>

        <h3>👤 Personal Information</h3>
        <p>First Name: ${personalInfo?.firstName ?? 'N/A'}</p>
        <p>Last Name: ${personalInfo?.lastName ?? 'N/A'}</p>
        <p>Date of Birth: ${personalInfo?.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString().split('T')[0] : 'N/A'}</p>
        <p>Email Address: ${personalInfo?.email ?? 'N/A'}</p>
        <p>Country of Birth: ${personalInfo?.countryOfBirth ?? 'N/A'}</p>
        <p>Nationality: ${personalInfo?.currentNationality ?? 'N/A'}</p>
        <p>Sex: ${personalInfo?.sex ?? 'N/A'}</p>
        <p>Other Sex: ${personalInfo?.otherSex ?? 'N/A'}</p>
        <p>Ethnicity: ${personalInfo?.ethnicity ?? 'N/A'}</p>
        <p>Mobile Number: ${personalInfo?.mobileNumber ?? 'N/A'}</p>
        <p>Current Address: ${personalInfo?.currentAddress ?? 'N/A'}</p>

        <h3>🎓 Academic Background</h3>
        <p>Highest Level of Qualification: ${academic?.highestLevelOfQualification ?? 'N/A'}</p>
        <p>Area of Qualification: ${academic?.areaOfQualification ?? 'N/A'}</p>
         <p>Grade/Result: ${academic?.gradeOrResult ?? 'N/A'}</p>
        <p>Year Completed: ${academic?.yearCompleted ?? 'N/A'}</p>
        <p>Country of Issue: ${academic?.countryOfIssue ?? 'N/A'}</p>
        <p>Institution Name: ${academic?.institutionName ?? 'N/A'}</p>

        <h3>📚 Course Selection</h3>
        <p>Faculty: ${course?.faculty ?? 'N/A'}</p>
        <p>Course: ${course?.course?.course?.title ?? course?.courseId ?? 'N/A'}</p>
        <p>Intake: ${course?.intake ?? 'N/A'}</p>
        <p>Year of Course: ${course?.yearOfCourse ? new Date(course.yearOfCourse).toISOString().split('T')[0] : 'N/A'}</p>

        <h3>📝 Personal Statement</h3>
        <p>${statement?.statement ?? 'N/A'}</p>

        <h3>♿ Disability & Accessibility</h3>
         <p>${disabilityHtml}</p> 

        <h3>👨‍👩‍👧 Next of Kin</h3>
        <p>Relationship: ${kin?.relationship ?? 'N/A'}</p>
        <p>Full Name: ${kin?.fullName ?? 'N/A'}</p>
        <p>Phone or Mobile: ${kin?.phoneOrMobile ?? 'N/A'}</p>
        <p>Address: ${kin?.address ?? 'N/A'}</p>

        <h3>💰 Fund Information</h3>
        <p>Source: ${fund?.source ?? 'N/A'}</p>

        <h3>📄 References</h3>
        ${referencesHtml}

        <h3>⚖️ Criminal Background</h3>
        <p>Offense or Penalty: ${criminal?.offenseOrPenalty ?? 'N/A'}</p>
        <p>Disqualification or Sanction: ${criminal?.disqualificationOrSanction ?? 'N/A'}</p>
        <p>Police Clearance: ${criminal?.policeClearance ?? 'N/A'}</p>

        <h3>📂 Supporting Documents</h3>
        ${supportingDocumentsHtml}
        ${attachmentsHtml}
      </body>
    </html>
    `;
  const emailBody = template.body ?? htmlContent;
  const subject = template.subject ?? 'Application Profile Summary';

  const mailOptions = {
    from: process.env['EMAIL_USER'] ?? '',
    to: personalInfo?.email,
    subject: subject,
    html: emailBody,
    attachments,
  };

  const result = await transporter.sendMail(mailOptions);

  // Log application summary email
  if (personalInfo?.email) {
    await logEmailNotification(
      EmailType.APPLICATION_SUMMARY_EMAIL,
      personalInfo.email,
      `Application summary email sent for application ID: ${app.applicationId ?? 'N/A'}`
    );
  }

  return result;
};

export const emailVerification = async (
  email: string,
  applicationId?: string
): Promise<SentMessageInfo> => {
  // Encrypt the email for the verification URL
  const encryptedEmail = encryptUrlSafe(email);
  const verificationUrl = `${process.env['AUTH_BACKEND_URL'] ?? ''}/auth-management/verify-email/application?token=${encryptedEmail}&applicationId=${applicationId ?? ''}`;

  const template = await renderTemplate(
    EmailType.APPLICATION_EMAIL_VERIFICATION,
    {
      verificationUrl,
    }
  );

  const htmlContent = `
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
    `;

  const emailBody = template.body ?? htmlContent;
  const subject = template.subject ?? 'Email Verification';

  const mailOptions = {
    from: process.env['EMAIL_USER'],
    to: email,
    subject: subject,
    html: emailBody,
  };

  const result = await transporter.sendMail(mailOptions);

  // Log email verification
  await logEmailNotification(
    EmailType.APPLICATION_EMAIL_VERIFICATION,
    email,
    `Application email verification sent successfully${applicationId ? ` for application: ${applicationId}` : ''}`
  );

  return result;
};

// Function to send email verification confirmation (shows that user has verified email)
export const emailVerifiedConfirmation = async (
  email: string,
  userName: string,
  applicationId?: string
): Promise<SentMessageInfo> => {
  const mailOptions = {
    from: process.env['EMAIL_USER'],
    to: email,
    subject: '✅ Email Verified Successfully',
    html: `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 30px; text-align: center;">
            <h1 style="color: #16a34a; margin: 0 0 10px 0;">✅ Email Verified</h1>
            <div style="background-color: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 18px; color: #166534; margin: 0;">
                <strong>${userName}</strong> has successfully verified their email address.
              </p>
            </div>
            <div style="background-color: white; border-radius: 6px; padding: 15px; margin: 15px 0; text-align: left;">
              ${applicationId ? `<p style="margin: 5px 0; color: #374151;"><strong>Application ID:</strong> ${applicationId}</p>` : ''}
              <p style="margin: 5px 0; color: #374151;"><strong>Verified At:</strong> ${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">What's Next?</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Your application can now proceed to the next stage</li>
              <li style="margin-bottom: 10px;">You will receive updates about your application status</li>
              <li style="margin-bottom: 10px;">Keep an eye on your email for important notifications</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center;">
            If you did not initiate this verification, please contact our support team immediately.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} EducateU. All rights reserved.
          </p>
        </div>
      </body>
    </html>
    `,
  };

  const result = await transporter.sendMail(mailOptions);

  // Log email verification confirmation
  await logEmailNotification(
    EmailType.EMAIL_VERIFICATION_EMAIL,
    email,
    `Email verification confirmation sent to ${userName}${applicationId ? ` for application: ${applicationId}` : ''}`
  );

  return result;
};

// ✅ NEW FUNCTION FOR SENDING STRIPE APPLICATION OUTCOME EMAILS
export const sendStripeApplicationOutcomeEmail = async (
  applicationId: string,
  outcome: string
): Promise<{
  emailSent: boolean;
  messageId: string;
  paymentRecord: PaymentRecord | null;
}> => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        personalInformation: true,
        courseSelection: {
          include: {
            course: {
              include: {
                courseFees: {
                  include: {
                    tieredPricings: true,
                    courseFeeStructure: {
                      include: {
                        semesters: {
                          include: {
                            semesterModules: true,
                          },
                        },
                      },
                    },
                  },
                  where: {
                    status: 'ACTIVE',
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
                course: true, // Course details
              },
            },
          },
        },
        userPortalCategoryRoleApplications: {
          include: {
            userPortalCategoryRole: {
              include: { userPortalCategory: { include: { user: true } } },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 'NOT_FOUND', 404);
    }

    // Type assertion to handle Prisma return type compatibility
    const typedApplication = application as unknown as Application;
    const user =
      typedApplication?.userPortalCategoryRoleApplications?.[0]
        ?.userPortalCategoryRole?.userPortalCategory?.user;
    const senderEmail = user?.email ?? user?.agentEmail ?? user?.facultyEmail;
    const applicantName =
      `${typedApplication.personalInformation?.firstName ?? ''} ${typedApplication.personalInformation?.lastName ?? ''}`.trim();
    const applicationRef =
      typedApplication.applicationId ?? typedApplication.id;

    // Get course fee information
    const courseName =
      typedApplication.courseSelection?.course?.course?.title ?? undefined;
    // Type assertion to access courseFees on SessionCourse
    const sessionCourseWithFees = typedApplication.courseSelection?.course as
      | (SessionCourse & { courseFees?: CourseFee[] })
      | null
      | undefined;
    const courseFee = sessionCourseWithFees?.courseFees?.[0];

    // ✅ CREATE PAYMENT RECORD FOR APPROVED APPLICATIONS
    let paymentRecord = null;
    if (
      (outcome === 'APPROVED_UNCONDITIONAL' ||
        outcome === 'APPROVED_CONDITIONAL') &&
      courseFee
    ) {
      paymentRecord = await createPaymentRecord(typedApplication, courseFee);

      // Update application outcome
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          outcome: outcome as
            | 'APPROVED_UNCONDITIONAL'
            | 'APPROVED_CONDITIONAL'
            | 'REJECTED'
            | null, // Match Prisma enum type
          status: 'APPROVED',
        },
      });
    }

    const courseFeeHtml = await generateCourseFeeHtml(
      courseFee ?? undefined,
      applicationId,
      courseName ?? 'N/A',
      paymentRecord?.id,
      typedApplication
    );

    // Outcome-specific email configurations
    const emailConfigs = {
      APPROVED_UNCONDITIONAL: {
        subject: `Congratulations! Your Application ${applicationRef} has been Approved`,
        color: '#27ae60',
        header: `Congratulations ${applicantName}!`,
        content: `
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We are pleased to inform you that your application has been <strong>unconditionally approved</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            This means you have met all the requirements for admission. Welcome to our institution!
          </p>
          ${courseFeeHtml}
          <p style="font-size: 16px; line-height: 1.6;">
            Please log in to your account to view the full details and next steps for enrollment.
          </p>
        `,
      },
      APPROVED_CONDITIONAL: {
        subject: `Your Application ${applicationRef} has been Conditionally Approved`,
        color: '#f39c12',
        header: `Congratulations ${applicantName}!`,
        content: `
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We are pleased to inform you that your application has been <strong>conditionally approved</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            This means you have been accepted, but there are some conditions you need to fulfill before final admission.
          </p>
          ${courseFeeHtml}
          <p style="font-size: 16px; line-height: 1.6;">
            Please log in to your account to view the specific conditions and next steps.
          </p>
        `,
      },
      REJECTED: {
        subject: `Update on Your Application ${applicationRef}`,
        color: '#c0392b',
        header: `Dear ${applicantName},`,
        content: `
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We regret to inform you that your application has not been successful at this time.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We appreciate your interest in our institution and encourage you to consider applying again in the future.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            You may log in to your account for more information or to reapply in the future.
          </p>
        `,
      },
    };

    const config: {
      subject: string;
      color: string;
      header: string;
      content: string;
    } = emailConfigs[outcome as keyof typeof emailConfigs] || {
      subject: `Update on Your Application ${applicationRef}`,
      color: '#3498db',
      header: `Dear ${applicantName},`,
      content: `
        <p style="font-size: 16px; line-height: 1.6;">
          Your application status has been updated to: <strong>${outcome}</strong>.
        </p>
        ${courseFeeHtml}
      `,
    };

    const mailOptions: SendMailOptions = {
      from: process.env['EMAIL_USER'],
      to: application.personalInformation?.email,
      subject: config.subject,
      html: `
        <html>
          <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: ${config.color}; text-align: center; margin-bottom: 20px;">
                ${config.header}
              </h2>
              ${config.content}
              <p style="margin-top: 30px; font-weight: bold; color: #2c3e50;">
                Best regards,<br />The Abree Team
              </p>
            </div>
          </body>
        </html>
      `,
      ...(senderEmail ? { cc: senderEmail } : {}),
    };

    const emailResult = await transporter.sendMail(mailOptions);

    // Log stripe application outcome email
    if (application.personalInformation?.email) {
      await logEmailNotification(
        EmailType.STRIPE_APPLICATION_OUTCOME_EMAIL,
        application.personalInformation.email,
        `Stripe application outcome email sent: ${outcome}`
      );
    }

    return {
      emailSent: true,
      messageId: emailResult.messageId,
      paymentRecord: paymentRecord,
    };
  } catch (error: unknown) {
    // Log failed email
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { personalInformation: true },
    });
    if (application?.personalInformation?.email) {
      await logEmailNotification(
        EmailType.STRIPE_APPLICATION_OUTCOME_EMAIL,
        application.personalInformation.email,
        `Failed to send stripe application outcome email: ${outcome}`,
        'FAILED'
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new AppError(
      `Failed to send outcome email: ${errorMessage}`,
      'EMAIL_SEND_ERROR',
      500
    );
  }
};

// ✅ CREATE PAYMENT RECORD FUNCTION
async function createPaymentRecord(
  application: Application,
  courseFee: CourseFee
): Promise<PaymentRecord> {
  try {
    // Calculate total fee
    const totalFee = courseFee.overallCourseFee;

    // Create payment record
    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        applicantId: application.id,
        totalFee: totalFee,
        paidAmount: 0,
        remainingAmount: totalFee,
        paymentPlan: 'FULL_PAYMENT',
        paymentStatus: 'PENDING',
        installmentsPaid: 0,
        totalInstallments: 1,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        nextPaymentAmount: totalFee,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Create initial payment history record
    await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount: 0,
        paymentMethod: 'ONLINE',
        status: 'PENDING',
        paymentDate: new Date(),
        notes: 'Payment record created - awaiting payment',
        payment_status: false,
      },
    });

    return paymentRecord;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new AppError(
      `Failed to create payment record: ${errorMessage}`,
      'PAYMENT_ERROR',
      500
    );
  }
}

// ✅ UPDATED GENERATE COURSE FEE HTML FUNCTION WITH PAYMENT OPTIONS
async function generateCourseFeeHtml(
  courseFee: CourseFee | undefined | null,
  applicationId: string,
  courseName: string,
  paymentRecordId?: string,
  application?: Application
): Promise<string> {
  const stripe = (await import('stripe')).default;
  const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
  if (!stripeSecretKey) {
    throw new AppError('STRIPE_SECRET_KEY is required', 'MISSING_ENV_VAR', 500);
  }
  const stripeInstance = new stripe(stripeSecretKey);

  if (!courseFee) {
    return `
      <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #6c757d;">
        <h3 style="margin-top: 0; color: #495057;">Course Fee Information</h3>
        <p style="margin: 0; color: #6c757d;">Course fee details will be provided soon.</p>
      </div>
    `;
  }

  const fullAmount = Math.round(courseFee.overallCourseFee * 100);

  // Calculate first semester fee (if structured course)
  let firstSemesterFee = 0;
  let hasSemesterStructure = false;

  if (
    courseFee?.courseFeeStructure?.semesters &&
    courseFee.courseFeeStructure.semesters.length > 0 &&
    courseFee.courseFeeStructure.semesters[0]
  ) {
    hasSemesterStructure = true;
    firstSemesterFee = Math.round(
      courseFee.courseFeeStructure.semesters[0].semesterFee * 100
    );
  }

  try {
    // ✅ CHECK EXISTING PAYMENT RECORDS FOR MANUAL PAYMENT OPTION
    // Only check for PAID payments (not PENDING) to determine if manual payment should be shown
    const existingPayments = await prisma.paymentRecord.findMany({
      where: {
        applicantId: applicationId,
        paymentStatus: 'PAID', // Only check for PAID, not PENDING
      },
      include: {
        paymentHistories: {
          where: {
            status: 'PAID', // Only check for PAID histories
          },
        },
      },
    });

    // Check if user has any PAID payments (not PENDING)
    const hasAnyPayments = existingPayments.length > 0;

    // Define front URL for manual payment links
    const backUrl = process.env['AUTH_BACKEND_URL'] ?? 'http://localhost:3000';
    const MANUAL_PAYMENT_URL =
      process.env['MANUAL_PAYMENT_URL'] ?? 'http://localhost:5000';

    // Check payment status to determine which options to show
    let paymentRecord = null;
    if (paymentRecordId) {
      paymentRecord = await prisma.paymentRecord.findUnique({
        where: { id: paymentRecordId },
        include: {
          paymentHistories: {
            where: {
              status: 'PAID',
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    // Determine payment status
    let firstSemesterPaid = false;
    let fullPaymentPaid = false;

    if (paymentRecord) {
      // Check based on amounts paid
      if (hasSemesterStructure) {
        const firstSemesterAmount =
          courseFee.courseFeeStructure?.semesters?.[0]?.semesterFee ?? 0;

        // Check if the paid amount matches the first semester amount (allowing for small rounding differences)
        const paidHistories = paymentRecord.paymentHistories.filter(
          h => h.status === 'PAID'
        );

        // Check if there's a payment history that matches the first semester amount
        const firstSemesterPaymentHistory = paidHistories.find(
          history => Math.abs(history.amount - firstSemesterAmount) < 0.01 // Allow for small rounding differences
        );

        // Check if there's a payment history that matches the full amount
        const fullPaymentHistory = paidHistories.find(
          history =>
            Math.abs(history.amount - courseFee.overallCourseFee) < 0.01 // Allow for small rounding differences
        );

        // Determine payment status based on both amount and history
        firstSemesterPaid =
          firstSemesterPaymentHistory !== undefined ||
          paymentRecord.paidAmount >= firstSemesterAmount;
        fullPaymentPaid =
          fullPaymentHistory !== undefined ||
          paymentRecord.paidAmount >= courseFee.overallCourseFee;
      } else {
        fullPaymentPaid =
          paymentRecord.paidAmount >= courseFee.overallCourseFee;
      }
    }

    // Create Stripe Product for Full Payment (only if not already paid)
    let fullPaymentSession = null;
    if (!fullPaymentPaid) {
      const fullPaymentProduct = await stripeInstance.products.create({
        name: `${courseName} - Full Course Fee`,
        description: `Full course fee payment for ${courseName}`,
        metadata: {
          applicationId: applicationId,
          courseName: courseName,
          paymentType: 'FULL_PAYMENT',
        },
      });

      // Create Stripe Price for Full Payment
      const fullPaymentPrice = await stripeInstance.prices.create({
        product: fullPaymentProduct.id,
        currency: courseFee.currencyType.toLowerCase(),
        unit_amount: fullAmount,
      });

      // Create Checkout Session for Full Payment
      const fullPaymentSessionData: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: fullPaymentPrice.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env['BACKEND_URL']}/stripe-payments/payment-success?session_id={CHECKOUT_SESSION_ID}&type=full`,
        cancel_url: `${process.env['BACKEND_URL']}/payment/cancel`,
        metadata: {
          applicationId: applicationId,
          paymentRecordId: paymentRecordId ?? '',
          courseName: courseName,
          type: 'FULL_COURSE_FEE',
          amount: courseFee.overallCourseFee,
          paymentType: 'FULL',
        },
        billing_address_collection: 'auto',
        custom_fields: [
          {
            key: 'student_name',
            label: {
              type: 'custom',
              custom: 'Full Name',
            },
            type: 'text',
            optional: false,
          },
        ],
      };

      // Only add customer_email if it exists
      if (application?.personalInformation?.email) {
        fullPaymentSessionData.customer_email =
          application.personalInformation.email;
      }

      fullPaymentSession = await stripeInstance.checkout.sessions.create(
        fullPaymentSessionData
      );
    }

    let semesterPaymentSession = null;

    // Create First Semester Checkout Session if available and not already paid
    if (hasSemesterStructure && firstSemesterFee > 0 && !firstSemesterPaid) {
      const firstSemesterProduct = await stripeInstance.products.create({
        name: `${courseName} - First Semester Fee`,
        description: `First semester fee payment for ${courseName}`,
        metadata: {
          applicationId: applicationId,
          courseName: courseName,
          paymentType: 'FIRST_SEMESTER',
        },
      });

      const firstSemesterPrice = await stripeInstance.prices.create({
        product: firstSemesterProduct.id,
        currency: courseFee.currencyType.toLowerCase(),
        unit_amount: firstSemesterFee,
      });

      const semesterPaymentSessionData: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: firstSemesterPrice.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env['BACKEND_URL']}/stripe-payments/payment-success?session_id={CHECKOUT_SESSION_ID}&type=semester`,
        cancel_url: `${process.env['BACKEND_URL']}/payment/cancel`,
        metadata: {
          applicationId: applicationId,
          paymentRecordId: paymentRecordId ?? '',
          courseName: courseName,
          type: 'FIRST_SEMESTER_FEE',
          amount: courseFee.courseFeeStructure?.semesters?.[0]
            ? courseFee.courseFeeStructure.semesters[0].semesterFee
            : 0,
          paymentType: 'SEMESTER',
          semesterName: courseFee.courseFeeStructure?.semesters?.[0]
            ? courseFee.courseFeeStructure.semesters[0].semesterName
            : 'N/A',
        },
        billing_address_collection: 'auto',
        custom_fields: [
          {
            key: 'student_name',
            label: {
              type: 'custom',
              custom: 'Full Name',
            },
            type: 'text',
            optional: false,
          },
        ],
      };

      // Only add customer_email if it exists
      if (application?.personalInformation?.email) {
        semesterPaymentSessionData.customer_email =
          application.personalInformation.email;
      }

      semesterPaymentSession = await stripeInstance.checkout.sessions.create(
        semesterPaymentSessionData
      );
    }

    let feeDetails = '';

    // Check if it's a structured course (with semesters)
    if (courseFee?.courseFeeStructure) {
      const structure = courseFee.courseFeeStructure;
      feeDetails = `
        <h4 style="color: #2c3e50; margin-bottom: 10px;">Course Fee Structure</h4>
        <p><strong>Course Name:</strong> ${courseName}</p>
        <p><strong>Total Semesters:</strong> ${structure.totalSemesters}</p>
        <p><strong>Total Credits:</strong> ${structure.totalCredits ?? 'N/A'}</p>
        <p><strong>Overall Course Fee:</strong> ${courseFee.currencyType} ${courseFee.overallCourseFee}</p>

        <div style="margin-top: 15px;">
          <h5 style="color: #34495e; margin-bottom: 10px;">Semester Breakdown:</h5>
          ${structure.semesters
            .map(
              (semester: Semester, index: number) => `
            <div style="margin-bottom: 10px; padding: 10px; background: #ecf0f1; border-radius: 4px; ${index === 0 ? 'border: 2px solid #3498db;' : ''}">
              <strong>${semester.semesterName}</strong>: ${courseFee.currencyType} ${semester.semesterFee}
              ${index === 0 ? '<span style="color: #e74c3c; font-weight: bold; margin-left: 10px;">(First Semester)</span>' : ''}
              ${
                semester.semesterModules.length > 0
                  ? `
                <div style="margin-top: 5px; font-size: 14px;">
                  ${semester.semesterModules
                    .map(
                      (module: SemesterModule) => `
                    <div>${module.moduleName} - ${module.credits} credits (${courseFee.currencyType} ${module.moduleFee})</div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else {
      // Simple course fee without structure
      feeDetails = `
        <h4 style="color: #2c3e50; margin-bottom: 10px;">Course Fee</h4>
        <p><strong>Course Name:</strong> ${courseName}</p>
        <p><strong>Overall Course Fee:</strong> ${courseFee.currencyType} ${courseFee.overallCourseFee}</p>

        ${
          courseFee.tieredPricings.length > 0
            ? `
          <div style="margin-top: 15px;">
            <h5 style="color: #34495e; margin-bottom: 10px;">Available Pricing Tiers:</h5>
            ${courseFee.tieredPricings
              .map(
                (tier: TieredPricing) => `
              <div style="margin-bottom: 5px;">
                <strong>${tier.tierName}</strong>: ${courseFee.currencyType} ${tier.price}
                <small style="color: #7f8c8d;">(Valid: ${new Date(tier.startDate).toLocaleDateString()} - ${new Date(tier.endDate).toLocaleDateString()})</small>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      `;
    }

    // Add promotional information if applicable
    let promoInfo = '';
    if (courseFee.promoCodeStatus === 'ACTIVE') {
      promoInfo = `
        <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <strong>🎉 Promotional Offer Available!</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            Special pricing may be available. Please check your student portal for promotional codes.
          </p>
        </div>
      `;
    }

    let payNowButtons = '';
    if (courseFee?.overallCourseFee && paymentRecordId) {
      if (hasSemesterStructure) {
        // Calculate remaining amount for full payment if first semester is already paid
        let remainingForFullPayment = courseFee.overallCourseFee;
        if (firstSemesterPaid && !fullPaymentPaid) {
          const firstSemesterAmount =
            courseFee.courseFeeStructure?.semesters?.[0]?.semesterFee ?? 0;
          remainingForFullPayment =
            courseFee.overallCourseFee - firstSemesterAmount;
        }

        // Build payment options based on payment status
        let paymentOptionsHTML = '';

        // Show first semester payment option only if not already paid
        if (!firstSemesterPaid && !fullPaymentPaid && semesterPaymentSession) {
          paymentOptionsHTML += `
            <!-- First Semester Payment -->
            <div style="flex: 1; min-width: 250px; padding: 20px; background: #e8f4fd; border-radius: 8px; border: 2px solid #3498db; text-align: center;">
              <h5 style="color: #2980b9; margin-bottom: 10px;">Pay First Semester</h5>
              <p style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
                ${courseFee.currencyType} ${courseFee.courseFeeStructure?.semesters?.[0] ? courseFee.courseFeeStructure.semesters[0].semesterFee : 0}
              </p>
              <a
                href="${semesterPaymentSession?.url ?? '#'}"
                style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                target="_blank"
              >
                💳 Pay First Semester
              </a>
              <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                Secure your admission with first semester payment
              </p>
            </div>
          `;
        } else if (firstSemesterPaid) {
          // Show indicator that first semester is paid
          paymentOptionsHTML += `
            <!-- First Semester Already Paid -->
            <div style="flex: 1; min-width: 250px; padding: 20px; background: #d4edda; border-radius: 8px; border: 2px solid #28a745; text-align: center;">
              <h5 style="color: #155724; margin-bottom: 10px;">First Semester</h5>
              <p style="font-size: 18px; font-weight: bold; color: #155724; margin: 10px 0;">
                PAID
              </p>
              <p style="font-size: 12px; color: #155724; margin-top: 8px;">
                First semester payment completed
              </p>
            </div>
          `;
        }

        // Show full payment option only if not already paid
        if (!fullPaymentPaid && fullPaymentSession) {
          paymentOptionsHTML += `
            <!-- Full Payment -->
            <div style="flex: 1; min-width: 250px; padding: 20px; background: #e8f6f3; border-radius: 8px; border: 2px solid #27ae60; text-align: center;">
              <h5 style="color: #27ae60; margin-bottom: 10px;">Pay ${firstSemesterPaid ? 'Remaining' : 'Full'} Course Fee</h5>
              <p style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
                ${courseFee.currencyType} ${firstSemesterPaid ? remainingForFullPayment : courseFee.overallCourseFee}
              </p>
              <p style="font-size: 12px; color: #7f8c8d; margin: 5px 0;">
                <strong>${firstSemesterPaid ? 'Remaining balance after first semester' : 'Complete payment and get 5% discount'}</strong>
              </p>
              <a
                href="${fullPaymentSession.url}"
                style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                target="_blank"
              >
                💳 Pay ${firstSemesterPaid ? 'Remaining' : 'Full'} Amount
              </a>
              <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                ${firstSemesterPaid ? 'Complete your course payment' : 'Complete payment and get 5% discount'}
              </p>
            </div>
          `;
        } else if (fullPaymentPaid) {
          // Show indicator that full payment is paid
          paymentOptionsHTML += `
            <!-- Full Payment Already Paid -->
            <div style="flex: 1; min-width: 250px; padding: 20px; background: #d4edda; border-radius: 8px; border: 2px solid #28a745; text-align: center;">
              <h5 style="color: #155724; margin-bottom: 10px;">Full Course Fee</h5>
              <p style="font-size: 18px; font-weight: bold; color: #155724; margin: 10px 0;">
                PAID
              </p>
              <p style="font-size: 12px; color: #155724; margin-top: 8px;">
                Full course payment completed
              </p>
            </div>
          `;
        }

        // Only show payment options if there are unpaid amounts
        if (paymentOptionsHTML) {
          payNowButtons = `
            <div style="margin-top: 20px;">
              <h4 style="color: #2c3e50; text-align: center; margin-bottom: 15px;">Payment Status & Options</h4>

              <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                ${paymentOptionsHTML}
                ${
                  !hasAnyPayments
                    ? `
                  <!-- Manual Payment Option -->
                  <div style="flex: 1; min-width: 250px; padding: 20px; background: #ecf0f1; border-radius: 8px; border: 1px solid #bdc3c7; text-align: center;">
                    <h5 style="color: #2c3e50; margin-bottom: 10px;">Bank Transfer</h5>
                    <p style="font-size: 14px; color: #7f8c8d; margin: 10px 0;">
                      Pay via bank transfer
                    </p>
                    <a
                      href="${MANUAL_PAYMENT_URL}/manual-payment/${applicationId}?amount=${courseFee.overallCourseFee}&currency=${courseFee.currencyType}&semester=${courseFee.courseFeeStructure?.semesters?.[0]?.semesterFee ?? 0}"
                      style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                      target="_blank"
                    >
                      💳 Manual Payment
                    </a>
                  </div>
                `
                    : ''
                }
              </div>

              <p style="font-size: 12px; color: #7f8c8d; margin-top: 15px; text-align: center;">
                Payment Reference: ${paymentRecordId}
              </p>
            </div>
          `;
        } else {
          // All payments completed
          payNowButtons = `
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #27ae60; font-weight: bold; font-size: 16px;">
                🎉 All payments completed! Thank you for your payment.
              </p>
              <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                Payment Reference: ${paymentRecordId}
              </p>
            </div>
          `;
        }
      } else {
        // Show only full payment for non-structured courses
        if (!fullPaymentPaid && fullPaymentSession) {
          payNowButtons = `
            <div style="margin-top: 20px;">
              <h4 style="color: #2c3e50; text-align: center; margin-bottom: 15px;">Payment Options</h4>
              <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <!-- Full Payment -->
                <div style="flex: 1; min-width: 250px; padding: 20px; background: #e8f6f3; border-radius: 8px; border: 2px solid #27ae60; text-align: center;">
                  <h5 style="color: #27ae60; margin-bottom: 10px;">Pay Full Course Fee</h5>
                  <p style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
                    ${courseFee.currencyType} ${courseFee.overallCourseFee}
                  </p>
                  <a
                    href="${fullPaymentSession.url}"
                    style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                    target="_blank"
                  >
                    💳 Pay Full Amount
                  </a>
                  <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                    Complete payment and get 5% discount
                  </p>
                </div>
                ${
                  !hasAnyPayments
                    ? `
                  <!-- Manual Payment Option -->
                  <div style="flex: 1; min-width: 250px; padding: 20px; background: #ecf0f1; border-radius: 8px; border: 1px solid #bdc3c7; text-align: center;">
                    <h5 style="color: #2c3e50; margin-bottom: 10px;">Bank Transfer</h5>
                    <p style="font-size: 14px; color: #7f8c8d; margin: 10px 0;">
                      Pay via bank transfer
                    </p>
                    <a
                      href="${backUrl}/manual-payment/${applicationId}?amount=${courseFee.overallCourseFee}&currency=${courseFee.currencyType}"
                      style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                      target="_blank"
                    >
                      💳 Manual Payment
                    </a>
                  </div>
                `
                    : ''
                }
              </div>
              <p style="font-size: 12px; color: #7f8c8d; margin-top: 15px; text-align: center;">
                Payment Reference: ${paymentRecordId}
              </p>
            </div>
          `;
        } else if (fullPaymentPaid) {
          payNowButtons = `
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #27ae60; font-weight: bold; font-size: 16px;">
                🎉 Payment completed! Thank you for your payment.
              </p>
              <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                Payment Reference: ${paymentRecordId}
              </p>
            </div>
          `;
        }
      }
    } else if (courseFee?.overallCourseFee) {
      payNowButtons = `
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #e74c3c; font-style: italic;">
            Payment instructions will be provided separately. Please contact admissions for payment details.
          </p>
        </div>
      `;
    }

    return `
      <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
        <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Course Fee & Payment Information</h3>
        ${feeDetails}
        ${promoInfo}
        ${payNowButtons}
        <div style="margin-top: 15px; padding: 10px; background: #e8f4fd; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #2980b9;">
            <strong>Payment Instructions:</strong><br/>
            • Choose your preferred payment option above<br/>
            • You can pay using credit/debit card or other available methods<br/>
            • Payment must be completed within 30 days to secure your admission<br/>
            • For payment issues, contact admissions@youracademy.com
          </p>
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">
          <em>Note: Fees are subject to change. Please refer to your student portal for the most up-to-date information.</em>
        </p>
      </div>
    `;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return `
      <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
        <h3 style="margin-top: 0; color: #721c24;">Payment Information</h3>
        <p style="margin: 0; color: #721c24;">
          We are currently experiencing issues with our payment system. Please contact admissions for payment instructions.
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
          Error: ${errorMessage}
        </p>
      </div>
    `;
  }
}

// type Outcome = 'pass' | 'fail' | 'canceled' | 'rescheduled';
//
// const buildFallbackHtml = (
//   fullName: string,
//   outcome: Outcome,
//   interview?: Interview
// ): string => {
//   const normalizedOutcome = outcome?.toLowerCase() as Outcome;
//
//   const statusColorMap: Record<Outcome, string> = {
//     pass: '#16a34a',
//     fail: '#dc2626',
//     rescheduled: '#f59e0b',
//     canceled: '#2563eb',
//   };
//
//   const statusColor = statusColorMap[normalizedOutcome] ?? '#6b7280';
//
//   const formatDate = (date?: Date | string): string =>
//     date
//       ? new Intl.DateTimeFormat('en-BD', {
//           timeZone: 'Asia/Dhaka',
//           dateStyle: 'medium',
//         }).format(new Date(date))
//       : '-';
//
//   const formatTime = (date?: Date | string): string =>
//     date
//       ? new Intl.DateTimeFormat('en-BD', {
//           timeZone: 'Asia/Dhaka',
//           hour: '2-digit',
//           minute: '2-digit',
//         }).format(new Date(date))
//       : '-';
//
//   const link = interview?.interviewLink?.trim();
//
//   return `
//   <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
//
//       <h2>Hi ${fullName},</h2>
//
//       <p style="font-size: 15px; color: #374151;">
//         Your interview status is:
//         <span style="color:${statusColor}; font-weight:600;">
//           ${normalizedOutcome}
//         </span>
//       </p>
//
//       ${
//         normalizedOutcome === 'rescheduled'
//           ? `
//         <div style="background:#fffbeb; padding:10px; border-radius:8px; color:#92400e; margin-top:10px;">
//           Your interview has been rescheduled. Please check updated details below.
//         </div>
//       `
//           : ''
//       }
//
//       ${
//         interview
//           ? `
//         <div style="margin-top:20px; padding:16px; background:#f3f4f6; border-radius:10px;">
//
//           <h3>Interview Details</h3>
//
//           <p><strong>Title:</strong> ${interview.title}</p>
//           <p><strong>Date:</strong> ${formatDate(interview.interviewDate)}</p>
//           <p><strong>Time:</strong> ${formatTime(
//             interview.startTime
//           )} - ${formatTime(interview.endTime)}</p>
//           <p><strong>Platform:</strong> ${interview.platform}</p>
//
//           ${
//             link
//               ? `
//             <div style="margin-top:15px;">
//               <a href="${link}"
//                  style="display:inline-block; background:#4f46e5; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">
//                 Join Interview
//               </a>
//             </div>
//           `
//               : `
//             <p style="margin-top:15px; background:#fef3c7; padding:10px; border-radius:8px; color:#92400e;">
//               ⚠️ Meeting link will be shared soon before the interview.
//             </p>
//           `
//           }
//
//         </div>
//       `
//           : ''
//       }
//
//       <p style="margin-top:24px; font-size:14px; color:#6b7280;">
//         Best regards,<br/>
//         <strong>Your Team</strong>
//       </p>
//
//     </div>
//   </div>
//   `;
// };
//
// export const sendInterviewOutcomeEmail = async (
//   fullName: string,
//   email: string,
//   outcome: Outcome,
//   interview: Interview | undefined
// ): Promise<{ success: boolean; message: string }> => {
//   const year = new Date().getFullYear();
//
//   // Normalize outcome value to lowercase for consistent mapping
//   const normalizedOutcome = outcome?.toLowerCase();
//
//   // Map outcome to corresponding email template type
//   const emailTypeMap: Record<string, EmailType> = {
//     pass: EmailType.APPLICANT_INTERVIEW_PASSED,
//     fail: EmailType.APPLICANT_INTERVIEW_FAILED,
//     canceled: EmailType.APPLICANT_INTERVIEW_CANCELED,
//     rescheduled: EmailType.APPLICANT_INTERVIEW_RESCHEDULED,
//   };
//
//   const emailType =
//     emailTypeMap[normalizedOutcome] ?? EmailType.APPLICANT_INTERVIEW_FAILED;
//
//   // Prepare template data passed to renderTemplate function
//   const templateData = {
//     fullName,
//     year,
//     ...interview,
//   };
//
//   // Render HTML template based on email type and data
//   const template = await renderTemplate(emailType, templateData, {
//     // optionalFields: ['interviewLink'],
//   });
//
//   // Fallback HTML in case template is missing or fails
//   const emailBody =
//     template.body ?? buildFallbackHtml(fullName, outcome, interview);
//
//   // Subject mapping based on interview outcome
//   const subjectMap: Record<string, string> = {
//     pass: '🎉 Interview Passed',
//     fail: 'Interview Result',
//     canceled: 'Interview Canceled',
//     rescheduled: 'Interview Rescheduled',
//   };
//
//   const subject =
//     template.subject ?? subjectMap[normalizedOutcome] ?? 'Interview Update';
//
//   const mailOptions = {
//     from: env.EMAIL_USER,
//     to: [email, ...(interview?.guests ?? [])],
//     subject,
//     html: emailBody,
//   };
//
//   try {
//     // Send email using transporter
//     await transporter.sendMail(mailOptions);
//
//     // Log successful email delivery
//     await logEmailNotification(
//       emailType,
//       email,
//       `Interview email sent: ${outcome}`
//     );
//
//     return {
//       success: true,
//       message: 'Interview email sent successfully',
//     };
//   } catch (error) {
//     console.error('Email send error:', error);
//
//     // Log failed email attempt
//     await logEmailNotification(
//       emailType,
//       email,
//       `Failed to send interview email: ${outcome}`,
//       'FAILED'
//     );
//
//     throw new AppError(
//       'Failed to send interview email',
//       'EMAIL_SEND_FAILED',
//       500
//     );
//   }
// };

export const sendApprovalEmailToApplicant = async (
  body: ISendApprovalEmailInput
): Promise<{ success: boolean; message: string }> => {
  const {
    applicationEmail,
    applicantName,
    approvalUrl,
    rejectionUrl,
    companyName,
  } = body;

  const htmlContent = `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f4f6f8;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="padding:25px; text-align:center; background:linear-gradient(135deg,#0f172a,#1e293b); color:#fff;">
                <h2 style="margin:0;">Application Decision Required</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333;">
                <p style="margin:0 0 15px;">Dear ${applicantName},</p>

                <p style="margin:0 0 20px;">
                  Your application has been reviewed. Please choose one of the options below to proceed.
                </p>

                <!-- Buttons -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:20px 0;">

                      <!-- APPROVE BUTTON -->
                      <a href="${approvalUrl}"
                         style="display:inline-block; padding:12px 24px; margin-right:10px;
                                background:#16a34a; color:#ffffff; text-decoration:none;
                                border-radius:6px; font-weight:bold;">
                        Accept Offer
                      </a>

                      <!-- REJECT BUTTON -->
                      <a href="${rejectionUrl}"
                         style="display:inline-block; padding:12px 24px;
                                background:#dc2626; color:#ffffff; text-decoration:none;
                                border-radius:6px; font-weight:bold;">
                        Reject Offer
                      </a>

                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0; font-size:14px; color:#555;">
                  ⚠️ This link will expire in <strong>72 hours</strong>. If no action is taken, the offer will no longer be valid.
                </p>

                <p style="margin:20px 0;">
                  If you have any questions, feel free to contact us.
                </p>

                <p style="margin:0;">
                  Best regards,<br/>
                  <strong>${companyName ?? 'EducateU'}</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:15px; text-align:center; font-size:12px; color:#888;">
                © ${new Date().getFullYear()} ${companyName ?? 'EducateU'}. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const mailOptions: SendMailOptions = {
    from: process.env['EMAIL_USER'],
    to: applicationEmail,
    subject: 'Application Decision Required',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);

  // Log success
  await logEmailNotification(
    'APPLICATION_DECISION_REQUEST_EMAIL',
    applicationEmail,
    `Application decision email sent`
  );

  return {
    success: true,
    message: 'Application decision email sent successfully',
  };
};
