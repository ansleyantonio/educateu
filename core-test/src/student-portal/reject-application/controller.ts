import { Request, Response } from "express";
import { RejectApplicationServices } from "./services";

const rejectedApplicationController = async (req: Request, res: Response): Promise<void> => {
  const { applicationsId } = req.params;

  const result = await RejectApplicationServices.rejectedApplicationServices(applicationsId);

  const { statusCode, status, applicantId } = result;

  const pages: Record<string, string> = {
    SUCCESS: `
      <html>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#f4f7fb;">
          <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:12px;">
            <h1 style="color:#dc2626;">Application Rejected</h1>
            <p>Application <b>${applicantId}</b> has been successfully rejected.</p>
            <p>Status: ${status}</p>
          </div>
        </body>
      </html>
    `,

    ALREADY_REJECTED: `
      <html>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#fff7ed;">
          <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:12px;">
            <h1 style="color:#f59e0b;">Already Rejected</h1>
            <p>This application was already rejected earlier.</p>
            <p><b>ID:</b> ${applicantId}</p>
            <p>Status: ${status}</p>
          </div>
        </body>
      </html>
    `,

    EXPIRED: `
      <html>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#fef2f2;">
          <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:12px;">
            <h1 style="color:#ef4444;">Link Expired</h1>
            <p>This rejection link is no longer valid (expired after 72 hours).</p>
            <p><b>ID:</b> ${applicantId}</p>
          </div>
        </body>
      </html>
    `,

    NOT_FOUND: `
      <html>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#f3f4f6;">
          <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:12px;">
            <h1 style="color:#6b7280;">Application Not Found</h1>
            <p>No application exists or it is already approved.</p>
            <p><b>ID:</b> ${applicantId}</p>
          </div>
        </body>
      </html>
    `,
  };

  const html = pages[statusCode ?? "NOT_FOUND"] ?? pages.NOT_FOUND;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};

// const rejectedApplicationController = async (req: Request, res: Response): Promise<void> => {
//   const { applicationsId } = req.params;
//
//   const result = await RejectApplicationServices.rejectedApplicationServices(applicationsId);
//
//   sendSuccessResponse(res, result, "Application Rejected");
// };

export const RejectApplicationController = {
  rejectedApplicationController,
};
