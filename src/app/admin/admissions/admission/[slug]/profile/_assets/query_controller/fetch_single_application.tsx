/* eslint-disable @typescript-eslint/no-explicit-any */
import { setApplicantStatusCookie } from "@/lib/applicanStageCookie";
import axios from "axios";

export const fetchSingleApplications = async ({ queryKey }: any) => {
  const { token, id } = queryKey[1];
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/profile/application/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    // Set applicant status in cookies based on response data
    const applicantStatus = response.data?.data?.application?.stage !== "NEW";
    setApplicantStatusCookie(applicantStatus);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
