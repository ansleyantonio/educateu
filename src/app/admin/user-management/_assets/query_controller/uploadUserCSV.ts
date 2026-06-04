import axios from "axios";

interface UploadUserCSV {
  token: string;
  formData: FormData;
}

export const uploadUserCSV = async ({ token, formData }: UploadUserCSV) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user-modules/import/users`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message,
        errors: data.errors || [],
      };
    }

    return {
      success: true,
      message: data.message,
      count: data.count,
      users: data.users,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      return {
        success: false,
        message: data.message || "Request failed",
        errors: data.errors || [],
      };
    }

    return {
      success: false,
      message: "Something went wrong",
      errors: [],
    };
  }
};