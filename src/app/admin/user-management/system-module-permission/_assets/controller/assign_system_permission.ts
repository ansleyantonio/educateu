/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

export async function AssignSystemPermission(data: any) {
  const { body, token } = data;
  console.log("Data", data);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user_role/`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning system permission:", error);
    throw error;
  }
}
