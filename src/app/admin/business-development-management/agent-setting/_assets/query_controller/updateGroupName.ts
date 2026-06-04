/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const updateGroupName = async ({
  token,
  groupId,
  newName,
}: {
  token: string;
  groupId: string;
  newName: string;
}) => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/groups/${groupId}`,
      {
        name: newName,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update group name"
    );
  }
};