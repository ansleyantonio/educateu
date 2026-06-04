import axios from "axios";

interface IDeviceInfo {
  id: string;
  token: string;
  userId: string;
  deviceIP?: string;
}

const deleteDeviceController = async ({
  id,
  token,
  userId,
  deviceIP,
}: IDeviceInfo) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/device/history/${userId}/${id}/deviceIP=${deviceIP}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};

export default deleteDeviceController;
