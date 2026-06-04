/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const AssignModule = async (data: any) => {
  const { body, token } = data;
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user-modules/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning portal:", error);
    throw error;
  }
};
export const AssignRoleModule = async (data: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/assign/role`,
      data.AssignRole,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning portal:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};
