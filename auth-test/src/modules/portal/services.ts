import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { portalCategoryModuleType, portalType } from "./schema";

const getPortals = async () => {
  const portals = await prisma.portalCategory.findMany({
    include: {
      portalCategoryModules: {
        include: {
          portalCategory: {
            select: {
              id: true,
            },
          },
          module: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    omit: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const formattedPortals = portals.map((portal) => {
    return {
      categoryId: portal.id,
      categoryName: portal.name,
      modules: portal.portalCategoryModules.map((pcm) => {
        return {
          moduleId: pcm.module.id,
          moduleName: pcm.module.name,
          categoryId: pcm.portalCategory.id,
          modulePermissions: [],
        };
      }),
    };
  });

  return formattedPortals;
};
const createPortal = async (data: portalType) => {
  const existingPortal = await prisma.portalCategory.findUnique({
    where: {
      name: data.name,
    },
  });
  if (existingPortal) {
    throw new AppError(
      `Portal with name ${data.name} already exists`,
      "BAD_REQUEST",
      400
    );
  }
  const portal = await prisma.portalCategory.create({
    data: {
      name: data.name,
    },
  });

  return portal;
};

export const assignModulesToPortal = async (data: portalCategoryModuleType) => {
  const existingPortal = await prisma.portalCategory.findUnique({
    where: {
      id: data.portalCategoryId,
    },
  });

  if (!existingPortal) {
    throw new AppError("Portal not found", "NOT_FOUND", 404);
  }

  const modules = await prisma.module.findMany({
    where: {
      id: {
        in: data.moduleIds,
      },
    },
  });

  if (modules.length !== data.moduleIds.length) {
    throw new AppError("Some modules not found", "NOT_FOUND", 404);
  }

  await prisma.portalCategoryModule.createMany({
    data: modules.map((m) => ({
      portalCategoryId: data.portalCategoryId,
      moduleId: m.id,
    })),
    skipDuplicates: true,
  });

  return { message: "Modules assigned successfully" };
};

export const PortalService = {
  getPortals,
  createPortal,
  assignModulesToPortal,
};
