import axios from "axios";

// import { catchAsyncApi } from "@/utils/catchAsyncApi";
// export async function fetchUserPermissions(
//   token: string | undefined,
//   userId: string | undefined,
// ) {
//   return await catchAsyncApi(async () => {
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/user-permission/modulelist/${userId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         timeout: 5000,
//       },
//     );
//     return response.data;
//   });
// }

export async function fetchUserPermissions(
  token: string | undefined,
  userId: string | undefined
) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-permission/modulelist/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      }
    );

    return response.data;
    //return successResponse;
    //return failResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // console.error("Axios error:", error.response?.data);
      return error.response?.data;
    } else {
      console.error("Unexpected error:", error);
      return error;
    }
  }
}
