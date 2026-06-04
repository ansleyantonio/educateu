const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class PortalCategoryService {
  // static async getPortalCategoryService(filterByName?: string | null) {
  //     return prisma.portalCategory.findMany({
  //         where: filterByName ? { name: { contains: filterByName } } : {},
  //         select: {
  //             id: true,
  //             name: true,
  //         },
  //     });
  // }
  static async getPortalCategoryService(filterByName?: string | null) {
    return prisma.portalCategory.findMany({
      where: {
        ...(filterByName
          ? { name: { contains: filterByName, mode: "insensitive" } }
          : {}),
        NOT: { name: "agent" },
      },
      select: {
        id: true,
        name: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async getPortalCategoryHistoryService() {
    return prisma.portalCategory.findMany({
      include: {
        roles: true,
        userPortalCategories: true,
        portalCategoryModules: true,
      },
      where: {
        NOT: {
          name: "agent",
        },
      },
    });
  }
}

export default PortalCategoryService;
