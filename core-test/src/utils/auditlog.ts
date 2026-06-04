import prisma from "../prismaClient";

export interface AuditLogInput {
  userId: string;
  action: string;
  targetUserId?: string;
  previousValue?: string;
  newValue?: string;
  actionType?: string;
  moduleName?: string;
  courseId?: string;
  moduleId?: string;
}

const createAuditLog = async ({
  userId,
  action,
  targetUserId,
  previousValue,
  newValue,
  actionType,
  moduleName,
  courseId,
  moduleId,
}: AuditLogInput): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetUserId,
        perviousValue: previousValue,
        newValue,
        actionType,
        moduleName,
        courseId,
        moduleId,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

export default createAuditLog;
