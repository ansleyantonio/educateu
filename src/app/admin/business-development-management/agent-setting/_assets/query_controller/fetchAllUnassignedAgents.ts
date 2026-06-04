/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// export const fetchAllUnassignedAgents = async ({ queryKey }: any) => {
//   const { token } = queryKey[1];

//   try {
//     const { data } = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/unassign/users`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return data?.data?.agents ?? [];
//   } catch (error) {
//     console.error("Error fetching commission groups:", error);
//     throw error;
//   }
// };

export const fetchAllUnassignedAgents = async ({ queryKey }: any) => {
  const { agentType, token } = queryKey[1];

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/unassign/users`,
      {
        params: {
          agentType: agentType.toUpperCase(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data?.data ?? [];
  } catch (error) {
    console.error("Error fetching commission groups:", error);
    throw error;
  }
};
