// import { useAuths } from "@/hooks/userContext";
// import axios from "axios";

// export const fetchListOfUsers = async () => {
//   const auth = useAuths();
//   const token = auth?.user.token;
//   const userId = auth?.user.userId;
//   // const { page, category, searchText, token } = queryKey[1];
//   try {
//     const { data } = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/user-permission/modulelist/fc608fed-87d5-4499-b10b-14fb2131967e`,

//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     // console.log("user list data controller", data);
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };
