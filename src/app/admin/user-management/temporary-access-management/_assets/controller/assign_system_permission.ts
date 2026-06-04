/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

export async function AssignSystemPermission(data: any) {
  const { body, token } = data;
  console.log("Data", data);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user_role/`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning system permission:", error);
    throw error;
  }
}

export async function TemporaryAccessPermission({ queryKey }: any) {
  const [, userId, token] = queryKey;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user-modules/permission/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function DeleteTemporaryAccess(data: any) {
  const { id, token } = data;
  console.log("Data", data);
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user-modules/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
}

export const fetchTemporaryAccessListOfUsers = async ({ queryKey }: any) => {
  const { page, searchText, TemporaryUserFilterData, token } = queryKey[1];
  const updateQueryBody = {
    ...TemporaryUserFilterData,
    search: searchText || "",
    page: page || 1,
  };
  try {
    const { data } = await axios.post(
      // `${process.env.NEXT_PUBLIC_API_URL}/user/users?portalCategoryName=admin`
      // `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users?permissionType=temporary`,
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/temp-users`,
      {
        ...updateQueryBody,
      },

      {
        // params: {
        //   page,
        //   portalCategoryName: category == "all" ? "" : category,
        //   search: searchText || "",
        // },
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
// export const fetchTemporaryAccessListOfUsers = async ({ queryKey }: any) => {
// <<<<<<< HEAD
//   const { page, category, searchText, token } = queryKey[1];
//   // console.log("token", token);
//   // const queryString = `?page=${page}&portalCategoryName=${category}&search=${searchText}`;
//   const queryString = `?page=${page || 1}&search=${searchText}`;
//   console.log("token", token);
//
// =======
//   const { page, searchText, TemporaryUserFilterData, token } = queryKey[1];
//   const updateQueryBody = {
//     ...TemporaryUserFilterData,
//     search: searchText || "",
//     page: page || 1,
//   };
// >>>>>>> preDevelopment
//   try {
//     const { data } = await axios.post(
//       // `${process.env.NEXT_PUBLIC_API_URL}/user/users?portalCategoryName=admin`
//       // `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users?permissionType=temporary`,
//       `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/temp-users`,
// <<<<<<< HEAD
//       {},
//
//       {
// =======
//       {
//         ...updateQueryBody,
//       },
//
//       {
// >>>>>>> preDevelopment
//         // params: {
//         //   page,
//         //   portalCategoryName: category == "all" ? "" : category,
//         //   search: searchText || "",
//         // },
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//
//     // console.log("user list data controller", data);
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };
