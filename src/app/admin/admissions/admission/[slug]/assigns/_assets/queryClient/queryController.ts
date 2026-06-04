/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

export const fetchListOfAdmissionOfficers = async ({ queryKey }: any) => {
  const [, token, searchText] = queryKey;
  // const { token, searchText } = queryKey[1];
  // console.log("token", token);
  // console.log("searchText", searchText);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/assigns/admission-officers?searchTerm=${searchText}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

// Fetch list of assigned logs
export const fetchListOfAssignedLogs = async ({ queryKey }: any) => {
  const [, id, token] = queryKey;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/assigns/application-assignments?applicationId=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const assignToAdmissionOfficer = async ({ token, data }: any) => {
  // console.log("Assign success", data, token);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/assigns/application-assignments`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
