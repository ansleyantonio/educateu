/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

export const fetchAssessmentInvitationsData = async ({ queryKey }: any) => {
  try {
    const [_, token, id, page] = queryKey;

    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${id}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const addNoteController = async ({ token, data }: any) => {
  const { applicationId, body } = data;
  console.log("data", body);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${applicationId}`,
      body,
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

export const fetchInterviewReminder = async ({ queryKey }: any) => {
  try {
    const [_, token, id, page] = queryKey;

    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${id}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
