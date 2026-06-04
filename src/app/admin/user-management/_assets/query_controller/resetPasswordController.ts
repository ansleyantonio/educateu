import axios from "axios";

export const resetPasswordController = async ({
  id,
  token,
  newPassword,
}: {
  id: string;
  token: string;
  newPassword: string;
}) => {
  // console.log("id", id);
  const body = {
    newPassword: newPassword,
  };
  try {
    const { data } = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/update/password/${id}`,
      body,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
