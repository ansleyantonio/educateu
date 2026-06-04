/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/errorHandler.ts
import toast from "react-hot-toast";

export const handleApiError = (error: any, portalName: string) => {
  const status = error?.response?.status;

  if (status === 401) {
    toast.error("Unauthorized. Redirecting to login...");
    window.location.href = `/${portalName}/login`;
    return;
  }

  if (status === 403) {
    toast.error("Access denied.");
    window.location.href = "/forbidden";
    return;
  }

  // toast.error(message);

  return false;
  // console.error("API error:", error);
};
