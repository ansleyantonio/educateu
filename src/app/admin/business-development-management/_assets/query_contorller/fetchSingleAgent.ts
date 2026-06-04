/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleAgent = async ({ queryKey }: any) => {
  const { token, id } = queryKey[1];
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/${id}`,
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
