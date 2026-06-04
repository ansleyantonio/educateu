/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchFilterLists = async (data: any) => {
  const { body, token } = data;
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/filter/user`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning portal:", error);
    throw error;
  }
};
