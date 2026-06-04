/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const fetchListOfUsers = async ({ queryKey }: any) => {
  const { page, category, searchText, token } = queryKey[1];
  // console.log("token", token);
  // const queryString = `?page=${page}&portalCategoryName=${category}&search=${searchText}`;
  try {
    const { data } = await axios.get(
      // `${process.env.NEXT_PUBLIC_API_URL}/user/users?portalCategoryName=admin`
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users/`,
      {
        params: {
          page,
          portalCategoryName: category == "all" ? "" : category,
          search: searchText || "",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // console.log("user list data controller", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
