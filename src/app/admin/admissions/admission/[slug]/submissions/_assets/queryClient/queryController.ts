/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

// export const getApplicantNoteController = async ({ queryKey }: any) => {
//   try {
//     const [_, token, id] = queryKey;
//     const { data } = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${id}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );
//     return data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       return error.response?.data;
//     }
//     throw error;
//   }
// };

export const outComeController = async ({ token, data }: any) => {
  console.log("data", data);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admission/notes`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};
