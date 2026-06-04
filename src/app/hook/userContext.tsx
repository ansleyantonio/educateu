/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface Role {
  id: string;
  name: string;
  application: string[];
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  roleData: any | null;
  role: Role;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  userRoles: UserRole[];
  userStatus: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: AuthResponse | null;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser =
      localStorage.getItem("pen-user") !== null
        ? JSON.parse(localStorage.getItem("pen-user")!)
        : null;

    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false); // Ensure the state is updated after user check
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("pen-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pen-user");
    }
  }, [user]);

  const login = (userData: AuthResponse) => {
    setLoading(true); // Ensure the state is updated after user check

    setUser(userData);
    // login page redirect here
    const AgentRole = userData.user?.userRoles[0].role.name;
    if (AgentRole === "Agent") {
      router.push("/agent");
    } else if (AgentRole === "Admin") {
      router.push("/admin/user-management");
    } else if (AgentRole === "SubAgent") {
      router.push("/sub-agent");
    } else if (AgentRole === "AdmissionOfficer") {
      router.push("/admission");
    } else {
      router.push("/");
    }
    setLoading(false); // Ensure the state is updated after user check
  };

  const logout = () => {
    setLoading(true); // Ensure the state is updated after user check

    setUser(null);
    localStorage.removeItem("pen-user");
    // login page redirect here
    router.push("/login");
    setLoading(false); // Ensure the state is updated after user check
  };

  if (loading)
    return (
      <div>
        <GlobalLoader />
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
