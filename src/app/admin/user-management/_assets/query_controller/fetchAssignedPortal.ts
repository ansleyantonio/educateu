/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function fetchAssignedPortal({ queryKey }: any) {
  const { id, token } = queryKey[1];
  // console.log("fetchAssignedPortal", id, token);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // const apiUrl = "http://192.168.0.246:5000";

    const res = await axios.get(`${apiUrl}/user-management/user/portal/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.log(error);
  }
}
