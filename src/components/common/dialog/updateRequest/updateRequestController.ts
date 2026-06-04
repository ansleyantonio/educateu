/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const updateRequestController = async (checkData: any) => {
  const { applicationId, body, token } = checkData;

  const responses = [];

  try {
    for (const item of body) {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${applicationId}`,
        item,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.statusCode !== 200) {
        throw new Error(
          `Request for "${item.attachmentName}" failed: ${response.data?.message}`,
        );
      }

      responses.push(response.data);
    }

    return {
      statusCode: 200,
      success: true,
      message: "All requests were successful",
      responses,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// export const updateRequestController = async (checkData: any) => {
//   const { applicationId, body, token } = checkData;
//
//   try {
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_API_URL}/admission/notes/application?applicationId=${applicationId}`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       return error.response?.data;
//     }
//     throw error;
//   }
// };
