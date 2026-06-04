import axios from "axios";

interface props {
  token: string;
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

const ChangePasswordController = async ({ token, body }: props) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/communication/change-password`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // console.error("Axios error:", error.response?.data);
      return error.response?.data;
    } else {
      console.error("Unexpected error:", error);
      return error;
    }
  }
};

export default ChangePasswordController;
