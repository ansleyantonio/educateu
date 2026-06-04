/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchAllCommissionGroups = async ({ queryKey }: any) => {
  const { type, token } = queryKey[1];

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/groups`,
      {
        params: {
          type: type.toUpperCase(), 
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching commission groups:", error);
    throw error;
  }
};
