import axios from "axios";
import prisma from "../../prismaClient";

export const getUserIdsByRoleId = async (roleId: string) => {
  const records = await prisma.userPortalCategoryRole.findMany({
    where: {
      roleId,
    },
    select: {
      userPortalCategory: {
        select: {
          userId: true,
        },
      },
    },
  });

  const userIds = [
    ...new Set(
      records
        .map((r) => r.userPortalCategory?.userId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  // ✅ async notification (fire & forget safely)
  setImmediate(() => {
    userIds.forEach((id) => {
      axios
        .post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
          userId: id,
          type: "module",
        })
        .catch((err) => {
          console.error(`Notification failed for user ${id}:`, err.message);
        });
    });
  });

  // ✅ IMPORTANT: return data
  console.log(`Users with role `, userIds); // Debug log
  return userIds;
};
