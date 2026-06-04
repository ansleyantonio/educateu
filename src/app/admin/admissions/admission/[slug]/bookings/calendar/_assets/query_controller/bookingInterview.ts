/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

export const bookingInterview = async ({ token, id, body }: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/interview/applications/${id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const fetchAssignedInterview = async ({ queryKey }: any) => {
  const [_, token, searchText] = queryKey;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/interview/interviewer/search?term=${searchText}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
