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

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuths();
  const router = useRouter();
  // const [loading, setLoading] = useState(true);
  const PortAccess = auth?.user?.portName;

  // console.log("admin route ", auth);

  const pathname = usePathname();
  const LoginPage = pathname === "/admin/login";
  if (LoginPage) {
    return <>{children}</>;
  }

  if (auth?.user === null || !PortAccess || PortAccess !== "admin") {
    router.replace("/admin/login");
    // setLoading(false);
  }

  return auth?.user && PortAccess === "admin" ? children : null;
};

export default AdminProtectedRoute;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import { useAuth } from "@/app/hook/userContext";
// import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// const AdminProtectedAgentRoute = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const auth = useAuth();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (auth?.user !== null) {
//       setLoading(false);
//     } else if (!localStorage.getItem("pen-user")) {
//       router.replace("/login");
//     }
//   }, [auth?.user, router]);

//   if (loading)
//     return (
//       <div className="">
//         <GlobalLoader />
//       </div>
//     );

//   const userRoles = auth?.user?.user?.userRoles[0]?.role?.name as string;

//   if (!userRoles || userRoles !== "Admin") {
//     router.replace("/login");
//     return null;
//   }

//   return auth?.user ? children : null;
// };

// export default AdminProtectedAgentRoute;
