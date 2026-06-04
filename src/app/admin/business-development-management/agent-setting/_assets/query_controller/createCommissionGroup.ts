/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const createCommissionGroup = async ({
  token,
  groupName,
  type,
}: {
  token: string;
  groupName: string;
  type: "INTERNAL" | "EXTERNAL";
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/groups/`,
      {
        name: groupName,
        type,
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
      error?.response?.data?.message || "Failed to create commission group"
    );
  }
};
