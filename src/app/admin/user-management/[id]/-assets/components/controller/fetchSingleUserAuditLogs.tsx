/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleUserAuditLogs = async ({ queryKey }: any) => {
  const { filter, id, token } = queryKey[1];
  console.log("Single User Audit Log", filter);
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/logs/${id}`,
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
