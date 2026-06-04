/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleAgent = async (agentRole: string, token: string) => {
  // console.log("id", id);
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentRole}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchAgentInfo = async ({ queryKey }: { queryKey: any }) => {
  const [_, agentId, token] = queryKey;

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/${agentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
