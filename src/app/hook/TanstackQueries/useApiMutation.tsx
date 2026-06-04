/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useApiMutation.ts
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { useMutation } from "@tanstack/react-query";
import { handleApiError } from "../utils/errorHandler";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type MutationConfig = {
  safe?: boolean;
  method: "POST" | "PATCH" | "DELETE" | "PUT";
  path: string;
  token?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  dataType?: "application/json" | "multipart/form-data";
  responseType?: "json" | "blob" | "arraybuffer" | "text";
  isSuccessToast?: boolean;
  isErrorToast?: boolean;
};

export const useApiMutation = ({
  responseType = "json",
  safe = true,
  method,
  path,
  token,
  onSuccess,
  onError,
  dataType,
  isSuccessToast = true,
  isErrorToast = true,
}: MutationConfig) => {
  const user = useAuths();
  const portalName: string = user?.user?.portName ?? "/admin";
  if (token == "" || token == undefined || token == null) {
    token = user?.user?.token;
  }

  return useMutation({
    mutationFn: async (Body: any) => {
      // console.log("Body", JSON.stringify(Body));
      // const body = Body;
      // if (dataType !== "multipart/form-data") {
      //   body = JSON.stringify(RemoveEmptyFields(Body));
      // }

      try {
        const response = await fetch(`${API_URL}/${path}`, {
          method,
          headers:
            dataType === "multipart/form-data"
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
          body:
            dataType === "multipart/form-data"
              ? Body
              : JSON.stringify(safe ? RemoveEmptyFields(Body) : Body),
        });

        // const responseData = await response.json(); //
        // return responseData;
        let parsedData;
        if (responseType === "blob") {
          parsedData = await response.blob();
        } else if (responseType === "arraybuffer") {
          parsedData = await response.arrayBuffer();
        } else if (responseType === "text") {
          parsedData = await response.text();
        } else {
          parsedData = await response.json().catch(() => ({})); // in case no
        }

        if (!response.ok) {
          console.error("API mutation error", parsedData);
          throw {
            response: {
              status: response.status,
              data: parsedData,
            },
          };
        }
        return parsedData;
      } catch (error: any) {
        throw error; // Let React Query handle it
      }
    },

    onSuccess: (data) => {
      // onSuccess?.(data);
      // if onSuccess is provided, use it
      if (onSuccess) {
        onSuccess(data);
        return;
      } else {
        // if not provided, use the default success handler
        if (isSuccessToast) {
          showToast("success", data);
        }
        return;
      }
      // if not provided, use the default success handler
    },
    onError: (error: any) => {
      console.error("API mutation error:", error);
      // if 401 error, redirect to login
      const handled = handleApiError(error, portalName);
      if (handled) return; // stop further execution

      if (onError) {
        //  If user provided onError, use it
        onError(error);
        return;
      } else {
        // if not provided, use the default error handler
        if (isErrorToast) {
          showToast("error", error);
        }
        return;
      }
    },
  });
};
