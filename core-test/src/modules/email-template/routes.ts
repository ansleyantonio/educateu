import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { EmailTemplateController } from "./controllers";

export const emailTemplateRouter = Router();

emailTemplateRouter.post("/", asyncWrapper(EmailTemplateController.createEmailTemplate));
emailTemplateRouter.get("/", asyncWrapper(EmailTemplateController.getEmailTemplatesByType));
emailTemplateRouter.get("/preview", asyncWrapper(EmailTemplateController.getPreviewEmailTemplatesByType));

emailTemplateRouter.get("/variable", asyncWrapper(EmailTemplateController.getEmailTemplateVariable));
