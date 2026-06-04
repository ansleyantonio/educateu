/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleApplications = async ({ queryKey }: any) => {
  const { token, id } = queryKey[1];
  // ?agentType=${agentType}
  //   console.log("application  id", id);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/application-management/${id}`,

      // `${process.env.NEXT_PUBLIC_API_URL}/admission`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
