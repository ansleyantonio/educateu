/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchUserDeviceHistory = async ({ queryKey }: any) => {
  const { token } = queryKey[1];

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/device/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error:", error.response?.data);
      return error.response?.data;
    } else {
      console.error("Error:", error);
      return error;
    }
  }
};
