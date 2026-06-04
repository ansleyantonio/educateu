// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";

// type Commission = {
//   studentRangeLower: number;
//   studentRangeUpper: number;
//   rate: number;
//   bonus: number;
// };

// export const createAgentCommissionRate = async ({
//   token,
//   commissionGroupId,
//   commissions,
// }: {
//   token: string;
//   commissionGroupId: string;
//   commissions: Commission[];
// }) => {
//   try {
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/groups/commissions`,
//       {
//         commissionGroupId,
//         commissions,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return response.data;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || "Failed to post commission data";
//     const errorCode = error?.response?.data?.errorCode || "UNKNOWN_ERROR";
//     const statusCode = error?.response?.data?.statusCode || 500;
//     let dynamicMessage = errorMessage;

//     if (error?.response?.data?.message) {
//       if (error?.response?.data?.message.includes("Gap between ranges")) {
//         const rangeError = error?.response?.data?.message; 
//         dynamicMessage = `Invalid Range: ${rangeError}`;
//       } else if (error?.response?.data?.message.includes("Invalid rate")) {
//         dynamicMessage = "The rate provided is invalid. Please check your input.";
//       }
     
//     }

//     throw {
//       message: dynamicMessage,
//       code: errorCode,
//       status: statusCode,
//       details: error?.response?.data?.details || null, 
//     };
//   }
// };
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

type Commission = {
  studentRangeLower: number;
  studentRangeUpper: number;
  rate1: number;
  rate2: number;
  rate3: number;
  rate4: number;
};

export const createAgentCommissionRate = async ({
  token,
  commissionGroupId,
  commissions,
  bonus,
  studentLimit
}: {
  token: string;
  commissionGroupId: string;
  commissions: Commission[];
  bonus?: number;
  studentLimit?: number;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/groups/commissions`,
      {
        commissionGroupId,
        commissions,
        bonus,
        studentLimit
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || "Failed to post commission data";
    const errorCode = error?.response?.data?.errorCode || "UNKNOWN_ERROR";
    const statusCode = error?.response?.data?.statusCode || 500;
    let dynamicMessage = errorMessage;

    if (error?.response?.data?.message) {
      if (error?.response?.data?.message.includes("Gap between ranges")) {
        const rangeError = error?.response?.data?.message; 
        dynamicMessage = `Invalid Range: ${rangeError}`;
      } else if (error?.response?.data?.message.includes("Invalid rate")) {
        dynamicMessage = "The rate provided is invalid. Please check your input.";
      }
     
    }

    throw {
      message: dynamicMessage,
      code: errorCode,
      status: statusCode,
      details: error?.response?.data?.details || null, 
    };
  }
};