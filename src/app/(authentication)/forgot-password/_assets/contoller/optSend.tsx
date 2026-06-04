/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Controller function to update the agent profile
export const SendOptController = async (body: object) => {
  console.log("body controller", body);
  try {
    const response = await axios.post(
      `${API_URL}/auth-management/send-otp`,
      body,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error?.response?.data;
    } else {
      return error;
    }
  }
};
