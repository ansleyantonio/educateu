/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export interface FetchCalendarParams {
  month?: string;
  year?: number;
  token: string;
}

export const fetchInterviewCalendar = async ({ queryKey }: any) => {
  const [_, month, year, token] = queryKey;

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/calender`,
    {
      params: { month, year },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

