/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function fetchPortalCategorysData({ queryKey }: any) {
  const { token } = queryKey[1];

  console.log("token /portal", token);
  // console.log("fetchPortalCategoryData", token);

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/portal`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log("fetchPortalCategoryData", res.data);
    return res.data;
  } catch (error) {
    return error;
  }
}

export async function fetchActiveRoleModuleData({ queryKey }: any) {
  const { token, activeRoleData } = queryKey[1];

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/roles/role-including-permissions`,
      activeRoleData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    return error;
  }
}

export async function fetchPortalsModule({ queryKey }: any) {
  const { token } = queryKey[1];

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/portals`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log("fetchPortalsModule", res.data);
    return res.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch module data"
    );
  }
}
