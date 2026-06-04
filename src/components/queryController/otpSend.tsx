/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Controller function to update the agent profile
export const SendOptController = async (body: object, token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/communication/send-otp`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to update profile");
  }
};
