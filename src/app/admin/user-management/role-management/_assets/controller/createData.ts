/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { NewRole } from "../interface/role_type";
import { UpdateRoleRequest } from "../interface/update_role_type";

export const createNewRole = async ({ transformedData, token }: NewRole) => {
  console.log("Data:", transformedData, token);
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/roles`,
      transformedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const upadateRoleById = async ({
  updatedRole,
  token,
  roleId,
}: UpdateRoleRequest) => {
  console.log("Data:", updatedRole, token);
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/roles/${roleId}`,
      updatedRole,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};
