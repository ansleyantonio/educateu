import convertObjectKeys from "../utils/convertObjectKeys";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchAllListOfApplications = async ({ queryKey }: any) => {
  // Convert filterLists to query string format

  const { token, page, filterLists, search, limit } = queryKey[1] as any;

  const formattedFilterLists = convertObjectKeys(filterLists);

  const finalFilterList: Record<string, any> = {
    ...formattedFilterLists,
    page,
    pageSize: limit
  };
  if (search && search.trim() !== "") {
    finalFilterList.search = search;
  }
  // if filterLists is exists, set page to 1
  // let finalFilterList;
  // if (Object.keys(formattedFilterLists).length == 0) {
  //   finalFilterList = { ...formattedFilterLists, page };
  // } else {
  //   finalFilterList = { ...formattedFilterLists, page };
  // }
  const querySting = new URLSearchParams(finalFilterList).toString();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/application-management?${querySting}`,
      // `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentRole}/applications/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
