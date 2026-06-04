import { Router } from "express";
import { AgentSettingController } from "./controllers";
import { asyncWrapper } from "../../../utils/asyncWrapper";

export const agentSettingRoutes = Router();

// AgentSetting
agentSettingRoutes.post(
  "/commission/groups",
  asyncWrapper(AgentSettingController.createCoimmissionGroup)
);
agentSettingRoutes.post(
  "/commission/download",
  asyncWrapper(AgentSettingController.downloadCommissionGroups)
);
agentSettingRoutes.get(
  "/commission/groups",
  asyncWrapper(AgentSettingController.getCommissionGroups)
);
agentSettingRoutes.patch(
  "/commission/groups/:id/",
  asyncWrapper(AgentSettingController.updateCommissionGroup)
);
agentSettingRoutes.post(
  "/commission/groups/commissions",
  asyncWrapper(AgentSettingController.createCommissions)
);
agentSettingRoutes.get(
  "/commission/groups/:id",
  asyncWrapper(AgentSettingController.getCommissionGroupById)
);

agentSettingRoutes.delete(
  "/commission/groups/:commissionId",
  asyncWrapper(AgentSettingController.deleteCommission)
);

agentSettingRoutes.post(
  "/agreement",
  asyncWrapper(AgentSettingController.createTemplate)
);

agentSettingRoutes.get(
  "/agreement",
  asyncWrapper(AgentSettingController.getLatestTemplates)
);

agentSettingRoutes.get(
  "/agreement/:id",
  asyncWrapper(AgentSettingController.getTemplateInfo)
);
agentSettingRoutes.patch(
  "/agreement/:id",
  asyncWrapper(AgentSettingController.updateTemplate)
);
agentSettingRoutes.get(
  "/agreement/history/:matchId",
  asyncWrapper(AgentSettingController.getAgreementsByMatchId)
);

agentSettingRoutes.get(
  "/agreement/:id/pdf",

  asyncWrapper(AgentSettingController.getAgreementPdf)
);

agentSettingRoutes.get(
  "/commission/userlist/:id",
  asyncWrapper(AgentSettingController.getUsersByCommissionGroupHandler)
);

agentSettingRoutes.get(
  "/agreement/users/:id",
  asyncWrapper(AgentSettingController.getUserSpecificAgreementPdf)
);

// expiry reminder
agentSettingRoutes.get(
  "/expiry-reminder",
  asyncWrapper(AgentSettingController.getExpiryRemainder)
);
agentSettingRoutes.post(
  "/expiry-reminder",
  asyncWrapper(AgentSettingController.createExpiryRemainder)
);

// global settings
agentSettingRoutes.post(
  "/global/setting",
  asyncWrapper(AgentSettingController.createGlobalSetting)
);
agentSettingRoutes.get(
  "/global/setting",
  asyncWrapper(AgentSettingController.getGlobalSetting)
);

agentSettingRoutes.get(
  "/awarding-bodies-templates/:id",
  asyncWrapper(AgentSettingController.getAwardingBodiesWithTemplates)
);
agentSettingRoutes.get(
  "/awarding-bodies-templates/",
  asyncWrapper(AgentSettingController.getTypeWiseAwardingBodies)
);
