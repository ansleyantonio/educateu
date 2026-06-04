/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

export const updateGeneralFileCheck = async (checkData: any) => {
  // console.log("checkData", checkData);
  const { applicationId, body, token } = checkData;
  // console.log("data", body);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/checks/general-file-checks/${applicationId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const NoteGeneralFileCheck = async (checkData: any) => {
  const { applicationId, body, token } = checkData;
  try {
    const responses = await Promise.all(
      body.map(async (item: any) => {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${applicationId}`,
          item,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      })
    );
    return {
      statusCode: 200,
      message: "Successfully note(s) added",
      data: responses,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export const updateAdditionalFileCheck = async (checkData: any) => {
  console.log("checkData", checkData);
  const { applicationId, body, token } = checkData;
  console.log("data", body);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/additional-file-check/general-file-checks/${applicationId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
