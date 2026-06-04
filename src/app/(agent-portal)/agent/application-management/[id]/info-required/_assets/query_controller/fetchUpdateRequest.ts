/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchUpdateRequest = async ({ queryKey }: { queryKey: any }) => {
  const { applicationId, token } = queryKey[1];

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application`,
      {
        params: {
          applicationId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log("Error fetching update requests:", error);
    return [];
  }
};
