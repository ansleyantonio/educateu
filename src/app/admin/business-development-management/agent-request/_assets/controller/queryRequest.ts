/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { AgentRequestProps } from "../type";

export const fetchAgentRequests = async ({ queryKey }: any) => {
  const { token } = queryKey[1];
  // ?agentType=${agentType}
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/pending/agents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const fetchAgentDetails = async ({ queryKey }: any) => {
  const { token, userID } = queryKey[1];

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/${userID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

// Approved Agent Request
export const ApproveAgentRequest = async ({
  userID,
  userStatus,
  token,
}: AgentRequestProps) => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/${userID}`,
      { userStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
