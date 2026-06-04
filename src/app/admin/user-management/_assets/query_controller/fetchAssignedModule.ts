/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function fetchAssignedModule({ queryKey }: any) {
  const { id, token, Category, lotOfUser } = queryKey[1];
  // console.log("Category--------- id", id);
  // console.log("Category--------- Category", Category);
  const Id = lotOfUser ? id[0] : id;
  // console.log("Category--------- Id", Id);
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user-modules/permission/${Id}?portalCategory=${Category}`,
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

export async function fetchAllModuleList({ queryKey }: any) {
  const { token } = queryKey[1];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.get(
      `${apiUrl}/user-management/user-modules/module`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.modules;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
}
