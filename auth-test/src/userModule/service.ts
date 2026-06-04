import { PermissionType, PrismaClient } from "@prisma/client";
import { AppError } from "../utils/AppError";

const prisma = new PrismaClient();
interface CreateUserModulesRequest {
  userId: string[];
  portalCategories: {
    portalCategoryId: string;
    modules: { moduleId: string; modulePermission: string[] }[];
  }[];
  permissionType?: PermissionType;
  permissionStartDate?: Date;
  permissionEndDate?: Date;
  days?: number;
}
const portalModules: {
  [key: string]: {
    ROLE: any[];
    PERMANENT?: any[]; // Make PERMANENT optional
    TEMPORARY: any[];
  };
} = {};

export class UserModuleService {
  async createUserModules(data: {
    userId: string[];
    portalCategories: {
      portalCategoryId: string;
      permissionType?: PermissionType;
      permissionStartDate?: Date;
      permissionEndDate?: Date;
      days?: number;
      manualRevocation?: boolean;
      modules: { moduleId: string; modulePermission: string[] }[];
    }[];
  }) {
    try {
      const { userId, portalCategories } = data;

      // Validate all module IDs across all portal categories
      const allModuleIds = portalCategories.flatMap((category) =>
        category.modules.map((module) => module.moduleId),
      );

      // Remove duplicates from allModuleIds
      const uniqueModuleIds = [...new Set(allModuleIds)];

      const existingModules = await prisma.module.findMany({
        where: { id: { in: uniqueModuleIds } },
      });

      // Check for missing module IDs
      if (existingModules.length !== uniqueModuleIds.length) {
        const missingModuleIds = uniqueModuleIds.filter(
          (moduleId) =>
            !existingModules.some((module) => module.id === moduleId),
        );
        throw new Error(
          `The following moduleIds do not exist: ${missingModuleIds.join(", ")}`,
        );
      }

      // Fetch all existing users in the provided userId array
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: userId } },
        select: { id: true },
      });

      const existingUserIds = existingUsers.map((user) => user.id);

      // Check if all provided user IDs exist
      if (existingUserIds.length !== userId.length) {
        const missingUserIds = userId.filter(
          (id) => !existingUserIds.includes(id),
        );
        throw new Error(
          `The following userIds do not exist: ${missingUserIds.join(", ")}`,
        );
      }

      // Use a transaction for atomicity
      return await prisma.$transaction(async (prisma) => {
        // Step 1: Delete all records only if all users exist
        // await Promise.all(
        //   portalCategories.map(async (portalCategory) => {
        //     const { permissionType } = portalCategory;

        //     // Delete all records for the userId(s) and permissionType
        //     await prisma.userPortalCategoryModule.deleteMany({
        //       where: {
        //         userId: { in: existingUserIds },
        //         permissionType: permissionType || "PERMANENT", // Default to PERMANENT if not specified
        //       },
        //     });
        //   })
        // );
        await Promise.all(
          portalCategories.map(async (portalCategory) => {
            const { permissionType } = portalCategory;

            if (permissionType !== "TEMPORARY") {
              // Delete only for non-TEMPORARY types
              await prisma.userPortalCategoryModule.deleteMany({
                where: {
                  userId: { in: existingUserIds },
                  permissionType: permissionType || "PERMANENT",
                },
              });
            }
          }),
        );

        // Step 2: Insert new records based on the input data
        const results = await Promise.all(
          portalCategories.map(async (portalCategory) => {
            const {
              portalCategoryId,
              modules,
              permissionType,
              permissionStartDate,
              permissionEndDate,
              days,
              manualRevocation,
            } = portalCategory;

            // Calculate start and end dates if days are provided (only for TEMPORARY permissions)
            let startDate = permissionStartDate;
            let endDate = permissionEndDate;
            // manualRevocation is already declared in the outer scope
            if (permissionType === "TEMPORARY" && days) {
              startDate = new Date(); // Set to current date
              endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + Number(days));
            }

            // Process each user
            // return Promise.all(
            //   existingUserIds.map(async (userId) => {
            //     // Process each module
            //     return Promise.all(
            //       modules.map(async (module) => {
            //         const { moduleId, modulePermission } = module;

            //         // Insert the new record
            //         return prisma.userPortalCategoryModule.create({
            //           data: {
            //             userId,
            //             portalCategoryId,
            //             moduleId,
            //             modulePermission,
            //             permissionType: permissionType || "PERMANENT", // Default to PERMANENT if not specified

            //             permissionStartDate:
            //               permissionType === "TEMPORARY" ? startDate : null, // Only set for TEMPORARY
            //             permissionEndDate:
            //               permissionType === "TEMPORARY" ? endDate : null, // Only set for TEMPORARY
            //             manualRevocation: manualRevocation,
            //           },
            //         });
            //       })
            //     );
            //   })
            // );

            return Promise.all(
              existingUserIds.map(async (userId) => {
                return Promise.all(
                  modules.map(async (module) => {
                    const { moduleId, modulePermission } = module;

                    const commonData = {
                      userId,
                      portalCategoryId,
                      moduleId,
                      modulePermission,
                      permissionType: permissionType || "PERMANENT",
                      permissionStartDate:
                        permissionType === "TEMPORARY" ? startDate : null,
                      permissionEndDate:
                        permissionType === "TEMPORARY" ? endDate : null,
                      manualRevocation: manualRevocation ?? false,
                    };

                    if (permissionType === "TEMPORARY") {
                      // Use upsert for TEMPORARY
                      return prisma.userPortalCategoryModule.upsert({
                        where: {
                          userId_portalCategoryId_moduleId_permissionType: {
                            userId,
                            portalCategoryId,
                            moduleId,
                            permissionType: "TEMPORARY",
                          },
                        },
                        update: commonData,
                        create: commonData,
                      });
                    } else {
                      // Use create for others (after deletion above)
                      return prisma.userPortalCategoryModule.create({
                        data: commonData,
                      });
                    }
                  }),
                );
              }),
            );
          }),
        );

        return results.flat(2);
      });
    } catch (error) {
      throw new AppError("Internal Server Error", "Internal Server Error", 500);
    }
  }

  async getUserModulesDataByPortalCategory(portalCategory: string) {
    try {
      // Fetch portal categories and their associated modules
      const portalCategories = await prisma.portalCategory.findMany({
        where: {
          name: portalCategory, // Filter by the provided portalCategory
        },
        include: {
          portalCategoryModules: {
            include: {
              module: true, // Include the related Module data
            },
          },
        },
      });

      // Transform the data into the desired structure
      const result = portalCategories.map((portalCategory) => ({
        portalCategorieName: portalCategory.name,
        portalCategorieId: portalCategory.id,
        modules: portalCategory.portalCategoryModules.map(
          (portalCategoryModule) => ({
            moduleName: portalCategoryModule.module.name,
            moduleGroup: portalCategoryModule.module.groupName || "",
            moduleId: portalCategoryModule.module.id,
          }),
        ),
      }));

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch modules by portal category: ${error.message}`,
        );
      } else {
        throw new Error(
          "Failed to fetch modules by portal category: unknown error",
        );
      }
    }
  }
  async createModule(moduleData: {
    moduleName: string;
    groupName?: string;
    modulePermission?: string[];
    roleName?: string;
  }) {
    const module = await prisma.module.create({
      data: {
        name: moduleData.moduleName,
        groupName: moduleData.groupName || null,
      },
    });

    // If roleName is provided, create roleModule and portalCategoryModule
    if (moduleData.roleName) {
      const role = await prisma.role.findFirst({
        where: {
          name: moduleData.roleName,
        },
      });

      if (!role) {
        throw new AppError("Role not found", "Not found", 404);
      }

      const roleModule = await prisma.roleModule.create({
        data: {
          moduleId: module.id,
          roleId: role.id,
          modulePermission: moduleData.modulePermission || [],
        },
      });

      const portalCategoryModule = await prisma.portalCategoryModule.create({
        data: {
          portalCategoryId: role.portalCategoryId,
          moduleId: module.id,
        },
      });
    }

    return module;
  }

  async createModulesBulk(
    modulesData: {
      moduleName: string;
      groupName?: string;
    }[],
  ) {
    const createdModules = [];
    const errors = [];

    for (const moduleData of modulesData) {
      try {
        // Check if module already exists
        const existingModule = await prisma.module.findUnique({
          where: { name: moduleData.moduleName },
        });

        if (existingModule) {
          errors.push({
            moduleName: moduleData.moduleName,
            error: "Module already exists",
          });
          continue;
        }

        const module = await prisma.module.create({
          data: {
            name: moduleData.moduleName,
            groupName: moduleData.groupName || null,
          },
        });

        createdModules.push(module);
      } catch (error: any) {
        errors.push({
          moduleName: moduleData.moduleName,
          error: error.message,
        });
      }
    }

    return {
      created: createdModules,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async getModulesNotAssignedToPortal() {
    // Find all modules that don't have any portalCategoryModules relationship
    const unassignedModules = await prisma.module.findMany({
      where: {
        portalCategoryModules: {
          none: {}, // No portal category modules assigned
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return unassignedModules;
  }

  async getModulesGroupedByPortal() {
    // Fetch all portal categories with their associated modules
    const portals = await prisma.portalCategory.findMany({
      include: {
        portalCategoryModules: {
          include: {
            module: true,
          },
          orderBy: {
            module: {
              name: "asc",
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform the data into a grouped structure
    const groupedModules = portals.map((portal) => ({
      portalCategoryId: portal.id,
      portalName: portal.name,
      modules: portal.portalCategoryModules.map((pcm) => ({
        moduleId: pcm.module.id,
        moduleName: pcm.module.name,
        groupName: pcm.module.groupName,
      })),
      moduleCount: portal.portalCategoryModules.length,
    }));

    return groupedModules;
  }
  async getModules(userportal?: string) {
    const whereClause: any = {};

    if (userportal) {
      whereClause.portalCategoryModules = {
        some: {
          portalCategory: {
            name: userportal,
          },
        },
      };
    }

    return await prisma.module.findMany({
      where: whereClause,
    });
  }

  async getAllModules() {
    return await prisma.module.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }
  // async getUserModulesByUserId(userId: string, userportalname?: string) {
  //   const whereClause: any = { userId };

  //   // If userportalname is provided, filter by portal category name
  //   if (userportalname) {
  //     whereClause.portalCategory = { name: userportalname };
  //   }

  //   return await prisma.userPortalCategoryModule.findMany({
  //     where: whereClause,
  //     include: {
  //       module: true, // Include module details
  //       portalCategory: true, // Include portal category details
  //     },
  //   });
  // }
  async getUserModulesByUserId(userId: string, userportal?: string) {
    console.log("Received userId:", userId);
    console.log("Received userportal:", userportal);

    const whereClause: any = { userId };

    if (userportal) {
      whereClause.portalCategory = {
        name: {
          equals: userportal,
          mode: "insensitive", // Case-insensitive search
        },
      };
    }

    const userModules = await prisma.userPortalCategoryModule.findMany({
      where: whereClause,
      include: {
        module: true, // Include module details
        portalCategory: true, // Include portal category details
      },
    });

    return userModules.map((module) => ({
      moduleId: module.moduleId,
      moduleName: module.module.name, // Get module name from the included module
      modulePermission: module.modulePermission, // Include module permissions
      portalCategoryName: module.portalCategory.name, // Include portal category name
    }));
  }
  async getModulesByPortalCategoryId(portalCategoryId: string) {
    try {
      const modules = await prisma.module.findMany({
        where: {
          portalCategoryModules: {
            some: {
              portalCategoryId: portalCategoryId,
            },
          },
        },
        include: {
          portalCategoryModules: true,
        },
      });

      return modules;
    } catch (error) {
      // Check if the error is an instance of Error before accessing message
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }

  // async getUserModulesDataByUserId(userId: string) {
  //   // Fetch all portal categories
  //   const portalCategories = await prisma.portalCategory.findMany({
  //     include: {
  //       portalCategoryModules: {
  //         include: {
  //           module: true, // Include module details
  //         },
  //       },
  //     },
  //   });

  //   // Fetch all RoleModule records (no filtering by user roles)
  //   const allRoleModules = await prisma.roleModule.findMany({
  //     include: {
  //       module: true, // Include module details
  //     },
  //   });

  //   // Fetch all UserPortalCategoryModule records for the given userId
  //   const userModules = await prisma.userPortalCategoryModule.findMany({
  //     where: { userId },
  //     include: {
  //       module: true, // Include module details
  //       portalCategory: true, // Include portal category details
  //     },
  //   });

  //   // Organize data into the required format
  //   const categoriesMap = new Map();

  //   portalCategories.forEach((portalCategory) => {
  //     const portalCategorieId = portalCategory.id;
  //     const portalCategorieName = portalCategory.name;

  //     // Initialize the portal category in the map
  //     if (!categoriesMap.has(portalCategorieId)) {
  //       categoriesMap.set(portalCategorieId, {
  //         portalCategorieName,
  //         portalCategorieId,
  //         modules: [],
  //       });
  //     }

  //     // Iterate through all modules in the portal category
  //     portalCategory.portalCategoryModules.forEach((portalCategoryModule) => {
  //       const module = portalCategoryModule.module;

  //       // Find all permissions for this module from RoleModule and remove duplicates
  //       const roleModulePermissions = Array.from(
  //         new Set(
  //           allRoleModules
  //             .filter((roleModule) => roleModule.moduleId === module.id) // Filter by moduleId
  //             .flatMap((roleModule) => roleModule.modulePermission) // Extract permissions
  //         )
  //       );

  //       // Find user-specific permissions from UserPortalCategoryModule
  //       const userModulePermissions = userModules.filter(
  //         (um) => um.moduleId === module.id && um.portalCategoryId === portalCategorieId
  //       );

  //       // Separate permanent and temporary permissions from UserPortalCategoryModule
  //       const permanentPermissions = userModulePermissions
  //         .filter((um) => um.permissionType === "PERMANENT")
  //         .flatMap((um) => um.modulePermission);

  //       const temporaryPermissions = userModulePermissions
  //         .filter((um) => um.permissionType === "TEMPORARY")
  //         .flatMap((um) => um.modulePermission);

  //       // Add the module to the portal category
  //       categoriesMap.get(portalCategorieId).modules.push({
  //         moduleName: module.name,
  //         moduleId: module.id,
  //         portalCategorieId,
  //         availableModulePermission: roleModulePermissions, // Permissions from RoleModule
  //         assignedModulePermissions:permanentPermissions, // Permissions from UserPortalCategoryModule (PERMANENT)
  //         // temporaryPermissions, // Permissions from UserPortalCategoryModule (TEMPORARY)
  //       });
  //     });
  //   });

  //   // Convert the map to an array
  //   const portalCategoriesArray = Array.from(categoriesMap.values());

  //   return portalCategoriesArray;
  // }

  async getUserModulesDataByUserId(userId: string) {
    // Fetch all portal categories assigned to the user (directly or via roles)
    const userPortalCategories = await prisma.userPortalCategory.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        portalCategory: {
          include: {
            portalCategoryModules: {
              include: {
                module: true, // Include module details
              },
            },
          },
        },
      },
    });

    // Fetch all RoleModule records (no filtering by user roles)
    const allRoleModules = await prisma.roleModule.findMany({
      include: {
        module: true, // Include module details
      },
    });

    // Fetch all UserPortalCategoryModule records for the given userId
    const userModules = await prisma.userPortalCategoryModule.findMany({
      where: { userId },
      include: {
        module: true, // Include module details
        portalCategory: true, // Include portal category details
      },
    });

    // Fetch all roles assigned to the user
    const userRoles = await prisma.userPortalCategoryRole.findMany({
      where: { userPortalCategory: { userId } },
      include: {
        role: {
          include: {
            roleModules: {
              include: {
                module: true, // Include module details
              },
            },
          },
        },
      },
    });

    // Organize data into the required format
    const categoriesMap = new Map();

    // Iterate through portal categories assigned to the user
    userPortalCategories.forEach((userPortalCategory) => {
      const portalCategory = userPortalCategory.portalCategory;
      const portalCategorieId = portalCategory.id;
      const portalCategorieName = portalCategory.name;

      // Initialize the portal category in the map
      if (!categoriesMap.has(portalCategorieId)) {
        categoriesMap.set(portalCategorieId, {
          portalCategorieName,
          portalCategorieId,
          modules: [],
        });
      }

      // Iterate through all modules in the portal category
      portalCategory.portalCategoryModules.forEach((portalCategoryModule) => {
        const module = portalCategoryModule.module;

        // Find all permissions for this module from RoleModule and remove duplicates
        const roleModulePermissions = Array.from(
          new Set(
            allRoleModules
              .filter((roleModule) => roleModule.moduleId === module.id) // Filter by moduleId
              .flatMap((roleModule) => roleModule.modulePermission), // Extract permissions
          ),
        );

        // Find user-specific permissions from UserPortalCategoryModule
        const userModulePermissions = userModules.filter(
          (um) =>
            um.moduleId === module.id &&
            um.portalCategoryId === portalCategorieId,
        );

        // Separate permanent and temporary permissions from UserPortalCategoryModule
        const permanentPermissions = userModulePermissions
          .filter((um) => um.permissionType === "PERMANENT")
          .flatMap((um) => um.modulePermission);

        const temporaryPermissions = userModulePermissions
          .filter((um) => um.permissionType === "TEMPORARY")
          .flatMap((um) => um.modulePermission);

        const temporaryPermissionRecord = userModulePermissions.find(
          (um) => um.permissionType === "TEMPORARY",
        );

        // Format temporary permission info (or null if none exists)
        const temporaryPermissionsInfo = temporaryPermissionRecord
          ? {
              id: temporaryPermissionRecord.id,
              manualRevocation: temporaryPermissionRecord.manualRevocation,
              permissionStartDate:
                temporaryPermissionRecord.permissionStartDate,
              permissionEndDate: temporaryPermissionRecord.permissionEndDate,
              permissions: temporaryPermissionRecord.modulePermission,
            }
          : null;

        // Find role-based permissions for the user
        const roleBasedPermissions = userRoles
          .filter((ur) => ur.role.portalCategoryId === portalCategorieId)
          .flatMap((ur) =>
            ur.role.roleModules
              .filter((rm) => rm.moduleId === module.id)
              .flatMap((rm) => rm.modulePermission),
          );

        let allPermissions;
        if (permanentPermissions.length === 0) {
          // If no assigned permissions (neither permanent nor temporary), use roleBasedPermissions
          allPermissions = Array.from(new Set(roleBasedPermissions));
        } else {
          // Otherwise, combine assigned permissions (both permanent and temporary)
          allPermissions = Array.from(
            new Set([...permanentPermissions, ...temporaryPermissions]),
          );
        }

        categoriesMap.get(portalCategorieId).modules.push({
          moduleName: module.name,
          moduleId: module.id,
          moduleGroup: module.groupName,
          portalCategorieId,
          availableModulePermission: roleModulePermissions, // Permissions from RoleModule
          assignedModulePermissions: permanentPermissions, // Permissions from UserPortalCategoryModule (PERMANENT)
          temporaryPermissions, // Permissions from UserPortalCategoryModule (TEMPORARY)
          roleBasedPermissions, // Permissions from roles assigned to the user
          allPermissions, // Now follows your new requirement
          temporaryPermissionsInfo, // Info about temporary permissions
        });
      });
    });

    // Convert the map to an array
    const portalCategoriesArray = Array.from(categoriesMap.values());

    return portalCategoriesArray;
  }
  async getUserModulesTemporaryDataByUserId(userId: string) {
    // Fetch all portal categories
    const portalCategories = await prisma.portalCategory.findMany({
      include: {
        portalCategoryModules: {
          include: {
            module: true, // Include module details
          },
        },
      },
    });

    // Fetch all RoleModule records (no filtering by user roles)
    const allRoleModules = await prisma.roleModule.findMany({
      include: {
        module: true, // Include module details
      },
    });

    // Fetch all UserPortalCategoryModule records for the given userId
    const userModules = await prisma.userPortalCategoryModule.findMany({
      where: { userId },
      include: {
        module: true, // Include module details
        portalCategory: true, // Include portal category details
      },
    });

    // Organize data into the required format
    const categoriesMap = new Map();

    const userPortalCategories = await prisma.userPortalCategory.findMany({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
    });

    const activePortalCategories = portalCategories.filter((pc) =>
      userPortalCategories.find((upc) => upc.portalCategoryId === pc.id),
    );

    activePortalCategories.forEach((portalCategory) => {
      const portalCategorieId = portalCategory.id;
      const portalCategorieName = portalCategory.name;

      // Initialize the portal category in the map
      if (!categoriesMap.has(portalCategorieId)) {
        categoriesMap.set(portalCategorieId, {
          portalCategorieName,
          portalCategorieId,
          modules: [],
        });
      }

      // Iterate through all modules in the portal category
      portalCategory.portalCategoryModules.forEach((portalCategoryModule) => {
        const module = portalCategoryModule.module;

        // Find all permissions for this module from RoleModule and remove duplicates
        const roleModulePermissions = Array.from(
          new Set(
            allRoleModules
              .filter((roleModule) => roleModule.moduleId === module.id) // Filter by moduleId
              .flatMap((roleModule) => roleModule.modulePermission), // Extract permissions
          ),
        );

        // Find user-specific permissions from UserPortalCategoryModule
        const userModulePermissions = userModules.filter(
          (um) =>
            um.moduleId === module.id &&
            um.portalCategoryId === portalCategorieId,
        );

        // Separate permanent and temporary permissions from UserPortalCategoryModule
        const permanentPermissions = userModulePermissions
          .filter((um) => um.permissionType === "PERMANENT")
          .flatMap((um) => um.modulePermission);

        const temporaryPermissions = userModulePermissions
          .filter((um) => um.permissionType === "TEMPORARY")
          .flatMap((um) => um.modulePermission);

        // Add the module to the portal category
        categoriesMap.get(portalCategorieId).modules.push({
          moduleName: module.name,
          moduleId: module.id,
          portalCategorieId,
          availableModulePermission: roleModulePermissions, // Permissions from RoleModule
          assignedModulePermissions: temporaryPermissions, // Permissions from UserPortalCategoryModule (PERMANENT)
          // temporaryPermissions, // Permissions from UserPortalCategoryModule (TEMPORARY)
          manualRevocation: userModulePermissions[0]?.manualRevocation,
        });
      });
    });

    // Convert the map to an array
    const portalCategoriesArray = Array.from(categoriesMap.values());

    return portalCategoriesArray;
  }

  async deleteUserPortalCategoryModuleById(userPortalCategoryModuleId: string) {
    try {
      // Check if the record exists
      const existingRecord = await prisma.userPortalCategoryModule.findUnique({
        where: { id: userPortalCategoryModuleId },
      });

      if (!existingRecord) {
        throw new AppError(
          "User portal category module not found",
          "Not Found",
          404,
        );
      }

      // Delete the record
      await prisma.userPortalCategoryModule.delete({
        where: { id: userPortalCategoryModuleId },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "Internal Server Error",
          "Internal Server Error",
          500,
        );
      }
    }
  }

  async getUserDetailsWithModules(userId: string) {
    try {
      const currentTime = new Date(); // Current time to compare with permissionEndDate

      // Fetch user details with ACTIVE userPortalCategories
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userPortalCategories: {
            where: { status: "ACTIVE" }, // Only ACTIVE portal categories
            include: {
              portalCategory: {
                include: {
                  portalCategoryModules: {
                    include: { module: true },
                  },
                },
              },
            },
          },
          userPortalCategoryModules: {
            include: {
              module: true,
              portalCategory: true,
            },
          },
        },
      });

      if (!user) {
        return { error: "User not found" };
      }

      const portalModules: {
        [key: string]: {
          ROLE?: any[]; // Make ROLE optional
          PERMANENT?: any[]; // Make PERMANENT optional
          TEMPORARY?: any[]; // Make TEMPORARY optional
        };
      } = {};

      // Process each ACTIVE user portal category
      user.userPortalCategories.forEach(({ portalCategory }) => {
        const portalName = portalCategory.name;

        // Initialize the structure for this portal category
        portalModules[portalName] = {};

        // Get all modules available for this portal category
        const allModules = portalCategory.portalCategoryModules.map((pcm) => ({
          moduleId: pcm.module.id,
          moduleName: pcm.module.name,
        }));

        // Filter user’s assigned modules by portal category
        const userModules = user.userPortalCategoryModules.filter(
          (upcm) => upcm.portalCategoryId === portalCategory.id,
        );

        // Check if TEMPORARY modules exist
        const temporaryModules = userModules
          .filter(
            (upcm) =>
              upcm.permissionType === "TEMPORARY" &&
              (upcm.manualRevocation === true ||
                (upcm.permissionEndDate &&
                  currentTime < new Date(upcm.permissionEndDate))),
          )
          .filter((upcm) => {
            // Ensure modulePermission is not null/undefined and is an array
            return (
              upcm.modulePermission &&
              Array.isArray(upcm.modulePermission) &&
              upcm.modulePermission.length > 0
            );
          });

        if (temporaryModules.length > 0) {
          // If TEMPORARY modules exist, only show TEMPORARY
          portalModules[portalName].TEMPORARY = temporaryModules.map(
            (upcm) => ({
              moduleId: upcm.module.id,
              moduleName: upcm.module.name,
              permissionStartDate: upcm.permissionStartDate,
              permissionEndDate: upcm.permissionEndDate,
              manualRevocation: upcm.manualRevocation,
            }),
          );
        } else {
          // If TEMPORARY modules do not exist, check for PERMANENT modules
          const permanentModules = userModules
            .filter((upcm) => upcm.permissionType === "PERMANENT")
            .filter((upcm) => {
              // Ensure modulePermission is not null/undefined and is an array
              return (
                upcm.modulePermission &&
                Array.isArray(upcm.modulePermission) &&
                upcm.modulePermission.length > 0
              );
            });

          if (permanentModules.length > 0) {
            // If PERMANENT modules exist, only show PERMANENT
            portalModules[portalName].PERMANENT = permanentModules.map(
              (upcm) => ({
                moduleId: upcm.module.id,
                moduleName: upcm.module.name,
              }),
            );
          } else {
            // If neither TEMPORARY nor PERMANENT modules exist, show ROLE
            const roleModules = allModules.filter((module) => {
              // Check if the module has any permissions in RoleModule
              const roleModule = userModules.find(
                (upcm) =>
                  upcm.moduleId === module.moduleId &&
                  upcm.permissionType === "ROLE",
              );
              return (
                roleModule &&
                roleModule.modulePermission &&
                Array.isArray(roleModule.modulePermission) &&
                roleModule.modulePermission.length > 0
              );
            });

            if (roleModules.length > 0) {
              portalModules[portalName].ROLE = roleModules;
            }
          }
        }
      });

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          username: user.username,
          userStatus: user.userStatus,
        },
        portalModules,
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw new Error("Error fetching user details");
    }
  }
  // async getUserDetailsWithModules(userId: string) {
  //   try {
  //     const currentTime = new Date();

  //     // Fetch user details with ACTIVE userPortalCategories
  //     const user = await prisma.user.findUnique({
  //       where: { id: userId },
  //       include: {
  //         userPortalCategories: {
  //           where: { status: "ACTIVE" },
  //           include: {
  //             portalCategory: {
  //               include: {
  //                 portalCategoryModules: {
  //                   include: { module: true },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         userPortalCategoryModules: {
  //           include: {
  //             module: true,
  //             portalCategory: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!user) {
  //       return { error: "User not found" };
  //     }

  //     let portalModules: Record<string, any> = {};

  //     // Iterate over each of the user's active portal categories
  //     user.userPortalCategories.forEach(({ portalCategory }) => {
  //       const portalName = portalCategory.name;

  //       // Initialize the portalModules structure for this portal if not already set
  //       if (!portalModules[portalName]) {
  //         portalModules[portalName] = {
  //           ROLE: [],
  //           TEMPORARY: [],
  //           PERMANENT: [],
  //         };
  //       }

  //       const modulePriorityMap = new Map<
  //         string,
  //         "TEMPORARY" | "PERMANENT" | "ROLE"
  //       >();

  //       // Process each of the user's portal category modules
  //       user.userPortalCategoryModules
  //         .filter((upcm) => upcm.portalCategoryId === portalCategory.id)
  //         .forEach((upcm) => {
  //           const moduleId = upcm.module.id;

  //           if (upcm.permissionType === "TEMPORARY") {
  //             if (
  //               upcm.manualRevocation === true ||
  //               (upcm.permissionEndDate &&
  //                 currentTime < new Date(upcm.permissionEndDate))
  //             ) {
  //               if (modulePriorityMap.get(moduleId) !== "TEMPORARY") {
  //                 portalModules[portalName].TEMPORARY.push({
  //                   moduleId,
  //                   moduleName: upcm.module.name,
  //                   permissionStartDate: upcm.permissionStartDate,
  //                   permissionEndDate: upcm.permissionEndDate,
  //                   manualRevocation: upcm.manualRevocation,
  //                 });
  //                 modulePriorityMap.set(moduleId, "TEMPORARY");
  //               }
  //             }
  //           } else if (upcm.permissionType === "PERMANENT") {
  //             if (
  //               !modulePriorityMap.has(moduleId) ||
  //               modulePriorityMap.get(moduleId) === "ROLE"
  //             ) {
  //               portalModules[portalName].PERMANENT.push({
  //                 moduleId,
  //                 moduleName: upcm.module.name,
  //               });
  //               modulePriorityMap.set(moduleId, "PERMANENT");
  //             }
  //           } else if (upcm.permissionType === "ROLE") {
  //             if (!modulePriorityMap.has(moduleId)) {
  //               portalModules[portalName].ROLE.push({
  //                 moduleId,
  //                 moduleName: upcm.module.name,
  //               });
  //               modulePriorityMap.set(moduleId, "ROLE");
  //             }
  //           }
  //         });

  //       // Remove empty PERMANENT array if no modules were added
  //       if (portalModules[portalName].PERMANENT.length === 0) {
  //         delete portalModules[portalName].PERMANENT;
  //       }
  //     });

  //     return {
  //       user: {
  //         id: user.id,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         email: user.email,
  //         mobile: user.mobile,
  //         username: user.username,
  //         userStatus: user.userStatus,
  //       },
  //       portalModules: Object.keys(portalModules).map((portalName) => ({
  //         portalName,
  //         ...portalModules[portalName],
  //       })),
  //     };
  //   } catch (error) {
  //     console.error("Error fetching user details:", error);
  //     throw new Error("Error fetching user details");
  //   }
  // }
}
