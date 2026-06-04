/* eslint-disable @typescript-eslint/no-explicit-any */

import { CookieStore } from "@/lib/CookieStore";

type ApiFunction<T> = () => Promise<T>;

export async function catchAsyncApi<T>(
  fn: ApiFunction<T>,
  logoutOn401: boolean = true,
): Promise<T | null> {
  try {
    const data = await fn();
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || error.message || "Unknown error";

    if (status === 401 && logoutOn401) {
      console.warn("[catchAsyncApi] Reason:", message);

      // signOut({
      //   callbackUrl: '/login?reason=' + encodeURIComponent(message),
      // });
      CookieStore.clearAuthCookieServer(error.request, error.response);
    } else {
      console.error("[catchAsyncApi] API error:", error?.response || error);
    }

    return null;
  }
}
