/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function admissionOutcome(data: any) {
  const { body, token, id } = data;
  console.log("body", body);
  //   console.log("id", id);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/submissions/outcome/${id}`,
      { ...body },
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
