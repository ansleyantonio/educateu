/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchListOfAuditLogs = async ({ queryKey }: any) => {
  const { filter, page, token } = queryKey?.[1];
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/logs?page=${page}`,
      filter,
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
