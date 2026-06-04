import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// /* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import {
//   clearTokens,
//   getAccessToken,
//   setAccessToken,
// } from "@/utils/tokenUtils";
// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { createContext, useContext, useState } from "react";
// import toast from "react-hot-toast";

// interface Role {
//   id: string;
//   name: string;
//   application: string[];
// }

// interface UserRole {
//   id: string;
//   userId: string;
//   roleId: string;
//   roleData: any | null;
//   role: Role;
// }

// interface User {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   mobile: string;
//   username: string;
//   password: string;
//   address: string;
//   createdAt: string;
//   updatedAt: string;
//   userRoles: UserRole[];
//   userStatus: string;
// }

// interface AuthResponse extends Partial<User> {
//   userId: string;
//   token: string;
//   portName?: string;
// }

// const findPortalObject = (portalName: string, data: any[]) => {
//   return data.find((portal: any) => portal.portalName === portalName) || null;
// };

// interface AuthContextType {
//   user: AuthResponse | null;
//   permission: any;
//   login: (
//     userData: AuthResponse,
//     redirectPath?: string,
//     portalName?: string
//   ) => void;
//   logout: (redirectPath?: string) => void;
//   setUser: (user: AuthResponse | null) => void;
// }

// const UserAuthContext = createContext<AuthContextType | null>(null);

// export const useAuths = () => useContext(UserAuthContext);

// export const UserAuthProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [user, setUser] = useState<AuthResponse | null>(null);
//   const [permission, setPermission] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   //ToTo useEffect initial check if localStorage use exist then set setUser)
//   const getOwnProfileMutation = useMutation({
//     mutationFn: (data: any) => {
//       // console.log("data mutation", data.userId);
//       return axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/user-modules/modulelist/${data.userId}`,
//         data
//       );
//     },
//     onSuccess: (data) => {
//       const storedUser = getAccessToken();
//       if (!storedUser) return;
//       const parsedUser = JSON.parse(storedUser);

//       if (data.status === 200) {
//         const allPermissionData = data?.data?.data;

//         const Permission = findPortalObject(
//           parsedUser?.portName,
//           allPermissionData
//         );

//         if (Permission) {
//           // setPermission(Permission);
//         } else {
//           console.log("log out", `/${parsedUser.portName}/login`, user);
//           // router.push(`/${user?.portName}/login`);
//         }

//         // console.log("Permission", Permission);

//         // const Permission = findPortalObject(user?.portName, allPermissionData);

//         console.log("userProfile", data?.data?.data);
//         // toast.success("Successfully login!");
//       } else {
//         toast.error("Failed to login");
//       }
//     },
//     onError: (error: any) => {
//       console.log("error", error);
//       if (error?.response) {
//         toast.error(error.response?.data?.message);
//       }
//     },
//   });

//   // useEffect(() => {
//   const storedUser = getAccessToken();
//   // TODO check user id is exist or not exist in database
//   if (storedUser) {
//     const parsedUser = JSON.parse(storedUser);
//     console.log("parsedUser", storedUser);
//     const body = {
//       token: parsedUser.token,
//       userId: parsedUser.userId,
//     };
//     setUser(JSON.parse(storedUser));

//     // getOwnProfileMutation.mutate(body);
//   }
//   // setLoading(false); // Ensure the state is updated after user check
//   // }, []);

//   // useEffect(() => {
//   //   if (user) {
//   //     localStorage.setItem("pen-user", JSON.stringify(user));
//   //   } else {
//   //     localStorage.removeItem("pen-user");
//   //   }
//   // }, [user]);

//   const login = (userData: AuthResponse, redirectPath?: string) => {
//     const portalName = redirectPath?.split("/")[1]; // Extracts 'admin'
//     // setLoading(true); // Ensure the state is updated after user check
//     const UserData = {
//       ...userData,
//       portName: portalName,
//     };

//     setAccessToken(JSON.stringify(UserData));
//     // localStorage.setItem("pen-user", JSON.stringify(UserData));
//     // console.log("UserData", UserData);

//     setUser(UserData);
//     console.log("user data", userData);
//     router.push(redirectPath || "/");

//     // // login page redirect here
//     // const AgentRole = userData.user?.userRoles[0].role.name;
//     // if (AgentRole === "Agent") {
//     //   router.push("/agent");
//     // } else if (AgentRole === "Admin") {
//     //   router.push("/admin/user-management");
//     // } else if (AgentRole === "SubAgent") {
//     //   router.push("/sub-agent");
//     // } else if (AgentRole === "AdmissionOfficer") {
//     //   router.push("/admission");
//     // } else {
//     //   router.push("/");
//     // }
//     setLoading(false); // Ensure the state is updated after user check
//   };

//   const logout = (redirectPath?: string) => {
//     setLoading(true); // Ensure the state is updated after user check

//     setUser(null);
//     clearTokens();
//     // localStorage.removeItem("pen-user");
//     // login page redirect here
//     router.push(redirectPath || "/login");
//     setLoading(false); // Ensure the state is updated after user check
//   };

//   // if (loading)
//   //   return (
//   //     <div>
//   //       <GlobalLoader />
//   //     </div>
//   //   );

//   return (
//     <UserAuthContext.Provider
//       value={{ user, permission, login, logout, setUser }}
//     >
//       {!loading && children}
//     </UserAuthContext.Provider>
//   );
// };
