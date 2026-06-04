/* eslint-disable @typescript-eslint/no-explicit-any */

// Add proper type definitions
interface AuthData {
  token: string;
  userId: string;
  portName: string;
  [key: string]: any;
}

export type { AuthData };

// import type { NextRequest, NextResponse } from "next/server";

/* Client side cookie set - ENHANCED WITH DEBUGGING */
// export const setCookieClient = <T extends object>(
//   name: string,
//   data: T,
//   days = 7,
// ): void => {
//   if (typeof document === "undefined") {
//     // console.warn("❌ Cannot set cookie on server");
//     return;
//   }
//
//   try {
//     const encoded = encodeURIComponent(JSON.stringify(data));
//     const expires = new Date(Date.now() + days * 864e5).toUTCString();
//
//     const isSecure = location.protocol === "https:";
//     const cookieString = `${name}=${encoded}; path=/; expires=${expires}; ${
//       isSecure ? "SameSite=None; Secure" : "SameSite=Lax"
//     }`;
//
//     document.cookie = cookieString;
//
//     // console.log("🍪 Client cookie set:", name);
//     // console.log("📦 Cookie preview:", cookieString.slice(0, 100) + "...");
//
//     // ✅ Delay check for better accuracy
//     setTimeout(() => {
//       const value = getCookieClient<T>(name);
//       console.log(
//         "🔍 Cookie verification after delay:",
//         value ? "SUCCESS ✅" : "FAILED ❌",
//         value,
//       );
//     }, 100);
//   } catch (error) {
//     // console.error("❌ Error setting client cookie:", error);
//   }
// };
//
// /* Server side cookie set - ENHANCED */
// export const setCookieServer = <T extends object>(
//   response: NextResponse,
//   name: string,
//   data?: T,
//   days = 7,
// ): void => {
//   try {
//     const encoded = encodeURIComponent(JSON.stringify(data));
//     const maxAge = days * 86400; // in seconds
//
//     // Overwrite if it already exists (NextResponse handles this automatically)
//     response.cookies.set(name, encoded, {
//       path: "/",
//       maxAge,
//       httpOnly: false, // Set true if you want to block client-side JS access
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });
//
//     console.log("🍪 Server cookie set:", name);
//   } catch (error) {
//     console.error("❌ Error setting server cookie:", error);
//   }
// };
//
// /* Client side cookie get - ENHANCED WITH DEBUGGING */
// export const getCookieClient = <T = unknown>(name: string): T | null => {
//   if (typeof document === "undefined") return null;
//
//   try {
//     const allCookies = document.cookie;
//     const cookies = allCookies ? allCookies.split("; ") : [];
//     const found = cookies.find((c) => c.startsWith(`${name}=`));
//     if (!found) {
//       console.log(
//         // `🍪 Cookie '${name}' not found`,
//         cookies.map((c) => c.split("=")[0]),
//       );
//       return null;
//     }
//     const value = decodeURIComponent(found.split("=")[1] || "");
//     return JSON.parse(value) as T;
//   } catch (err) {
//     // console.error(`❌ Error parsing cookie '${name}':`, err);
//     return null;
//   }
// };
//
// /* Server side cookie get - ENHANCED WITH DEBUGGING */
// export const getCookieServer = <T = AuthData>(
//   req: NextRequest,
//   name: string,
// ): T | null => {
//   try {
//     // Log all available cookies
//     const allCookies = req.cookies.getAll();
//     console.log(
//       "🍪 Server cookies available:",
//       allCookies.map((c) => c.name),
//     );
//
//     const cookie = req.cookies.get(name);
//     if (!cookie?.value) {
//       // console.log(`🍪 Server cookie '${name}' not found`);
//       return null;
//     }
//
//     // console.log(
//     //   `🍪 Server cookie '${name}' found, value length:`,
//     //   cookie.value.length,
//     // );
//
//     const value = decodeURIComponent(cookie.value);
//     const parsed = JSON.parse(value) as T;
//     // console.log(`🍪 Server cookie '${name}' parsed successfully`);
//     return parsed;
//   } catch (err) {
//     // console.error(`❌ Error parsing server cookie '${name}':`, err);
//     return null;
//   }
// };
//
// /* Enhanced cookie clearing */
// const clearAuthCookieClient = () => {
//   // console.log("🧹 Clearing client auth cookie");
//   if (typeof window !== "undefined") {
//     // Multiple clearing attempts
//     const clearMethods = [
//       "authData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax",
//       "authData=; path=/; max-age=0; SameSite=Lax",
//       "authData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
//     ];
//
//     clearMethods.forEach((method) => {
//       document.cookie = method;
//     });
//
//     // Verify clearing
//     setTimeout(() => {
//       const verification = getCookieClient("authData");
//       console.log(
//         "🔍 Cookie clear verification:",
//         verification ? "FAILED" : "SUCCESS",
//       );
//     }, 10);
//   }
// };
//
//
// function clearAuthCookieServer(req: NextRequest, res: NextResponse): void {
//   // console.log("🧹 Clearing server auth cookie");
//   res.cookies.set("authData", "", {
//     maxAge: 0,
//     path: "/",
//     httpOnly: false,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });
// }
//
//
//
//
// export const CookieStore = {
//   setCookieClient,
//   setCookieServer,
//   getCookieClient,
//   getCookieServer,
//   clearAuthCookieClient,
//   clearAuthCookieServer,
// };

// lib/authCookie.ts - Update this function
export function getAuthCookieFromRequest(cookieHeader: string) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc: any, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      try {
        // Try to parse as JSON first
        acc[key] = JSON.parse(decodeURIComponent(value));
      } catch {
        // If not JSON, store as string
        acc[key] = decodeURIComponent(value);
      }
    }
    return acc;
  }, {});

  return cookies.authData || null;
}

// lib/CookieStore.ts - Ensure consistent cookie setting
import { NextRequest, NextResponse } from "next/server";

export class CookieStore {
  // Client-side cookie operations
  static setCookieClient(name: string, value: any, days: number = 7) {
    if (typeof window === "undefined") return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    const cookieValue = JSON.stringify(value);
    document.cookie = `${name}=${encodeURIComponent(
      cookieValue
    )}; expires=${expires.toUTCString()}; path=/; SameSite=lax`;

    // Trigger custom event for cross-tab sync
    window.dispatchEvent(
      new CustomEvent("cookieChange", {
        detail: { name, value },
      })
    );
  }

  static getCookieClient(name: string) {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split(";");
    const targetCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${name}=`)
    );

    if (!targetCookie) return null;

    const value = targetCookie.split("=")[1];
    if (!value) return null; // TODO
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return decodeURIComponent(value); // TODO
      // return null;
    }
  }

  static clearAuthCookieClient() {
    if (typeof window === "undefined") return;

    document.cookie =
      "authData=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=lax";

    // Trigger custom event for cross-tab sync
    window.dispatchEvent(
      new CustomEvent("cookieChange", {
        detail: { name: "authData", value: null },
      })
    );
  }

  // Server-side cookie operations
  static clearAuthCookieServer(req: NextRequest, response: NextResponse) {
    // Clear the cookie by setting it to expire in the past
    response.cookies.set("authData", "", {
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
    });

    return response;
  }

  static setCookieServer(
    response: NextResponse,
    name: string,
    value: any,
    days: number = 7
  ) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    response.cookies.set(name, JSON.stringify(value), {
      expires,
      path: "/",
      sameSite: "lax",
    });

    return response;
  }
}
