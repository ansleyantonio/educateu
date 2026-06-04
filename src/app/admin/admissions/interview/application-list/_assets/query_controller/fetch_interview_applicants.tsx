/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchInterviewApplicants = async ({ queryKey }: any) => {
  const [_, currentPage, token] = queryKey;
  const page = currentPage ? currentPage : "1";

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/interview/applications?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all applicants:", error);
    throw error;
  }
};
