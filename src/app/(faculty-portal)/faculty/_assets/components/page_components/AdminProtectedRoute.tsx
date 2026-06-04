// // /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
// import { useAuths } from "@/hooks/userContext";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
"use client";

import { useAuths } from "@/hooks/userContext";
import { usePathname, useRouter } from "next/navigation";

// export default AdminProtectedAgentRoute;

const FacultyProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuths();
  const router = useRouter();
  // const [loading, setLoading] = useState(true);
  const PortAccess = auth?.user?.portName;

  // console.log("admin route ", auth);

  const pathname = usePathname();
  const LoginPage = pathname === "/faculty/login";
  if (LoginPage) {
    return <>{children}</>;
  }

  if (auth?.user === null || !PortAccess || PortAccess !== "faculty") {
    router.replace("/faculty/login");
    // setLoading(false);
  }

  return auth?.user && PortAccess === "faculty" ? children : null;
};

export default FacultyProtectedRoute;
