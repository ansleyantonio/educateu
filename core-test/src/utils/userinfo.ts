import prisma from "../prismaClient";
import type { Prisma } from "@prisma/client";

// Define the return type of the user query
type UserWithPortalInfo = Prisma.UserGetPayload<{
  select: {
    username: true;
    agentUser: true;
    facultyUser: true;
    userPortalCategories: {
      select: {
        portalCategory: {
          select: { name: true };
        };
        userPortalCategoryRoles: {
          select: {
            role: {
              select: { name: true };
            };
          };
        };
      };
    };
  };
}>;

const userDetails = async (userId: string) => {
  const user: UserWithPortalInfo | null = await prisma.user.findUnique({
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
    user?.userPortalCategories.map((upc: UserWithPortalInfo["userPortalCategories"][number]) => ({
      portalName: upc.portalCategory.name,
      roleNames: upc.userPortalCategoryRoles.map((upr: (typeof upc.userPortalCategoryRoles)[number]) => upr.role.name),
    })) || [];

  const resolvedUsername = user?.username || user?.agentUser || user?.facultyUser || "unknown";

  return {
    username: resolvedUsername,
    portalNames:
      user?.userPortalCategories.map(
        (p: UserWithPortalInfo["userPortalCategories"][number]) => p.portalCategory.name,
      ) || [],
    roleNames: portalRoles.flatMap((pr: { portalName: string; roleNames: string[] }) => pr.roleNames),
  };
};

/**
 * Get user's full name from userPortalCategoryRoleId
 * @param userPortalCategoryRoleId - The ID of the user portal category role
 * @returns Object containing firstName and lastName
 */
const getUserNameFromUserPortalCategoryRoleId = async (userPortalCategoryRoleId: string) => {
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findUnique({
    where: { id: userPortalCategoryRoleId },
    include: {
      userPortalCategory: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!userPortalCategoryRole) {
    return {
      firstName: "Unknown",
      lastName: "User",
    };
  }

  return {
    firstName: userPortalCategoryRole.userPortalCategory.user.firstName || "Unknown",
    lastName: userPortalCategoryRole.userPortalCategory.user.lastName || "User",
  };
};

export default userDetails;
export { getUserNameFromUserPortalCategoryRoleId };
