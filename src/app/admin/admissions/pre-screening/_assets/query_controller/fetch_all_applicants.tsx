import axios from "axios";
import { QueryFunction } from "@tanstack/react-query";

type FetchApplicantsQueryKey = [string, number | string, string | undefined];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchAllApplicants: QueryFunction<any, FetchApplicantsQueryKey> = async ({
  queryKey,
}) => {
  const [_, currentPage, token] = queryKey;
  const page = currentPage ? currentPage : "1";

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/pre-screening?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all applicants:", error);
    throw error;
  }
};