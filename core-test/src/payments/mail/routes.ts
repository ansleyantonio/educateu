// routes/applicationDecision.ts
import { Router } from "express";
import { sendApplicationOutcomeEmail } from "../../modules/student-management/mail/courseFeeEmail";
import { send } from "process";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { asyncWrapper } from "../../utils/asyncWrapper";
import {
  getUserIdFromApplication,
  sendApplicationOutcomeNotification,
  sendRealTimeData,
  sendStripeApplicationOutcomeNotification,
} from "../../utils/notificationService";
import prisma from "../../prismaClient";

const decisionRouter = Router();

decisionRouter.get(
  "/applicant/:applicationId/decision",
  asyncWrapper(async (req, res) => {
    const { applicationId } = req.params;
    const { outcome } = req.query;

    // await sendApplicationOutcomeEmail(applicationId, outcome as string);
    // sendApplicationOutcomeNotification({ applicationId, outcome: outcome as string });
    const existApplicationOutcomeStatus = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        outcomeStatus: true,
      },
    });

    if (existApplicationOutcomeStatus?.outcomeStatus) {
      const alreadySentHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Outcome Already Sent</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 20px;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .info-icon {
                  color: #ffc107;
                  font-size: 48px;
                  text-align: center;
                  margin-bottom: 20px;
              }
              h1 {
                  color: #333;
                  text-align: center;
                  margin-bottom: 20px;
              }
              .message {
                  background-color: #fff3cd;
                  padding: 15px;
                  border-radius: 5px;
                  border-left: 4px solid #ffc107;
                  margin-bottom: 20px;
              }
              .details {
                  background-color: #e9ecef;
                  padding: 15px;
                  border-radius: 5px;
                  margin-bottom: 20px;
              }
              .detail-item {
                  margin-bottom: 8px;
              }
              .detail-label {
                  font-weight: bold;
                  color: #495057;
              }
              .detail-value {
                  color: #6c757d;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="info-icon">!</div>
              <h1>Application Outcome Already Sent</h1>
              
              <div class="message">
                  <p><strong>Notice:</strong> The application outcome email has already been sent for this application.</p>
              </div>

              <div class="details">
                  <div class="detail-item">
                      <span class="detail-label">Application ID:</span>
                      <span class="detail-value">${applicationId}</span>
                  </div>
              </div>
          </div>
      </body>
      </html>
      `;
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(alreadySentHtml);
      return;
    }

    await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        outcomeStatus: true,
      },
    });

    sendStripeApplicationOutcomeNotification({ applicationId, outcome: outcome as string });
    const applicantUserId = await getUserIdFromApplication(applicationId);

    sendRealTimeData({
      userIds: [...applicantUserId].filter(Boolean) as string[],
      title: "Application Outcome Notification",
      message: `The outcome for application ${applicationId} has been set to ${outcome}.`,
    });

    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Outcome Email Sent</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 20px;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .success-icon {
                  color: #28a745;
                  font-size: 48px;
                  text-align: center;
                  margin-bottom: 20px;
              }
              h1 {
                  color: #333;
                  text-align: center;
                  margin-bottom: 20px;
              }
              .message {
                  background-color: #f8f9fa;
                  padding: 15px;
                  border-radius: 5px;
                  border-left: 4px solid #28a745;
                  margin-bottom: 20px;
              }
              .details {
                  background-color: #e9ecef;
                  padding: 15px;
                  border-radius: 5px;
                  margin-bottom: 20px;
              }
              .detail-item {
                  margin-bottom: 8px;
              }
              .detail-label {
                  font-weight: bold;
                  color: #495057;
              }
              .detail-value {
                  color: #6c757d;
              }
              .timestamp {
                  text-align: center;
                  color: #6c757d;
                  font-size: 14px;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="success-icon">✓</div>
              <h1>Application Outcome Email Sent Successfully</h1>
              
              <div class="message">
                  <p><strong>Status:</strong> The application outcome email has been successfully sent to the applicant.</p>
              </div>

              <div class="details">
                  <div class="detail-item">
                      <span class="detail-label">Application ID:</span>
                      <span class="detail-value">${applicationId}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">Outcome:</span>
                      <span class="detail-value">${outcome}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">Email Service:</span>
                      <span class="detail-value">Application Outcome Notification</span>
                  </div>
              </div>

              <div class="timestamp">
                  Sent on: ${new Date().toLocaleString()}
              </div>
          </div>
      </body>
      </html>
    `;

    // Set content type to HTML
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(htmlResponse);
  }),
);

export default decisionRouter;
