import axios from "axios";
import { dataBody } from "../type";

export async function uploadSettingsData(data: dataBody) {
  const { token, formData } = data;

  console.log("Data-form:", typeof data);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/agent-settings`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("Response", response);
    return response.data;
  } catch (error) {
    console.error("Error assigning system permission:", error);
    throw error;
  }
}
