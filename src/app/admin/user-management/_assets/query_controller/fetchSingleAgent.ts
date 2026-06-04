/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchSingleAgent = async (id: string, token?: string) => {
  // console.log("id", id);
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/agents/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
