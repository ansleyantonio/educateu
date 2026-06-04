/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Controller function to update the agent profile
export const updateProfileController = async ({
  token,
  updateData,
  id,
}: {
  token: string;
  updateData: any;
  id: string;
}) => {
  // console.log("agentId", agentId);
  // console.log("body", body);

  try {
    const response = await axios.patch(
      `${API_URL}/business-development-management/${id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
};
