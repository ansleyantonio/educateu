// import { CookieStore } from "@/lib/CookieStore";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef } from "react";
// import toast from "react-hot-toast";

// const InactivityTracker = (
//   redirectPath?: string,
//   logoutTime: number = 1,
//   debounceTime: number = 3000
// ) => {
//   const timeout = logoutTime * 60 * 1000;
//   const logoutTimer = useRef<NodeJS.Timeout | null>(null);
//   const debounceTimer = useRef<NodeJS.Timeout | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const handleLogout = () => {
//       // session or localstorage clear
//       CookieStore.clearAuthCookieClient();
//       toast.success(
//         `You’ve been logged out due to ${logoutTime} minutes of inactivity. Please log in again to continue.`
//       );
//       //   localStorage.removeItem("your_token");
//       router.push(`${redirectPath}`);
//     };

//     const startLogoutTimer = () => {
//       if (logoutTimer.current) clearTimeout(logoutTimer.current);
//       logoutTimer.current = setTimeout(handleLogout, timeout);
//     };

//     const handleActivity = () => {
//       if (debounceTimer.current) clearTimeout(debounceTimer.current);

//       debounceTimer.current = setTimeout(() => {
//         startLogoutTimer();
//       }, debounceTime);
//     };

//     const events = [
//       "mousemove",
//       "mousedown",
//       "keydown",
//       "scroll",
//       "touchstart",
//     ];
//     events.forEach((event) => window.addEventListener(event, handleActivity));

//     handleActivity(); // Start timer initially

//     return () => {
//       if (logoutTimer.current) clearTimeout(logoutTimer.current);
//       if (debounceTimer.current) clearTimeout(debounceTimer.current);
//       events.forEach((event) =>
//         window.removeEventListener(event, handleActivity)
//       );
//     };
//   }, [router]); // ensure router is inside the effect
// };

// export default InactivityTracker;

// "use client";
//Browser-wide inactivity tracking,
"use client";

import { useAuths } from "@/hooks/userContext";
import { CookieStore } from "@/lib/CookieStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const InactivityTracker = (
  redirectPath: string,
  logoutTime: number = 1, // in minutes
  debounceTime: number = 3000
) => {
  // first check if user is logged in
  const user = useAuths();
  const pathName = usePathname();

  const timeout = logoutTime * 60 * 1000;
  const checkInterval = 10000; // check every 10s
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const intervalTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (pathName.includes("login")) return; // ⛔ stop if on login page
    if (!user?.user?.token) return; // ⛔ stop if not logged in

    const now = () => new Date().getTime();

    // Cleanup previous logout state on load
    localStorage.removeItem("isLoggedOut");

    // Logout function, only triggers once across tabs
    const handleLogout = () => {
      if (localStorage.getItem("isLoggedOut") === "true") return; // prevent duplicate logout
      localStorage.setItem("isLoggedOut", "true");

      CookieStore.clearAuthCookieClient();

      toast.success(
        `You’ve been logged out due to ${logoutTime} minutes of inactivity.`,
        {
          duration: 6000, // 6 second in milliseconds
        }
      );

      // add parameters to redirect path
      redirectPath += `?reason=Inactivity`;
      router.push(redirectPath);
      // Hard redirect in all tabs to ensure reload
      // window.location.href = redirectPath;

      // Inform other tabs
      channel.current?.postMessage("logout");
    };

    // Update global last activity time
    const updateActivity = () => {
      localStorage.setItem("lastActivity", now().toString());
      channel.current?.postMessage("activity");
    };

    //  User action → reset timer
    const handleActivity = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(updateActivity, debounceTime);
    };

    //  Check for inactivity every few seconds
    const startIntervalCheck = () => {
      intervalTimer.current = setInterval(() => {
        const lastActivity = parseInt(
          localStorage.getItem("lastActivity") || "0"
        );
        if (now() - lastActivity > timeout) {
          handleLogout();
        }
      }, checkInterval);
    };

    // Listen for broadcast events
    channel.current = new BroadcastChannel("activity_channel");

    channel.current.onmessage = (event) => {
      if (event.data === "logout") {
        handleLogout();
      } else if (event.data === "activity") {
        localStorage.setItem("lastActivity", now().toString());
      }
    };

    // 👂 Add event listeners for user activity
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    //  Initialize on mount
    updateActivity(); // mark as active now
    startIntervalCheck();

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (intervalTimer.current) clearInterval(intervalTimer.current);
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      channel.current?.close();
    };
  }, [router, redirectPath, logoutTime, debounceTime]);
};

export default InactivityTracker;
