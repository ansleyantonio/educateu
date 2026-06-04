/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchListOfPortalList = async ({ queryKey }: any) => {
  //console.log("token .. atik", queryKey[1].token);
  // const page = queryKey[1].page;
  // console.log("page controller", typeof page);
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/portal`,
      {
        headers: {
          Authorization: `Bearer ${queryKey[1].token}`,
        },
      }
    );
    // console.log("data controller", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
