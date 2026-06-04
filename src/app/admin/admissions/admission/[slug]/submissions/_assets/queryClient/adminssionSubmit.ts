/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function admissionSubmission(data: any) {
  const { token, id } = data;
  console.log("token", token);
  console.log("id", id);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/submissions/submit/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning system permission:", error);
    throw error;
  }
}
