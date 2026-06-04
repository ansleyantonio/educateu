import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userDetails = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      agentUser: true,
      facultyUser: true,
      userPortalCategories: {
        select: {
          portalCategory: {
            select: { name: true },
          },
          userPortalCategoryRoles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  const portalRoles =
    user?.userPortalCategories.map((upc) => ({
      portalName: upc.portalCategory.name,
      roleNames: upc.userPortalCategoryRoles.map((upr) => upr.role.name),
    })) || [];

  const resolvedUsername =
    user?.username || user?.agentUser || user?.facultyUser || "unknown";

  return {
    username: resolvedUsername,
    portalNames:
      user?.userPortalCategories.map((p) => p.portalCategory.name) || [],
    roleNames: portalRoles.flatMap((pr) => pr.roleNames),
  };
};
export default userDetails;
