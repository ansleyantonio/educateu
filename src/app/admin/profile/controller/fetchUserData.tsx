/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function fetchUserData({ queryKey }: any) {
  const { token, id } = queryKey[1];

  // console.log("fetchPortalCategorysData", token);

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    return error;
  }
}
