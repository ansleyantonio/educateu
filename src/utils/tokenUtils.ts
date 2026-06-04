import { NextRequest, NextResponse } from "next/server";

// Utility to handle localStorage operations only on client side
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
};

// Access token functions
export const getAccessToken = (): string | null =>
  safeLocalStorage.getItem("accessToken");

export const setAccessToken = (token: string): void =>
  safeLocalStorage.setItem("accessToken", token);

// export const setAccessTokenForceFullyLogin = (token: string): void =>
//   safeLocalStorage.setItem("accessTokenForceFullyLogin", token);
//
// export const getAccessTokenForceFullyLogin = (): string | null =>
//   safeLocalStorage.getItem("accessTokenForceFullyLogin");
//
// export const clearAccessTokenForceFullyLogin = (): void => {
//   safeLocalStorage.removeItem("accessTokenForceFullyLogin");
// };

// Refresh token functions
export const getRefreshToken = (): string | null =>
  safeLocalStorage.getItem("refreshToken");

export const setRefreshToken = (token: string): void =>
  safeLocalStorage.setItem("refreshToken", token);

// Clear tokens on logout
export const clearTokens = (): void => {
  safeLocalStorage.removeItem("accessToken");
  safeLocalStorage.removeItem("refreshToken");
};

export const clearLocalTokens = (req: NextRequest, response: NextResponse) => {
  const tokenNames = ["accessToken", "accessTokenForceFullyLogin"];

  tokenNames.forEach((name) => {
    // Delete cookies safely for both dev and prod
    response.cookies.set(name, "", {
      value: "", // explicitly clear value
      maxAge: 0, // expire immediately
      expires: new Date(0), // force expiration
      path: "/", // must match the original path
      httpOnly: true, // must match the original cookie
      secure: process.env.NODE_ENV === "production", // only use secure in prod
      sameSite: "lax", // match original if possible
    });
  });

  return response;
};
