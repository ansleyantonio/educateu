/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { fetchUserPermissions } from "./lib/auth";
import { getAuthCookieFromRequest } from "./lib/authCookie";
import { CookieStore } from "./lib/CookieStore";

interface ModulePermission {
  moduleId: string;
  moduleName: string;
  modulePermission: string[];
  permissionType: string;
  permissionStartDate: string | null;
  permissionEndDate: string | null;
  manualRevocation: boolean;
}

interface PortalPermission {
  portalName: string;
  portalCategoryId: string;
  modules: ModulePermission[];
}

export async function middleware(req: NextRequest) {
  console.log("\x1b[35mMiddleware Running...\x1b[0m 📦");
  const { pathname } = req.nextUrl;
  const method = req.method;
  const url = req.url;
  const pathSegments = pathname.split("/");
  const portal = pathSegments[1];
  const moduleName = pathSegments[2];
  const groupModuleName = pathSegments[3];

  // Skip login and forbidden pages
  if (
    [
      "/admin/login",
      "/agent/login",
      "/forbidden",
      "/admin/finance/payments",
      "/agent/commissions",
      "/manual-payment",
    ].some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/manual-payment")
  ) {
    return NextResponse.next();
  }

  // Get auth cookie data

  const cookieHeader = req.headers.get("cookie") || "";

  let authData = await getAuthCookieFromRequest(cookieHeader);

  // If no authData, try to get it from the cookie
  if (!authData) {
    console.log("No authData found, trying to get it from cookie");
    authData = getAuthCookieFromRequest(cookieHeader);
  }

  // ToDo start -------------------------------
  const { token, userId } = authData || {};

  // // If no token/userId, redirect to login
  // if (!token || !userId) {
  //   console.log(" No token or userId found, redirecting to login");
  //   return redirectToLogin(portal, req, true, "No token or userId");
  // }

  try {
    // Fetch permission info from backend
    const permissionInfo = await fetchUserPermissions(token, userId);
    // console.log(" Permission info:", permissionInfo);

    // If token expired or unauthorized
    // if (
    //   permissionInfo?.status === "error" ||
    //   permissionInfo?.statusCode === 401
    // ) {
    //   console.log(" Permission check failed:", permissionInfo?.message);
    //   return redirectToLogin(
    //     portal,
    //     req,
    //     true,
    //     permissionInfo?.message || "Session expired or unauthorized"
    //   );
    // }

    // If internal error or bad structure
    const permissions = permissionInfo?.data;
    // console.log(" Permissions:", permissions);
    if (!Array.isArray(permissions)) {
      console.log(" Invalid permissions structure-middleware", permissions);
      return NextResponse.redirect(new URL("/forbidden", url));
    }

    // Allow global non-restricted routes
    const globalRoutes = ["/profile", "/settings", "/password"].map(
      (route) => `/${portal}${route}`
    );
    if (globalRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Find portal access
    const portalPermissions = permissions.find(
      (p: PortalPermission) => p.portalName === portal
    );
    if (!portalPermissions) {
      console.log(" No portal permissions for:middleware", portal);
      return NextResponse.redirect(new URL("/forbidden", url));
    }

    // Find module access
    const modulePermissions = portalPermissions.modules.find(
      (m: ModulePermission) =>
        m.moduleName === moduleName || m.moduleName === groupModuleName
    );
    if (!modulePermissions) {
      console.log(" No module permissions for:middleware", moduleName);
      return NextResponse.redirect(new URL("/forbidden", url));
    }

    // Check method access
    if (!modulePermissions.modulePermission.includes(method)) {
      console.log(" Method not allowed:", method);
      return NextResponse.redirect(new URL("/forbidden", url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error(" Middleware error:", error);
    return redirectToLogin(portal, req, true, "Authentication error");
  }
}
//-------------------- ToDo end -------------------------------
// Helper to redirect to login and optionally clear cookies
function redirectToLogin(
  portal: string,
  req: NextRequest,
  clearCookies = false,
  reason: string = "Session expired"
) {
  const redirectUrl = new URL(`/${portal}/login`, req.url);
  redirectUrl.searchParams.set("reason", reason);
  console.log("🔒 Reason~", reason);

  const response = NextResponse.redirect(redirectUrl);

  if (clearCookies) {
    // Use server-side cookie clearing
    CookieStore.clearAuthCookieServer(req, response);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path((?!login).*)", "/agent/:path((?!login).*)"],
};
