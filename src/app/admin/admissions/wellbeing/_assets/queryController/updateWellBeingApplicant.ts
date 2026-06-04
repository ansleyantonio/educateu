/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const updateWellBeingApplicant = async ({
  id,
  status,
  token,
}: {
  id: string;
  status: "APPROVED" | "REJECTED";
  token: string;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/wellbeing/wellbeing-check-status/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    return response.data;
  } catch (error: any) {
    console.error("Error updating well-being check status:", error);
    throw error;
  }
};
