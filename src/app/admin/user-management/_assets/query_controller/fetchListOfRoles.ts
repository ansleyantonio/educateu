/* eslint-disable @typescript-eslint/no-explicit-any */
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import axios from "axios";

export const fetchListOfRoles = async ({ queryKey }: any) => {
  const { page, token, searchText, roleFilterData } = queryKey[1];
  const url = `${process.env.NEXT_PUBLIC_API_URL}/user-management/roles/filter-roles`;

  const updateRoleData = RemoveEmptyFields({
    ...roleFilterData,
    searchTerm: searchText || "",
    portalCategoryFilters: [{ name: "admin" }], // TODO remove this
    page: page || 1,
  });

  try {
    const { data } = await axios.post(
      `${url}`,
      { ...updateRoleData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log("list role data", data);
    return data;
  } catch (error) {
    throw error;
  }
};

interface FetchAssignedRoleParams {
  queryKey: [
    string,
    { token: string; userId: string; portalCategoryName: string }
  ];
}

export const fetchAssignedRole = async ({
  queryKey,
}: FetchAssignedRoleParams) => {
  const { token, userId, portalCategoryName } = queryKey[1];
  const body = { userId, portalCategoryName };
  console.log("fetchAssignedRole", userId, portalCategoryName);

  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user/roleId`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log("assigned role data", data);
    return { data };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export interface AssignRoleParams {
  token: string | undefined;
  body: {
    userId: string;
    portalCategoryName: string;
    roleName: string;
  };
}

export const AssignNewRole = async ({ token, body }: AssignRoleParams) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user/assign/role`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
