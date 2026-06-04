/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchAssignedAgents = async ({
  token,
  commissionGroupId,
}: {
  token: string;
  commissionGroupId: string;
}) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/userlist/${commissionGroupId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};
