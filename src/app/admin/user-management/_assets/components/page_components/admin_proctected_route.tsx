/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from "@/app/hook/userContext";
import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AdminProtectedAgentRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.user !== null) {
      setLoading(false);
    } else if (!localStorage.getItem("pen-user")) {
      router.replace("/login");
    }
  }, [auth?.user, router]);

  if (loading)
    return (
      <div className="">
        <GlobalLoader />
      </div>
    );

  const userRoles = auth?.user?.user?.userRoles[0]?.role?.name as string;

  if (!userRoles || userRoles !== "Admin") {
    router.replace("/login");
    return null;
  }

  return auth?.user ? children : null;
};

export default AdminProtectedAgentRoute;
