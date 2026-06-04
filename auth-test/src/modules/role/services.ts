import { Prisma, RoleStatus } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import {
  CreateRoleReqBody,
  FilterRolesReqBody,
  GetRolesReqQuery,
  UpdateRoleReqBody,
} from "./types";
import { getPagination } from "../../utils/paginationUtils";

const normalizeRoleName = (name: string) => {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
};

const getRolesPortalByUserId = async (userId: string) => {
  // Step 1: Fetch all portals and their associated roles
  const portals = await prisma.portalCategory.findMany({
    include: {
      roles: true, // Include all roles for each portal
    },
  });

  // Step 2: Fetch all roles assigned to the user via UserPortalCategoryRole
  const userPortalCategoryRoles = await prisma.userPortalCategoryRole.findMany({
    where: {
      userPortalCategory: {
        userId: userId, // Filter by the provided userId
      },
    },
    include: {
      role: true, // Include the role details
    },
  });

  // Convert user roles to a Set for quick lookup
  const userRoleIds = new Set(
    userPortalCategoryRoles.map((upcr) => upcr.roleId),
  );

  // Step 3: Transform the data into the desired format
  const result = portals.reduce(
    (acc, portal) => {
      const rolesMap = portal.roles.reduce(
        (roleAcc, role) => {
          roleAcc[role.name] = userRoleIds.has(role.id); // Check if the user is assigned to the role
          return roleAcc;
        },
        {} as Record<string, boolean>,
      );

      acc[portal.name] = rolesMap; // Group roles by portal name
      return acc;
    },
    {} as Record<string, Record<string, boolean>>,
  );

  return result;
};

const createRole = async (reqBody: CreateRoleReqBody) => {
  const normalizedRoleName = normalizeRoleName(reqBody.roleName);

  for (const category of reqBody.categories) {
    const portalCategory = await prisma.portalCategory.findFirst({
      where: {
        name: category.categoryName,
      },
    });

    if (!portalCategory) {
      throw new AppError("Portal category not found", "NOT_FOUND", 404);
    }

    const role = await prisma.role.findFirst({
      where: {
        AND: [
          {
            name: normalizedRoleName,
          },
          {
            portalCategoryId: portalCategory.id,
          },
        ],
      },
    });

    if (role) {
      throw new AppError("Role already exists", "ALREADY_EXISTS", 400);
    }

    const modules: { moduleName: string; id: string }[] = [];

    for (const module of category.modules) {
      const m = await prisma.portalCategoryModule.findFirst({
        where: {
          portalCategory: {
            name: category.categoryName,
          },
          module: {
            name: module.moduleName,
          },
        },
      });
      if (!m) {
        throw new AppError("Module not found", "NOT_FOUND", 404);
      }
      modules.push({
        moduleName: module.moduleName,
        id: m.id,
      });
    }

    const newRole = await prisma.role.create({
      data: {
        // name: reqBody.roleName,
        name: normalizedRoleName,
        portalCategoryId: portalCategory.id,
      },
    });

    for (const module of category.modules) {
      const moduleFromDb = await prisma.module.findFirst({
        where: {
          name: module.moduleName,
        },
      });

      if (!moduleFromDb) {
        throw new AppError("Module not found", "NOT_FOUND", 404);
      }

      const newRoleModule = await prisma.roleModule.create({
        data: {
          roleId: newRole.id,
          moduleId: moduleFromDb.id,
          modulePermission: module.modulePermissions,
        },
      });
    }
  }

  return;
};

const getRoles = async (reqQuery: GetRolesReqQuery) => {
  const { offset, limit } = getPagination(reqQuery.page);

  const where: Prisma.RoleFindManyArgs["where"] = {
    AND: [
      ...(reqQuery.status
        ? [
            {
              status: reqQuery.status,
            },
          ]
        : []),
      // {
      //   userPortalCategoryRoles: {
      //     some: {
      //       userPortalCategory: {
      //         status: "ACTIVE",
      //       },
      //     },
      //   },
      // },
      ...(reqQuery.portal
        ? [{ portalCategory: { name: reqQuery.portal } }]
        : []),
    ],
  };

  const [roles, count] = await prisma.$transaction([
    prisma.role.findMany({
      where: where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        portalCategory: true,
        roleModules: {
          include: {
            module: true,
          },
        },
      },
    }),
    prisma.role.count({
      where,
    }),
  ]);

  const rolesWithUserCount = await Promise.all(
    roles.map(async (role) => {
      const roleUserCount = await prisma.userPortalCategoryRole.count({
        where: {
          roleId: role.id,
          userPortalCategory: {
            status: "ACTIVE",
          },
        },
      });

      return {
        userCount: roleUserCount,
        ...role,
      };
    }),
  );

  const paginationData = {
    count: rolesWithUserCount.length,
    total: count,
    page: reqQuery.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  // for (const role of roles) {
  //   const roleUserCount = await prisma.userPortalCategoryRole.count({
  //     where: {
  //       roleId: role.id,
  //     },
  //   });
  //
  //   role.userCount = roleUserCount;
  // }

  return { rolesWithUserCount, paginationData };
};

const updateRole = async (roleId: string, reqBody: UpdateRoleReqBody) => {
  const normalizedRoleName = normalizeRoleName(reqBody.roleName || "");
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    include: {
      roleModules: {
        include: {
          module: true,
        },
      },
    },
  });

  if (!role) {
    throw new AppError("Role not found", "NOT_FOUND", 404);
  }

  type Role = Prisma.RoleGetPayload<{}>;

  if (reqBody.modules) {
    for (const module of reqBody.modules) {
      const moduleFromDb = await prisma.module.findFirst({
        where: {
          name: module.moduleName,
          portalCategoryModules: {
            some: {
              portalCategoryId: role.portalCategoryId,
            },
          },
        },
      });
      if (!moduleFromDb) {
        throw new AppError("Module not found", "NOT_FOUND", 404);
      }
    }
  }

  const deletedRoleModules = await prisma.roleModule.deleteMany({
    where: {
      roleId: roleId,
    },
  });

  if (reqBody.modules) {
    for (const module of reqBody.modules) {
      const moduleFromDb = await prisma.module.findFirst({
        where: {
          name: module.moduleName,
          portalCategoryModules: {
            some: {
              portalCategoryId: role.portalCategoryId,
            },
          },
        },
      });

      if (!moduleFromDb) {
        throw new AppError("Module not found", "NOT_FOUND", 404);
      }

      const newRoleModule = await prisma.roleModule.create({
        data: {
          roleId: roleId,
          moduleId: moduleFromDb.id,
          modulePermission: module.modulePermission,
        },
      });
    }
  }

  const roleModules = role?.roleModules.map((roleModule) => {
    return {
      moduleId: roleModule.module.id,
      moduleName: roleModule.module.name,
    };
  });

  const modulesToBeDeleted: string[] = [];

  if (reqBody.modules) {
    if (roleModules && roleModules.length >= 1) {
      for (const roleModule of roleModules) {
        if (
          !reqBody.modules.find((m) => m.moduleName === roleModule.moduleName)
        ) {
          modulesToBeDeleted.push(roleModule.moduleId);
        }
      }
    }
  }

  if (modulesToBeDeleted.length >= 1) {
    for (const moduleId of modulesToBeDeleted) {
      const moduleFromDb = await prisma.module.findUnique({
        where: {
          id: moduleId,
        },
      });

      if (!moduleFromDb) {
        throw new Error(`Module ${module} not found`);
      }

      const toBeDeletedUserPortalCategoryModuleId =
        await prisma.userPortalCategoryModule.findFirst({
          where: {
            portalCategoryId: role.portalCategoryId,
            moduleId: moduleFromDb.id,
            permissionType: "ROLE",
          },
        });

      if (!toBeDeletedUserPortalCategoryModuleId) {
        throw new Error(`User portal category module not found`);
      }

      const deletedUserPortalCategoryModule =
        await prisma.userPortalCategoryModule.delete({
          where: {
            id: toBeDeletedUserPortalCategoryModuleId.id,
          },
        });
    }
  }

  const userIds: string[] = [];

  if (reqBody.modules) {
    for (const module of reqBody.modules) {
      const moduleFromDb = await prisma.module.findFirst({
        where: {
          name: module.moduleName,
        },
      });

      if (!moduleFromDb) {
        throw new Error(`Module ${module} not found`);
      }

      const userPortalCategoryModuleFromDb =
        await prisma.userPortalCategoryModule.findMany({
          where: {
            portalCategoryId: role.portalCategoryId,
            moduleId: moduleFromDb.id,
            permissionType: "ROLE",
          },
        });

      if (userPortalCategoryModuleFromDb.length > 0 && userIds.length === 0) {
        userIds.push(userPortalCategoryModuleFromDb[0].userId);
      }
      if (userPortalCategoryModuleFromDb.length > 0) {
        const updatedUserPortalCategoryModules =
          await prisma.userPortalCategoryModule.updateMany({
            where: {
              portalCategoryId: role.portalCategoryId,
              moduleId: moduleFromDb.id,
              permissionType: "ROLE",
            },
            data: {
              modulePermission: module.modulePermission,
            },
          });
      } else {
        if (userIds.length > 0) {
          for (const userId of userIds) {
            const userPortalCategoryModule =
              await prisma.userPortalCategoryModule.create({
                data: {
                  userId: userId,
                  portalCategoryId: role.portalCategoryId,
                  moduleId: moduleFromDb.id,
                  permissionType: "ROLE",
                  modulePermission: module.modulePermission,
                },
              });
          }
        }
      }
    }
  }

  let newRole: Role | undefined;

  // if (reqBody.roleName) {
  //   newRole = await prisma.role.update({
  //     where: {
  //       id: roleId,
  //     },
  //     data: {
  //       name: normalizedRoleName,
  //     },
  //   });
  // }
  if (reqBody.roleName) {
    const normalizedRoleName = normalizeRoleName(reqBody.roleName);

    const existingRole = await prisma.role.findFirst({
      where: {
        name: normalizedRoleName,
        portalCategoryId: role.portalCategoryId,
        NOT: {
          id: roleId,
        },
      },
    });

    if (existingRole) {
      throw new AppError("Role name already exists", "ALREADY_EXISTS", 409);
    }

    newRole = await prisma.role.update({
      where: {
        id: roleId,
      },
      data: {
        name: normalizedRoleName,
      },
    });
  }

  return;
};

const getRoleIncludingPermissions = async ({
  roleId,
  categoryId,
}: {
  roleId: string;
  categoryId: string;
}) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
      portalCategoryId: categoryId,
    },
  });

  if (!role) {
    throw new AppError("Role not found", "NOT_FOUND", 404);
  }

  const categoryModules = await prisma.portalCategoryModule.findMany({
    where: {
      portalCategoryId: categoryId,
    },
    include: {
      module: {
        select: {
          name: true,
        },
      },
    },
  });

  if (categoryModules.length === 0) {
    throw new AppError("Portal category not found", "NOT_FOUND", 404);
  }

  const roleModules = await prisma.roleModule.findMany({
    where: {
      roleId: roleId,
    },
  });

  // if (roleModules.length === 0) {
  //   throw new AppError("Role not found", "NOT_FOUND", 404);
  // }

  const mergedModules = categoryModules.map((categoryModule) => {
    const moduleInRole = roleModules.find(
      (rm) => rm.moduleId === categoryModule.moduleId,
    );

    if (moduleInRole) {
      return {
        moduleId: categoryModule.moduleId,
        moduleName: categoryModule.module.name,
        modulePermissions: moduleInRole.modulePermission,
        categoryId: categoryModule.portalCategoryId,
      };
    } else {
      return {
        moduleId: categoryModule.moduleId,
        moduleName: categoryModule.module.name,
        modulePermissions: [],
        categoryId: categoryModule.portalCategoryId,
      };
    }
  });

  return mergedModules;
};

const filterRoles = async (reqBody: FilterRolesReqBody) => {
  const { offset, limit } = getPagination(reqBody.page);

  const where: Prisma.RoleFindManyArgs["where"] = {
    AND: [
      ...(reqBody.searchTerm
        ? [
            {
              name: {
                contains: reqBody.searchTerm.toLowerCase(),
              },
            },
          ]
        : []),
      ...(reqBody.moduleFilters
        ? [
            {
              OR: reqBody.moduleFilters.map((moduleFilter) => {
                return {
                  roleModules: {
                    some: {
                      AND: [
                        {
                          module: {
                            name: moduleFilter.moduleName,
                          },
                        },
                        ...(moduleFilter.modulePermission
                          ? [
                              {
                                OR: moduleFilter.modulePermission.map((mp) => {
                                  return {
                                    modulePermission: {
                                      array_contains: mp,
                                    },
                                  };
                                }),
                              },
                            ]
                          : []),
                      ],
                    },
                  },
                };
              }),
            },
          ]
        : []),
      ...(reqBody.portalCategoryFilters
        ? [
            {
              OR: reqBody.portalCategoryFilters.map((portalCategoryFilter) => {
                return {
                  portalCategory: {
                    name: portalCategoryFilter.name,
                  },
                };
              }),
            },
          ]
        : []),
    ],
  };

  const [roles, count] = await prisma.$transaction([
    prisma.role.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        portalCategory: true,
        roleModules: {
          include: {
            module: true,
          },
        },
      },
    }),
    prisma.role.count({
      where,
    }),
  ]);
  const rolesWithUserCount = await Promise.all(
    roles.map(async (role) => {
      const roleUserCount = await prisma.userPortalCategoryRole.count({
        where: {
          roleId: role.id,
          userPortalCategory: {
            status: "ACTIVE",
          },
        },
      });

      return {
        ...role,
        userCount: roleUserCount,
      };
    }),
  );

  const paginationData = {
    count: roles.length,
    total: count,
    page: reqBody.page,
    perPage: 10,
    totalPages: Math.ceil(count / 10),
  };

  // return { roles, paginationData };
  return { roles: rolesWithUserCount, paginationData };
};

const updateRoleModules = async (
  roleId: string,
  modules: {
    moduleId: string;
    modulePermission: string[];
  }[],
) => {
  // Verify role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      roleModules: true,
    },
  });

  if (!role) {
    throw new AppError("Role not found", "NOT_FOUND", 404);
  }

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Delete all existing role modules for this role
    await tx.roleModule.deleteMany({
      where: { roleId },
    });

    // Step 2: Create new role modules based on provided data
    const createdRoleModules = [];

    for (const module of modules) {
      const roleModule = await tx.roleModule.create({
        data: {
          roleId,
          moduleId: module.moduleId,
          modulePermission: module.modulePermission,
        },
        include: {
          module: true,
        },
      });

      createdRoleModules.push(roleModule);
    }

    return createdRoleModules;
  });

  return {
    roleId,
    roleName: role.name,
    modules: result.map((rm) => ({
      moduleId: rm.moduleId,
      moduleName: rm.module.name,
      modulePermission: rm.modulePermission,
    })),
  };
};

// Archive role by roleId if no user is assigned to this role
const archiveRole = async (roleId: string, status: RoleStatus) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });

  if (!role) {
    throw new AppError("Role not found", "NOT_FOUND", 404);
  }

  if (status === RoleStatus.ARCHIVED) {
    const roleUserCount = await prisma.userPortalCategoryRole.count({
      where: {
        roleId,
        userPortalCategory: {
          status: "ACTIVE",
        },
      },
    });

    if (roleUserCount > 0) {
      throw new AppError(
        `Cannot archive role. ${roleUserCount} user(s) are currently assigned to this role.`,
        "CONFLICT",
        409,
      );
    }
  }

  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: { status },
  });

  return { role: updatedRole };
};

export const RoleService = {
  archiveRole,
  getRoles,
  createRole,
  updateRole,
  getRolesPortalByUserId,
  getRoleIncludingPermissions,
  filterRoles,
  updateRoleModules,
};
