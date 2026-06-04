import prisma from "../../../prismaClient";
import { AppError } from "../../../utils/AppError";
import { transporter } from "./config";
import nodemailer from "nodemailer";

export const sendStripeApplicationOutcomeEmail = async (applicationId: string, outcome: string) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        personalInformation: true,
        courseSelection: {
          include: {
            course: {
              include: {
                course: true,
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
                    status: "ACTIVE",
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
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
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    const user = application?.userPortalCategoryRoleApplications?.[0]?.userPortalCategoryRole?.userPortalCategory?.user;
    const senderEmail = user?.email || user?.agentEmail || user?.facultyEmail;
    const applicantName =
      `${application.personalInformation?.firstName ?? ""} ${application.personalInformation?.lastName ?? ""}`.trim();
    const applicationRef = application.applicationId || application.id;

    // Get course fee information
    const courseName = application.courseSelection?.course?.course?.title || undefined;
    const courseFee = application.courseSelection?.course?.courseFees?.[0];

    // ✅ CREATE PAYMENT RECORD FOR APPROVED APPLICATIONS
    let paymentRecord = null;
    if ((outcome === "APPROVED_UNCONDITIONAL" || outcome === "APPROVED_CONDITIONAL") && courseFee) {
      paymentRecord = await createPaymentRecord(application, courseFee);

      // Update application outcome
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          outcome: outcome as any,
          status: "APPROVED" as any,
        },
      });
    }

    const courseFeeHtml = await generateCourseFeeHtml(
      courseFee || null,
      applicationId,
      courseName || "N/A",
      paymentRecord?.id,
    );

    // Outcome-specific email configurations
    const emailConfigs = {
      APPROVED_UNCONDITIONAL: {
        subject: `Congratulations! Your Application ${applicationRef} has been Approved`,
        color: "#27ae60",
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
        color: "#f39c12",
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
        color: "#c0392b",
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

    const config = emailConfigs[outcome as keyof typeof emailConfigs] || {
      subject: `Update on Your Application ${applicationRef}`,
      color: "#3498db",
      header: `Dear ${applicantName},`,
      content: `
        <p style="font-size: 16px; line-height: 1.6;">
          Your application status has been updated to: <strong>${outcome}</strong>.
        </p>
        ${courseFeeHtml}
      `,
    };

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
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

    return {
      emailSent: true,
      messageId: emailResult.messageId,
      paymentRecord: paymentRecord,
    };
  } catch (error: any) {
    console.error("Error in sendApplicationOutcomeEmail:", error);

    throw new AppError(`Failed to send outcome email: ${error.message}`, "EMAIL_SEND_ERROR", 500);
  }
};

// ✅ CREATE PAYMENT RECORD FUNCTION
async function createPaymentRecord(application: any, courseFee: any) {
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
        paymentPlan: "FULL_PAYMENT",
        paymentStatus: "PENDING",
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
        paymentMethod: "ONLINE",
        status: "PENDING",
        paymentDate: new Date(),
        notes: "Payment record created - awaiting payment",
      },
    });

    return paymentRecord;
  } catch (error: any) {
    console.error("Error creating payment record:", error);
    throw new AppError("Failed to create payment record", "PAYMENT_ERROR", 500);
  }
}

// ✅ UPDATED GENERATE COURSE FEE HTML FUNCTION
// ✅ UPDATED GENERATE COURSE FEE HTML FUNCTION WITH PAYMENT OPTIONS
async function generateCourseFeeHtml(
  courseFee: any,
  applicationId: string,
  courseName: string,
  paymentRecordId?: string,
): Promise<string> {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

  if (courseFee.courseFeeStructure && courseFee.courseFeeStructure.semesters.length > 0) {
    hasSemesterStructure = true;
    firstSemesterFee = Math.round(courseFee.courseFeeStructure.semesters[0].semesterFee * 100);
  }

  try {
    // Create Stripe Product for Full Payment
    const fullPaymentProduct = await stripe.products.create({
      name: `${courseName} - Full Course Fee`,
      description: `Full course fee payment for ${courseName}`,
      metadata: {
        applicationId: applicationId,
        courseName: courseName,
        paymentType: "FULL_PAYMENT",
      },
    });

    // Create Stripe Price for Full Payment
    const fullPaymentPrice = await stripe.prices.create({
      product: fullPaymentProduct.id,
      currency: courseFee.currencyType.toLowerCase(),
      unit_amount: fullAmount,
    });

    // Create Payment Link for Full Payment
    const fullPaymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: fullPaymentPrice.id,
          quantity: 1,
        },
      ],
      metadata: {
        applicationId: applicationId,
        paymentRecordId: paymentRecordId || "",
        courseName: courseName,
        type: "FULL_COURSE_FEE",
        amount: courseFee.overallCourseFee,
        paymentType: "FULL",
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=full`,
        },
      },
      custom_fields: [
        {
          key: "student_name",
          label: {
            type: "custom",
            custom: "Full Name",
          },
          type: "text",
          optional: false,
        },
      ],
    });

    let semesterPaymentLink = null;

    // Create First Semester Payment Link if available
    if (hasSemesterStructure && firstSemesterFee > 0) {
      const firstSemesterProduct = await stripe.products.create({
        name: `${courseName} - First Semester Fee`,
        description: `First semester fee payment for ${courseName}`,
        metadata: {
          applicationId: applicationId,
          courseName: courseName,
          paymentType: "FIRST_SEMESTER",
        },
      });

      const firstSemesterPrice = await stripe.prices.create({
        product: firstSemesterProduct.id,
        currency: courseFee.currencyType.toLowerCase(),
        unit_amount: firstSemesterFee,
      });

      semesterPaymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: firstSemesterPrice.id,
            quantity: 1,
          },
        ],
        metadata: {
          applicationId: applicationId,
          paymentRecordId: paymentRecordId || "",
          courseName: courseName,
          type: "FIRST_SEMESTER_FEE",
          amount: courseFee.courseFeeStructure.semesters[0].semesterFee,
          paymentType: "SEMESTER",
          semesterName: courseFee.courseFeeStructure.semesters[0].semesterName,
        },
        after_completion: {
          type: "redirect",
          redirect: {
            url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=semester`,
          },
        },
        custom_fields: [
          {
            key: "student_name",
            label: {
              type: "custom",
              custom: "Full Name",
            },
            type: "text",
            optional: false,
          },
        ],
      });
    }

    let feeDetails = "";

    // Check if it's a structured course (with semesters)
    if (courseFee.courseFeeStructure) {
      const structure = courseFee.courseFeeStructure;
      feeDetails = `
        <h4 style="color: #2c3e50; margin-bottom: 10px;">Course Fee Structure</h4>
        <p><strong>Course Name:</strong> ${courseName}</p>
        <p><strong>Total Semesters:</strong> ${structure.totalSemesters}</p>
        <p><strong>Total Credits:</strong> ${structure.totalCredits || "N/A"}</p>
        <p><strong>Overall Course Fee:</strong> ${courseFee.currencyType} ${courseFee.overallCourseFee}</p>
        
        <div style="margin-top: 15px;">
          <h5 style="color: #34495e; margin-bottom: 10px;">Semester Breakdown:</h5>
          ${structure.semesters
            .map(
              (semester: any, index: number) => `
            <div style="margin-bottom: 10px; padding: 10px; background: #ecf0f1; border-radius: 4px; ${index === 0 ? "border: 2px solid #3498db;" : ""}">
              <strong>${semester.semesterName}</strong>: ${courseFee.currencyType} ${semester.semesterFee}
              ${index === 0 ? '<span style="color: #e74c3c; font-weight: bold; margin-left: 10px;">(First Semester)</span>' : ""}
              ${
                semester.semesterModules.length > 0
                  ? `
                <div style="margin-top: 5px; font-size: 14px;">
                  ${semester.semesterModules
                    .map(
                      (module: any) => `
                    <div>${module.moduleName} - ${module.credits} credits (${courseFee.currencyType} ${module.moduleFee})</div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `,
            )
            .join("")}
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
                (tier: any) => `
              <div style="margin-bottom: 5px;">
                <strong>${tier.tierName}</strong>: ${courseFee.currencyType} ${tier.price}
                <small style="color: #7f8c8d;">(Valid: ${new Date(tier.startDate).toLocaleDateString()} - ${new Date(tier.endDate).toLocaleDateString()})</small>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      `;
    }

    // Add promotional information if applicable
    let promoInfo = "";
    if (courseFee.promoCodeStatus === "ACTIVE") {
      promoInfo = `
        <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <strong>🎉 Promotional Offer Available!</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            Special pricing may be available. Please check your student portal for promotional codes.
          </p>
        </div>
      `;
    }

    let payNowButtons = "";
    if (courseFee && courseFee.overallCourseFee && paymentRecordId) {
      if (hasSemesterStructure && semesterPaymentLink) {
        // Show both payment options for structured courses
        payNowButtons = `
          <div style="margin-top: 20px;">
            <h4 style="color: #2c3e50; text-align: center; margin-bottom: 15px;">Choose Your Payment Option</h4>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
              <!-- First Semester Payment -->
              <div style="flex: 1; min-width: 250px; padding: 20px; background: #e8f4fd; border-radius: 8px; border: 2px solid #3498db; text-align: center;">
                <h5 style="color: #2980b9; margin-bottom: 10px;">Pay First Semester</h5>
                <p style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
                  ${courseFee.currencyType} ${courseFee.courseFeeStructure.semesters[0].semesterFee}
                </p>
                <a 
                  href="${semesterPaymentLink.url}" 
                  style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                  target="_blank"
                >
                  💳 Pay First Semester
                </a>
                <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                  Secure your admission with first semester payment
                </p>
              </div>
              
              <!-- Full Payment -->
              <div style="flex: 1; min-width: 250px; padding: 20px; background: #e8f6f3; border-radius: 8px; border: 2px solid #27ae60; text-align: center;">
                <h5 style="color: #27ae60; margin-bottom: 10px;">Pay Full Course Fee</h5>
                <p style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
                  ${courseFee.currencyType} ${courseFee.overallCourseFee}
                </p>
                <p style="font-size: 12px; color: #7f8c8d; margin: 5px 0;">
                  <strong>Save time with one-time payment</strong>
                </p>
                <a 
                  href="${fullPaymentLink.url}" 
                  style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px;"
                  target="_blank"
                >
                  💳 Pay Full Amount
                </a>
                <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
                  Complete payment and get 5% discount
                </p>
              </div>
            </div>
            
            <p style="font-size: 12px; color: #7f8c8d; margin-top: 15px; text-align: center;">
              Payment Reference: ${paymentRecordId}
            </p>
          </div>
        `;
      } else {
        // Show only full payment for non-structured courses
        payNowButtons = `
          <div style="margin-top: 20px; text-align: center;">
            <a 
              href="${fullPaymentLink.url}" 
              style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;"
              target="_blank"
            >
              💳 Pay Course Fee Now - ${courseFee.currencyType} ${courseFee.overallCourseFee}
            </a>
            <p style="font-size: 12px; color: #7f8c8d; margin-top: 8px;">
              Payment Reference: ${paymentRecordId}
            </p>
            <p style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
              You will be redirected to our secure payment portal
            </p>
          </div>
        `;
      }
    } else if (courseFee && courseFee.overallCourseFee) {
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
  } catch (error: any) {
    console.error("Error generating course fee HTML:", error);

    return `
      <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
        <h3 style="margin-top: 0; color: #721c24;">Payment Information</h3>
        <p style="margin: 0; color: #721c24;">
          We are currently experiencing issues with our payment system. Please contact admissions for payment instructions.
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
          Error: ${error.message}
        </p>
      </div>
    `;
  }
}
