/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { LoginType } from "../schema/loginFormSchema";

interface LoginControllerProps {
  loginInfo: LoginType;
  portalName: string;
}

const loginController = async ({
  loginInfo,
  portalName,
}: LoginControllerProps) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login?userportal=${portalName}`,
      loginInfo,
    );
    return response;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      return error.response?.data;
    } else {
      console.error("Unexpected error:", error);
      return error;
    }
  }
};

export default loginController;
