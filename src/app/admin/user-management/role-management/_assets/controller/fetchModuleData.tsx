/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function fetchModuleData({ queryKey }: any) {
  const { token, portalName } = queryKey[1];
  // console.log("fetchModuleData", { token, portalName });
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user-modules/module?userportal=${portalName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch module data"
    );
  }
}
