/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleApplications = async ({ queryKey }: any) => {
  const { token, id } = queryKey[1];
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/profile/application/${id}`,
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
