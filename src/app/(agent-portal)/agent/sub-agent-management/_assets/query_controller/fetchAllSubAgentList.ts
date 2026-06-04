/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchAllSubAgents = async ({ queryKey }: { queryKey: any }) => {
  const { token, page, searchText } = queryKey[1];
  const queryString = `?page=${page}&name=${searchText}`;

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/sub-agent-management${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
