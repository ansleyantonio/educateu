/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const setInterviewOutcome = async (data: any) => {
  const { token, id, body } = data;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/interview/interview-outcome/${id}`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response?.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    } else {
      console.error("Unexpected error:", error);
      return error;
    }
  }
};
