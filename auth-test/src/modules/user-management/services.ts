import prisma from "../../prismaClient";

/**
 * Get users by module name
 * @param moduleName - The name of the module
 * @returns List of users who have access to the module through RoleModule
 */
const getUsersByModuleName = async (moduleName: string) => {
  // Find RoleModules for this module
  const roleModules = await prisma.roleModule.findMany({
    where: {
      module: {
        name: moduleName,
      },
    },
    include: {
      role: {
        include: {
          userPortalCategoryRoles: {
            include: {
              userPortalCategory: {
                include: {
                  user: true,
                  portalCategory: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Collect all unique users
  const userMap = new Map<string, any>();

  for (const roleModule of roleModules) {
    for (const upcr of roleModule.role.userPortalCategoryRoles) {
      const user = upcr.userPortalCategory.user;
      if (!userMap.has(user.id)) {
        userMap.set(user.id, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          mobile: user.mobile,
          username: user.username,
          photo: user.photo,
          emailVerified: user.emailVerified,
          userStatus: user.userStatus,
          role: {
            roleId: roleModule.role.id,
            roleName: roleModule.role.name,
          },
          portalCategory: {
            portalCategoryId: upcr.userPortalCategory.portalCategory.id,
            portalCategoryName: upcr.userPortalCategory.portalCategory.name,
          },
          createdAt: user.createdAt,
        });
      }
    }
  }

  return Array.from(userMap.values());
};

/**
 * Get users by multiple module names
 * @param moduleNames - Array of module names
 * @returns Flat array of all users from all modules
 */
const getUsersByMultipleModules = async (moduleNames: string[]) => {
  const userMap = new Map<string, any>();

  // For each module, get the users through RoleModule
  for (const moduleName of moduleNames) {
    const roleModules = await prisma.roleModule.findMany({
      where: {
        module: {
          name: moduleName,
        },
      },
      include: {
        role: {
          include: {
            userPortalCategoryRoles: {
              include: {
                userPortalCategory: {
                  include: {
                    user: true,
                    portalCategory: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Collect all unique users
    for (const roleModule of roleModules) {
      for (const upcr of roleModule.role.userPortalCategoryRoles) {
        const user = upcr.userPortalCategory.user;
        if (!userMap.has(user.id)) {
          userMap.set(user.id, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            mobile: user.mobile,
            username: user.username,
            photo: user.photo,
            emailVerified: user.emailVerified,
            userStatus: user.userStatus,
          });
        }
      }
    }
  }

  return Array.from(userMap.values());
};

export const UserManagementService = {
  getUsersByModuleName,
  getUsersByMultipleModules,
};
