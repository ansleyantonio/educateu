import { authData } from "@/type/authUser";
import { NextResponse } from "next/server";

export const setAuthCookies = (data: authData) => {
  if (typeof window !== "undefined") {
    const isHTTPS = window.location.protocol === "https:";

    document.cookie = `authData=${encodeURIComponent(JSON.stringify(data))}; path=/; ${
      isHTTPS ? "Secure; SameSite=Strict" : "SameSite=Lax"
    }`;
  }
};

// Get cookie on the client side
export const getAuthCookies = (): authData | null => {
  if (typeof window !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("authData="));

    if (cookie) {
      try {
        const cookieValue = cookie.split("=")[1];
        const decodedValue = decodeURIComponent(cookieValue);
        return JSON.parse(decodedValue);
      } catch (error) {
        console.error("Error parsing authData cookie:", error);
        return null;
      }
    }
  }
  return null;
};

// Parse cookies from request headers
export const parseCookies = (
  cookieHeader: string | undefined,
): Record<string, string> => {
  const cookies: Record<string, string> = {};

  if (cookieHeader) {
    cookieHeader.split("; ").forEach((cookie) => {
      const [key, value] = cookie.split("=");
      cookies[key] = decodeURIComponent(value);
    });
  }

  return cookies;
};

// Get auth data from cookies
export const getAuthCookieFromRequest = (
  cookieHeader: string | undefined,
): authData | null => {
  const cookies = parseCookies(cookieHeader);
  const authCookie = cookies["authData"];

  if (authCookie) {
    try {
      return JSON.parse(authCookie) as authData;
    } catch (error) {
      console.error("Error parsing authData cookie:", error);
      return null;
    }
  }

  return null;
};

//Delete cookie on the client side
export const deleteAuthCookie = () => {
  console.log("Hited Delete Auth Cookie");
  if (typeof window !== "undefined") {
    document.cookie =
      "authData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  }
};

// Delete cookie in middleware
export const clearAuthCookies = (response: NextResponse): NextResponse => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieNames = ["authData", "session", "token", "refreshToken"];

  cookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      domain: process.env.COOKIE_DOMAIN,
    });

    // Double deletion for maximum compatibility
    response.cookies.delete(name);
  });

  return response;
};
