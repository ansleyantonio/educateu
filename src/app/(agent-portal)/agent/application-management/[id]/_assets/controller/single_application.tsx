/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchSingleApplication = async ({ queryKey }: any) => {
  const { ApplicationId, token } = queryKey[1];
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/application-management/${ApplicationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const json = await data.json();
  // console.log("controller application data", json);
  return json;
};
