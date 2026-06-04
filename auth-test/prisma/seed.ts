import { z } from "zod";
import prisma from "../src/prismaClient";
import data from "./seed-data.json";
import { Prisma } from "@prisma/client";
import {
  PortalCategorySchema,
  RoleSchema,
  UserSchema,
} from "../src/prisma/types";

import { zodSafeParse } from "../src/utils/zodUtils";

import bcrypt from "bcryptjs";
import { group } from "node:console";

async function main() {
  // NOTE: SEED PORTAL CATEGORIES
  const portalCategoryNames = ["admin", "agent", "faculty"];
  const portalCategories: Record<string, any> = {};

  for (const name of portalCategoryNames) {
    portalCategories[name] = await prisma.portalCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminCategory = portalCategories["admin"];
  const agentCategory = portalCategories["agent"];
  const facultyCategory = portalCategories["faculty"];

  // NOTE: SEED MODULES FROM JSON
  for (const module of data.modules) {
    await prisma.module.upsert({
      where: { name: module.name },
      update: {},
      create: {
        name: module.name,
      },
    });
  }

  // NOTE: SEED ROLES
  const rolesToSeed = [
    { name: "admin", pcId: adminCategory.id },
    { name: "agent", pcId: agentCategory.id },
    { name: "faculty", pcId: facultyCategory.id },
    { name: "subagent", pcId: agentCategory.id },
  ];

  const seededRoles: Record<string, any> = {};

  for (const role of rolesToSeed) {
    seededRoles[`${role.name}_${role.pcId}`] = await prisma.role.upsert({
      where: {
        name_portalCategoryId: {
          name: role.name,
          portalCategoryId: role.pcId,
        },
      },
      update: {},
      create: {
        name: role.name,
        portalCategoryId: role.pcId,
      },
    });
  }

  // Seed modules for agent role
  const agentRole = seededRoles[`agent_${agentCategory.id}`];
  const agentRoleModules = ["application-management", "sub-agent-management"];

  for (const moduleName of agentRoleModules) {
    const module = await prisma.module.findUnique({
      where: { name: moduleName },
    });

    if (module) {
      await prisma.roleModule.upsert({
        where: {
          roleId_moduleId: {
            roleId: agentRole.id,
            moduleId: module.id,
          },
        },
        update: {},
        create: {
          roleId: agentRole.id,
          moduleId: module.id,
          modulePermission: ["GET", "POST", "PUT", "DELETE"],
        },
      });
    }
  }

  // NOTE: SEED MODULES FOR ADMIN PORTAL
  const adminModules = [
    { name: "additional-file-check", groupName: "admissions" },
    { name: "admission", groupName: "admissions" },
    { name: "advanced-course-fee", groupName: "finance" },
    { name: "advanced-payment-system", groupName: "finance" },
    { name: "agent-overview", groupName: "finance" },
    { name: "assessments", groupName: "course-management" },
    { name: "awarding-bodies", groupName: "awarding-bodies" },
    {
      name: "business-development-management",
      groupName: "business-development-management",
    },
    { name: "certificate-course-fee", groupName: "finance" },
    { name: "commission-payments", groupName: "finance" },
    { name: "course-lesson", groupName: "course-management" },
    { name: "course-lessons", groupName: "course-management" },
    { name: "course-module", groupName: "course-management" },
    { name: "course-modules", groupName: "course-management" },
    { name: "courses", groupName: "course-management" },
    { name: "enrollment-management", groupName: "enrollment-management" },
    { name: "faculty-management", groupName: "external-portal-users" },
    { name: "finance-settings", groupName: "finance" },
    { name: "interview", groupName: "admissions" },
    { name: "lessons", groupName: "course-management" },
    { name: "module", groupName: "course-management" },
    { name: "payment-history", groupName: "finance" },
    { name: "payment-processing-system", groupName: "finance" },
    { name: "payments", groupName: "finance" },
    { name: "pre-screening", groupName: "admissions" },
    { name: "promotional-code", groupName: "finance" },
    { name: "promotional-codes", groupName: "finance" },
    { name: "registry", groupName: "student-roaster" },
    { name: "session", groupName: "course-management" },
    { name: "support", groupName: "student-roaster" },
    { name: "system-settings", groupName: "system-settings" },
    { name: "uploads", groupName: "uploads" },
    { name: "user-management", groupName: "user-management" },
    { name: "wellbeing", groupName: "admissions" },
    { name: "withdrawal-request", groupName: "student-roaster" },
    { name: "notification-log", groupName: "notification-log" },
  ];

  for (const module of adminModules) {
    const upsertedModule = await prisma.module.upsert({
      where: { name: module.name },
      update: { groupName: module.groupName },
      create: {
        name: module.name,
        groupName: module.groupName,
      },
    });

    await prisma.portalCategoryModule.upsert({
      where: {
        portalCategoryId_moduleId: {
          portalCategoryId: adminCategory.id,
          moduleId: upsertedModule.id,
        },
      },
      update: {},
      create: {
        portalCategoryId: adminCategory.id,
        moduleId: upsertedModule.id,
      },
    });
  }

  // NOTE: SEED MODULES FOR AGENT PORTAL
  const agentModules = [
    { name: "agent-awarding-bodies", groupName: "agent-awarding-bodies" },
    { name: "application-management", groupName: "application-management" },
    { name: "awarding-bodies", groupName: "awarding-bodies" },
    { name: "commissions", groupName: "commissions" },
    { name: "marketing-link", groupName: "marketing-link" },
    { name: "sub-agent-management", groupName: "sub-agent-management" },
    { name: "agent-notification-log", groupName: "agent-notification-log" },
  ];

  for (const module of agentModules) {
    const upsertedModule = await prisma.module.upsert({
      where: { name: module.name },
      update: { groupName: module.groupName },
      create: {
        name: module.name,
        groupName: module.groupName,
      },
    });

    await prisma.portalCategoryModule.upsert({
      where: {
        portalCategoryId_moduleId: {
          portalCategoryId: agentCategory.id,
          moduleId: upsertedModule.id,
        },
      },
      update: {},
      create: {
        portalCategoryId: agentCategory.id,
        moduleId: upsertedModule.id,
      },
    });
  }

  // NOTE: SEED MODULES FOR FACULTY PORTAL
  const facultyModules = [
    { name: "faculty-assessment", groupName: "faculty-assessment" },
    { name: "faculty-assigned-module", groupName: "faculty-assigned-module" },
    { name: "faculty-assignment", groupName: "faculty-assignment" },
    { name: "faculty-course-lesson", groupName: "course-management" },
    { name: "faculty-course-module", groupName: "course-management" },
    { name: "faculty-discussion-forum", groupName: "faculty-discussion-forum" },
    { name: "faculty-ec-request", groupName: "faculty-ec-request" },
  ];

  for (const module of facultyModules) {
    const upsertedModule = await prisma.module.upsert({
      where: { name: module.name },
      update: { groupName: module.groupName },
      create: {
        name: module.name,
        groupName: module.groupName,
      },
    });

    await prisma.portalCategoryModule.upsert({
      where: {
        portalCategoryId_moduleId: {
          portalCategoryId: facultyCategory.id,
          moduleId: upsertedModule.id,
        },
      },
      update: {},
      create: {
        portalCategoryId: facultyCategory.id,
        moduleId: upsertedModule.id,
      },
    });
  }

  // NOTE: SEED USERS
  const adminRole = await prisma.role.upsert({
    where: {
      name_portalCategoryId: {
        name: "admin",
        portalCategoryId: adminCategory.id,
      },
    },
    update: {},
    create: {
      name: "admin",
      portalCategoryId: adminCategory.id,
    },
  });

  for (const user of data.users) {
    const parsedUser = zodSafeParse(user, UserSchema);
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const upsertedUser = await prisma.user.upsert({
      where: { email: parsedUser.email || "" },
      update: {
        ...parsedUser,
        password: hashedPassword,
      },
      create: {
        ...parsedUser,
        password: hashedPassword,
      },
    });

    const userPortalCategory = await prisma.userPortalCategory.upsert({
      where: {
        userId_portalCategoryId: {
          userId: upsertedUser.id,
          portalCategoryId: adminCategory.id,
        },
      },
      update: {},
      create: {
        userId: upsertedUser.id,
        portalCategoryId: adminCategory.id,
      },
    });

    await prisma.userPortalCategoryRole.upsert({
      where: {
        userPortalCategoryId_roleId: {
          userPortalCategoryId: userPortalCategory.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userPortalCategoryId: userPortalCategory.id,
        roleId: adminRole.id,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let application = await prisma.application.findFirst();
  if (!application) {
    application = await prisma.application.create({
      data: {
        ...(data.application as Prisma.ApplicationCreateInput),
      },
    });
  }

  const agentEmail = "agent@educate-u.com";
  let agent = await prisma.user.findFirst({
    where: { agentEmail },
  });

  if (!agent) {
    agent = await prisma.user.create({
      data: {
        firstName: "agent",
        lastName: "user",
        agentUser: "agent",
        agentEmail: agentEmail,
        mobile: "911234567891",
        password: await bcrypt.hash("123456", 10),
        mfaEnabled: false,
        passwordChanged: true,
        userPortalCategories: {
          create: {
            portalCategory: {
              connect: {
                id: agentCategory.id,
              },
            },

            userPortalCategoryRoles: {
              create: {
                role: {
                  connect: {
                    name_portalCategoryId: {
                      name: "agent",
                      portalCategoryId: agentCategory.id,
                    },
                  },
                },
                userPortalCategoryRoleApplications: {
                  create: {
                    applicationId: application.id,
                  },
                },
              },
            },
          },
        },

        userPortalCategoryModules: {
          create: [
            {
              portalCategoryId: (
                await prisma.portalCategory.findUnique({
                  where: { name: "agent" },
                })
              )?.id as string,
              moduleId: (
                await prisma.module.findUnique({
                  where: { name: "application-management" },
                })
              )?.id as string,
              modulePermission: ["GET", "POST", "PUT", "DELETE"],
            },

            {
              portalCategoryId: (
                await prisma.portalCategory.findUnique({
                  where: { name: "agent" },
                })
              )?.id as string,
              moduleId: (
                await prisma.module.findUnique({
                  where: { name: "sub-agent-management" },
                })
              )?.id as string,
              modulePermission: ["GET", "POST", "PUT", "DELETE"],
            },
          ],
        },
      },
    });
  }

  const adminEmail = "admin@educate-u.com";
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        firstName: "admin",
        lastName: "user",
        username: "admin",
        email: adminEmail,
        mobile: "911234567890",
        password: await bcrypt.hash("123456", 10),
        mfaEnabled: false,
        passwordChanged: true,
        userPortalCategories: {
          create: {
            portalCategory: {
              connect: {
                id: adminCategory.id,
              },
            },

            userPortalCategoryRoles: {
              create: {
                role: {
                  connect: {
                    name_portalCategoryId: {
                      name: "admin",
                      portalCategoryId: adminCategory.id,
                    },
                  },
                },
              },
            },
          },
        },

        userPortalCategoryModules: {
          create: {
            portalCategoryId: adminCategory.id,
            moduleId: (
              await prisma.module.findUnique({
                where: { name: "user-management" },
              })
            )?.id as string,
            modulePermission: ["GET", "POST", "PUT", "DELETE"],
          },
        },
      },
    });
  }

  const facultyEmail = "faculty@educate-u.com";
  let faculty = await prisma.user.findFirst({
    where: { facultyEmail },
  });

  if (!faculty) {
    faculty = await prisma.user.create({
      data: {
        firstName: "faculty",
        lastName: "user",
        facultyUser: "faculty",
        facultyEmail: facultyEmail,
        mobile: "911234567890",
        password: await bcrypt.hash("123456", 10),
        mfaEnabled: false,
        passwordChanged: true,
        userPortalCategories: {
          create: {
            portalCategory: {
              connect: {
                id: facultyCategory.id,
              },
            },

            userPortalCategoryRoles: {
              create: {
                role: {
                  connect: {
                    name_portalCategoryId: {
                      name: "faculty",
                      portalCategoryId: facultyCategory.id,
                    },
                  },
                },
              },
            },
          },
        },

        userPortalCategoryModules: {
          create: {
            portalCategoryId: facultyCategory.id,
            moduleId: (
              await prisma.module.findUnique({
                where: { name: "module" },
              })
            )?.id as string,
            modulePermission: ["GET", "POST", "PUT", "DELETE"],
          },
        },
      },
    });
  }

  console.log("Data seeded successfully");
  // console.log("Seeded roles:", roles);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
