// query_controller/assignAgentsToGroup.ts
import axios from "axios";

export const assignAgentsToGroup = async ({
  token,
  commissionGroupId,
  userIds,
}: {
  token: string;
  commissionGroupId: string;
  userIds: string[];
}) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/assign/`,
    {
      commissionGroupId,
      userIds,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};