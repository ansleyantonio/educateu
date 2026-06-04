import axios from "axios";

export const sessionTerminationController = async ({
  id,
  token,
}: {
  id: string;
  token: string;
}) => {
  console.log("id --- all out log", id);
  console.log("id --- all out token", token);

  try {
    const { data } = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/logout/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    console.error("API Error:", error);
  }
};
