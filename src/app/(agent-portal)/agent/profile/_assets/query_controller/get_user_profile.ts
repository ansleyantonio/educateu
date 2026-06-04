/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Controller function to update the agent profile
export const getUserProfileController = async ({ queryKey }: any) => {
  const { id, token } = queryKey[1];

  try {
    const response = await axios.get(
      `${API_URL}/business-development-management/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to update profile");
  }
};
