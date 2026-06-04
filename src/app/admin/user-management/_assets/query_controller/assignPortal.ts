import axios from "axios";

interface postData {
  token: string;
  userId: string;
  portalCategoryId: string[];
}

export const AssignPortal = async (data: postData) => {
  const body = {
    userId: data.userId,
    portalCategoryId: data.portalCategoryId,
  };

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/assign/portal`,
      body,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning portal:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};
