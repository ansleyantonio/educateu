// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// const useFetchData = ({
//   queryKey,
//   api,
//   search = "",
//   page = "",
//   enabled,
// }: any) => {
//     const queryString = `?page=${page}&portalCategoryName=${category}&search=${searchText}`;
//   const { data, isLoading, refetch, isSuccess } = useQuery({
//     queryKey: [queryKey, { search, page }],

//     queryFn: async () => {
//       const { data } = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/user/users?portalCategoryName=admin`,
//         // `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users/`,
//         // {
//         //   params: {
//         //     page,
//         //     portalCategoryName: category == "all" ? "" : category,
//         //     search: searchText || "",
//         //   },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//     },
//     retry: 3, //Number of times the query will retry on failure.
//     refetchOnWindowFocus: false,
//     enabled: enabled,
//   });

//   return { data, isLoading, refetch, isSuccess };
// };

// export default useFetchData;
