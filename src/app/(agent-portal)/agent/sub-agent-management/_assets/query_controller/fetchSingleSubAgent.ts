/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleSubAgents = async ({
  id,
  //   agentRole,
  token,
}: {
  id: string;
  //   agentRole: string;
  token: string;
}) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/sub-agent-info/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
