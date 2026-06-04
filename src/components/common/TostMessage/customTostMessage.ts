/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/toast.ts
import { TextCaseFormat } from "@/utils/textFormate";
import toast, { ToastOptions } from "react-hot-toast";
import { showAlert } from "./customToastModal/toastModal";
import { ToastMessageChange } from "./errorMessageChange";

type ToastType = "success" | "error" | "loading" | "custom";

const defaultOptions: ToastOptions = {
  duration: 3000, // 3 seconds
  position: "top-center",
};

export const showToast = (
  type: ToastType,
  message: any,
  options?: ToastOptions,
  //
  toastType: "modal" | "toast" = "modal" // default value here
) => {
  const config = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      // console.log("success messages=====", message);
      if (typeof message !== "string") {
        message =
          message.data?.message || message.message || "Successfully updated";
      }

      message = ToastMessageChange(message);
      message = TextCaseFormat(message);

      //   message = message.error.response?.data?.message || "Something went wrong";
      // hot tost message
      if (toastType === "toast") {
        toast.success(message, config);
      }
      if (toastType === "modal") {
        showAlert({
          type: "success",
          // title: "Active Session Warning",
          description: message,
          cancelText: "Close",
          showCancel: true,
          duration: 90000,
        });
      }

      // Swal.fire({
      //   title: message,
      //   icon: "success",
      //   draggable: true,
      // });

      break;
    case "error":
      if (typeof message !== "string") {
        message =
          message?.message ||
          message.response?.data?.message ||
          message.response?.message ||
          message.data?.message ||
          message.Prisma ||
          "Something went wrong";
      }
      message = ToastMessageChange(message);
      message = TextCaseFormat(message);
      // hot tost message
      // hot tost message
      if (toastType === "toast") {
        toast.success(message, config);
      }
      if (toastType === "modal") {
        // call alertDialog component
        showAlert({
          type: "error",
          // title: "Active Session Warning",
          description: message,
          // confirmText: "Override",
          cancelText: "Close",
          showCancel: true,
          duration: 90000,
        });
      }
      break;
    case "loading":
      toast.loading(message, config);
      break;
    case "custom":
      toast(message, config);
      break;
    default:
      toast(message, config);
  }
};

// Optional: export shortcuts
export const toastSuccess = (msg: string, options?: ToastOptions) =>
  showToast("success", msg, options);

export const toastError = (msg: string, options?: ToastOptions) =>
  showToast("error", msg, options);

export const toastLoading = (msg: string, options?: ToastOptions) =>
  showToast("loading", msg, options);
