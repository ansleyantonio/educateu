import { Prisma, templateType } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { RegisterUserData } from "./schemas";
import bcrypt from "bcryptjs";
import { sendRegistrationEmail } from "../communication/mail/mailer";

const publicAgentregister = async (registerData: RegisterUserData) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { agentEmail: { equals: registerData.email, mode: "insensitive" } },
        { agentUser: { equals: registerData.username, mode: "insensitive" } },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.agentUser === registerData.username) {
      throw new AppError(
        "Username is already registered",
        "USERNAME_TAKEN",
        409,
      );
    }
    if (existingUser.agentEmail === registerData.email) {
      throw new AppError("Email is already registered", "EMAIL_TAKEN", 409);
    }
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(registerData.password, 10);

  const agentPortalCategory = await prisma.portalCategory.findUnique({
    where: { name: "agent" },
  });

  if (!agentPortalCategory) {
    throw new AppError("Agent portal category not found", "NOT_FOUND", 404);
  }

  // Fetch the 'Sub-Agent' role
  const agentRole = await prisma.role.findFirst({
    where: {
      name: "agent",
      portalCategoryId: agentPortalCategory.id,
    },
  });

  if (!agentRole) {
    throw new AppError("Agent role not found", "NOT_FOUND", 404);
  }
  const enrollMentStatus = await prisma.variable.findUnique({
    where: { name: "enrollment" },
    select: { value: true },
  });

  //TO DO : Move this check to a middleware or a separate function to avoid code duplication
  // if (!enrollMentStatus || enrollMentStatus.value !== "open") {
  //   throw new AppError(
  //     "Registration is currently closed",
  //     "REGISTRATION_CLOSED",
  //     403,
  //   );
  // }

  if (registerData.agentType) {
    const normalizedAgentType =
      registerData.agentType.toUpperCase() as templateType;

    // Create the new user
    const user = await prisma.user.create({
      data: {
        agentEmail: registerData.email,
        agentUser: registerData.username,
        password: hashedPassword,
        mobile: registerData.mobile || "",
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        address: registerData.address || null,
        userStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const userPortalCategory = await prisma.userPortalCategory.create({
      data: {
        userId: user.id,
        portalCategoryId: agentPortalCategory.id,
      },
    });

    // Initialize awardingBodyTemplates as an empty array or from registerData if available
    const awardingBodyTemplates = registerData.awardingBodyTemplates || [];

    const roleData: any = {
      potentialPayment: registerData.potentialPayment || null,
      commissionGroupId: registerData.commissionGroupId || null,
      commitionRate: registerData.commitionRate || null,
      companyName: registerData.companyName || null,
      aggrementExpiryDate: registerData.aggrementExpiryDate || null,
      agentType: registerData.agentType || null,
      commissionTemplate: registerData.commissionTemplate || null,
      startDate: registerData.startDate || null,
      endDate: registerData.endDate || null,
      note: registerData.note || null,
      agreementStatus: registerData.agreementStatus || true,
      userStatus: registerData.userStatus || "ACTIVE",
      awardingBodyTemplates: awardingBodyTemplates,
    };

    await prisma.userPortalCategoryRole.create({
      data: {
        userPortalCategoryId: userPortalCategory.id,
        roleId: agentRole.id,
        roleData: roleData,
      },
    });

    const roleModules = await prisma.roleModule.findMany({
      where: { roleId: agentRole.id },
      include: { module: true },
    });

    for (const roleModule of roleModules) {
      await prisma.userPortalCategoryModule.create({
        data: {
          userId: user.id,
          portalCategoryId: agentPortalCategory.id,
          moduleId: roleModule.moduleId,
          modulePermission:
            roleModule.modulePermission as Prisma.InputJsonValue,
          permissionType: "ROLE",
        },
      });
    }
    await sendRegistrationEmail(
      {
        email: user.agentEmail || "",
        username: user.agentUser || undefined,
        firstName: user.firstName,
        password: registerData.password,
      },
      process.env.AGENT_LOGIN_URL || "https://your-login-page.com", // or pass from config
    );
    // Return the newly created user with their roles
    return prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userPortalCategories: {
          include: {
            userPortalCategoryRoles: {
              include: { role: true },
            },
          },
        },
      },
    });
  }
};

export const PublicAgentService = {
  publicAgentregister,
};
