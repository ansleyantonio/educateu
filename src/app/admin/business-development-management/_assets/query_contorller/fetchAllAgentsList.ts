/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchListOfAgents = async ({ queryKey }: any) => {
  const { page, status, agentType, searchText, token } = queryKey[1];
  // console.log("token", token);
  // const queryString = `?page=${page}&portalCategoryName=${category}&search=${searchText}`;
  try {
    const { data } = await axios.get(
      // `${process.env.NEXT_PUBLIC_API_URL}/user/users?portalCategoryName=admin`
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/`,
      {
        params: {
          page,
          name: searchText || "",
          status: status == "all" ? "" : status,
          agentType: agentType == "all" ? "" : agentType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log("user list data controller", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
