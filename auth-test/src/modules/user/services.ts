import prisma from "../../prismaClient";

const getUserAssignableRoles = async (userId: string) => {
  console.log(userId);
  const portalCategories = await prisma.portalCategory.findMany({
    include: {
      roles: true,
    },
  });

  if (portalCategories.length === 0) {
    throw new Error("Portal categories not found");
  }

  const userPortalCategories = await prisma.userPortalCategory.findMany({
    where: {
      userId: userId,
      status: "ACTIVE",
    },
  });

  if (userPortalCategories.length === 0) {
    throw new Error("User portal categories not found");
  }

  const formattedUserPortalCategories: Record<string, unknown> = {};

  for (const pc of portalCategories) {
    const userHasPortalCategory = userPortalCategories.find(
      (upc) => upc.portalCategoryId === pc.id,
    );

    if (userHasPortalCategory) {
      formattedUserPortalCategories[`${pc.name}`] = pc.roles.map((role) => {
        return {
          roleId: role.id,
          roleName: role.name,
        };
      });
    }
  }

  return formattedUserPortalCategories;
};

const getUserAssignedRoles = async (userId: string) => {
  const userPortalCategories = await prisma.userPortalCategory.findMany({
    where: {
      userId: userId,
      status: "ACTIVE",
    },
    include: {
      portalCategory: true,
    },
  });

  if (userPortalCategories.length === 0) {
    throw new Error("User portal categories not found");
  }

  const userPortalCategoryIds = userPortalCategories.map((upc) => upc.id);

  const userPortalCategoryRoles = await prisma.userPortalCategoryRole.findMany({
    where: {
      userPortalCategoryId: {
        in: userPortalCategoryIds,
      },
    },
    include: {
      role: true,
    },
  });

  // if (userPortalCategoryRoles.length === 0) {
  //   throw new Error("User portal category roles not found");
  // }

  const formattedUserPortalCategoryRoles: Record<string, unknown> = {};

  for (const upc of userPortalCategories) {
    const userPortalCategoryRole = userPortalCategoryRoles.find(
      (upcr) => upcr.userPortalCategoryId === upc.id,
    );

    if (userPortalCategoryRole) {
      formattedUserPortalCategoryRoles[`${upc.portalCategory.name}`] =
        userPortalCategoryRoles
          .map((upcr) => {
            if (upcr.userPortalCategoryId === upc.id) {
              return {
                roleId: upcr.role.id,
                roleName: upcr.role.name,
              };
            }
          })
          .filter((role) => role);
    }
  }

  return formattedUserPortalCategoryRoles;
};

export const UserService = {
  getUserAssignableRoles,
  getUserAssignedRoles,
};
