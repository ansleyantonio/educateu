/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleUser = async ({ queryKey }: any) => {
  const { userId, token } = queryKey[1];

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
