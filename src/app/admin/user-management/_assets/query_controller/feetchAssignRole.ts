/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function fetchAllAssignableRoleLis({ queryKey }: any) {
  const { id, token } = queryKey[1];
  // console.log("fetchAssignedModule", id);
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/users/${id}/assignable-roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log(res.data);
    return res.data;
  } catch (error) {
    return error;
  }
}

export async function fetchAssignedRoleList({ queryKey }: any) {
  const { id, token } = queryKey[1];
  console.log("id", id);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.get(
      `${apiUrl}/user-management/users/${id}/assigned-roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
}
