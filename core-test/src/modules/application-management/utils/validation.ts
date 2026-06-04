// import prisma from "../../../prismaClient";
// import { ReqUser, UserPortalCategoryRole } from "../../../types";
import { UserPortalCategoryRole } from "../../../types";
import { zodSafeParse } from "../../../utils/zodUtils";
import { agentGetApplicationsReqQuerySchema } from "../types";

const validateReqQueryBasedOnUserRole = async (query: unknown, user: UserPortalCategoryRole) => {
  let parsedQuery;

  if (user.role.name === "agent") {
    parsedQuery = zodSafeParse(query, agentGetApplicationsReqQuerySchema);
  }

  return parsedQuery;
};

export const ValidatingUtils = {
  validateReqQueryBasedOnUserRole,
};
