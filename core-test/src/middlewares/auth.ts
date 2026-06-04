// Authentication middleware for EducateU Core Backend
//
// This middleware handles user authentication by validating required headers
// and retrieving user information from the database. It implements a multi-role
// authentication system where users can have different roles across different
// portal categories.
//
// Required Headers:
// - user-id: UUID of the user
// - portal-category-id: UUID of the portal category
// - role-id: UUID of the user's role in that portal category

import { Response, NextFunction } from "express";
import { zodSafeParse } from "../utils/zodUtils";
import z from "zod";
import prisma from "../prismaClient";
import { RequestWithUser } from "../types";
import { AppError } from "../utils/AppError";

// Authentication middleware that validates user credentials and attaches user data to request
//
// This middleware performs the following operations:
// 1. Validates required headers (user-id, portal-category-id, role-id)
// 2. Parses and validates UUID format for all IDs
// 3. Retrieves user portal category role from database
// 4. Attaches user information to request object for use in subsequent middleware/controllers
export const auth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const publicRoutes = [
    "/stripe-payments/payment-success",
    "/stripe-payments/payment-canceled",
    "/decision-emails/applicant/",
    "/uploads-public/",
    "/manual/create-manual-payment",
  ];

  if (publicRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }
  // Legacy authorization header approach (commented out)
  // Previously used Bearer token-based authentication
  // if (req.headers.authorization) {
  //   const usrRoleId = req.headers.authorization.split(" ")[1];
  //   const result = z.string().uuid().safeParse(usrRoleId);
  //   if (result.success) {
  //     const userRole = await prisma.userRole.findUnique({
  //       where: { id: usrRoleId },
  //       ...userRoleIncludeAndOmit,
  //     });
  //     if (userRole) {
  //       req.user = userRole;
  //     }
  //   }
  // }

  if (req.path.startsWith("/student-portal")) {
    if (!req.headers["user-id"]) {
      throw new AppError("Unauthorized: Student-ID not found in header", "UNAUTHORIZED", 401);
    }

    const studentId = req.headers["user-id"];

    const parsedStudentId = zodSafeParse(studentId, z.string().uuid());

    const student = await prisma.student.findUnique({
      where: {
        id: parsedStudentId,
      },
    });

    if (!student) {
      throw new AppError("Unauthorized: Student not found", "UNAUTHORIZED", 401);
    }

    req.student = student;

    return next();
  }

  // Validate presence of all required authentication headers
  if (!req.headers["user-id"] || !req.headers["portal-category-id"] || !req.headers["role-id"]) {
    throw new AppError(
      "Unauthorized: Either User-ID, Portal-Category-ID or Role-ID not found in header",
      "UNAUTHORIZED",
      401,
    );
  }

  // Extract and validate user ID from headers
  const userId = req.headers["user-id"];
  const parsedUserId = zodSafeParse(userId, z.string().uuid());

  // Extract and validate portal category ID from headers
  const portalCategoryId = req.headers["portal-category-id"];
  const parsedPortalCategoryId = zodSafeParse(portalCategoryId, z.string().uuid());

  // Extract and validate role ID from headers
  const roleId = req.headers["role-id"];
  const parsedRoleId = zodSafeParse(roleId, z.string().uuid());

  /*
   * Query database for user portal category role relationship
   * This complex relationship ensures:
   * - User exists and has access to the specified portal category
   * - User has the specified role within that portal category
   * - Includes related data for role permissions and applications
   */
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      userPortalCategory: {
        userId: parsedUserId,
        portalCategoryId: parsedPortalCategoryId,
      },
      roleId: parsedRoleId,
    },
    include: {
      role: true, // Include role details for permission checking
      userPortalCategory: true, // Include user portal category relationship
      userPortalCategoryRoleApplications: true, // Include application access
    },
  });

  // Throw error if user doesn't have the required role in the portal category
  if (!userPortalCategoryRole) {
    throw new AppError("Unauthorized: UserPortalCategoryRole not found", "UNAUTHORIZED", 401);
  }

  // Attach user information to request for use in controllers
  req.user = userPortalCategoryRole;

  // Continue to next middleware or controller
  next();
};
