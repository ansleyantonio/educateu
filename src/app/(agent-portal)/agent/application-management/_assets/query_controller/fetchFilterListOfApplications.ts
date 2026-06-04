/* eslint-disable @typescript-eslint/no-explicit-any */

import convertObjectKeys from "../utils/convertObjectKeys";

export const fetchFilterListOfApplications = async ({
  queryKey,
  token,
  body,
}: {
  queryKey: any[];
  token: string;
  page: string;
  body: any;
}) => {
  // Convert filterLists to query string format

  const formattedBody = {
    having: convertObjectKeys(body),
  };
  //   console.log("body controller", formattedBody);

  // const querySting = new URLSearchParams(filterQuery).toString();
  // console.log("querySting", querySting);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/agents/applications/filter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedBody),
      },
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
