// // export default ProtectedAgentRoute;
// "use client";
// import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useAuth } from "../hook/userContext";

"use client";

import { useAuths } from "@/hooks/userContext";
import { CookieStore } from "@/lib/CookieStore";
import { AuthResponse } from "@/type/IAuth";
import { usePathname, useRouter } from "next/navigation";

const AgentProtectedAgentRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuths();
  const router = useRouter();
  const LocalUserInfo: AuthResponse | null =
    CookieStore.getCookieClient("authData");
  let portalCategory;
  if (LocalUserInfo && (LocalUserInfo?.portName as string)) {
    portalCategory = LocalUserInfo?.portName;
  }
  // const [loading, setLoading] = useState(true);
  const PortAccess = auth?.user?.portName;

  const pathname = usePathname();
  const LoginPage = pathname === `/agent/login`;
  if (LoginPage) {
    return <>{children}</>;
  }

  if (auth?.user === null || !PortAccess || PortAccess !== "agent") {
    router.replace("/agent/login");
    // setLoading(false);
  }

  return auth?.user && PortAccess === "agent" ? children : null;
};

export default AgentProtectedAgentRoute;

// "use client";

// import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
// import { useAuths } from "@/hooks/userContext";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// const AgentProtectedAgentRoute = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const auth = useAuths();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if the user is authenticated and has the correct portName
//     if (auth?.user && auth.user.portName === "agents") {
//       setLoading(false); // User is authenticated and has access
//       return;
//     }

//     // If user is not authenticated, check localStorage for stored user data
//     const storedUser = localStorage.getItem("pen-user");
//     if (storedUser) {
//       const parsedUser = JSON.parse(storedUser);
//       if (parsedUser.portName === "agents") {
//         auth?.setUser(parsedUser); // Set user from localStorage
//         setLoading(false);
//         return;
//       }
//     }

//     // If neither condition is met, redirect to the login page
//     router.replace("/agents/login");
//     setLoading(false);
//   }, [auth, router]);

//   // Show a loader while checking authentication
//   if (loading) {
//     return (
//       <div className="">
//         <GlobalLoader />
//       </div>
//     );
//   }

//   // Render children only if the user is authenticated and has the correct portName
//   return auth?.user?.portName === "agents" ? children : null;
// };

// export default AgentProtectedAgentRoute;
