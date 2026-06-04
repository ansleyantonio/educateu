/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { CookieStore } from "@/lib/CookieStore";
import { AuthResponse, ModulePermission, PortalList } from "@/type/IAuth";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const findPortalObject = (portalName: string, data: any[]) => {
  return data.find((portal: any) => portal.portalName === portalName) || null;
};

interface AuthContextType {
  user: AuthResponse | null;
  permission: any;
  portalList: PortalList[];
  editAccess: boolean;
  loading: boolean;
  login: (
    userData: AuthResponse,
    redirectPath?: string,
    portalName?: string,
    anotherCategory?: string
  ) => void;
  logout: (redirectPath?: string) => void;
  setUser: (user: AuthResponse | null) => void;
}

const UserAuthContext = createContext<AuthContextType>({
  user: null,
  permission: [],
  portalList: [],
  editAccess: false,
  loading: false,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

// Updated hook name and implementation
export const useAuth = (): AuthContextType => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a UserAuthProvider");
  }
  return context;
};

// Keep the old hook for backward compatibility
export const useAuths = () => useContext(UserAuthContext);

export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [permission, setPermission] = useState<any[]>([]);
  const [accessData, setAccessData] = useState<any[]>([]);
  const [portalList, setPortalList] = useState<PortalList[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathName = usePathname();

  const getOwnProfileMutation = useMutation({
    mutationFn: (data: any) => {
      return axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user-permission/modulelist/${data.userId}`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
    },
    onSuccess: (data) => {
      const storedUser: AuthResponse | null =
        CookieStore.getCookieClient("authData");

      // Update UserData with portName if needed
      const UserData = {
        ...storedUser,
        portName: storedUser?.portName, // or update if different from storedUser
      };

      // Update the cookie after fetching user permissions
      CookieStore.setCookieClient("authData", UserData);

      setAccessData(data?.data?.data[0].modules);
      if (storedUser && storedUser?.portName) {
        if (data.status === 200) {
          const allPermissionData = data?.data?.data;
          if (allPermissionData.length == 0) {
            router.push(`/${storedUser.portName}`);
            setLoading(false);
          }
          // particular user portal list
          const portalList = allPermissionData.map((portal: PortalList) => ({
            roleId: portal.roleId,
            roleName: portal.roleName,
            portalName: portal.portalName,
            portalCategoryId: portal.portalCategoryId,
          }));

          // set all portal category (like admin ,agent etc)
          setPortalList(portalList);

          const role = findPortalObject(
            storedUser?.portName,
            portalList
          ).roleName;

          const {
            firstName,
            lastName,
            email,
            address,
            mobile,
            userStatus,
            activityStatus,
            applicationCreateStatus,
          } = data.data.user;
          // console.log("userStatus", userStatus);
          setUser((prevState) => {
            if (!prevState) return null;
            return {
              ...prevState,
              roleName: role,
              firstName,
              lastName,
              email,
              address,
              mobile,
              userStatus,
              activityStatus,
              applicationCreateStatus,
            };
          });

          // single portal permission
          const NewPermission = findPortalObject(
            storedUser?.portName,
            allPermissionData
          );

          if (NewPermission) {
            if (NewPermission.length == 0) {
              setLoading(false);
              return router.push(`/${storedUser.portName}`);
            }

            setPermission(NewPermission);
          } else {
            console.log("log out------");
            router.push(`/${storedUser.portName}/login`);
          }
        } else {
          toast.error("Failed to login");
        }
      }
      setLoading(false);
    },
    onError: (error: any) => {
      console.log("error", error);
      if (error) {
        showToast("error", error);
      }
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    const storedUser: AuthResponse | null =
      CookieStore.getCookieClient("authData");

    // Update UserData with portName if needed
    const UserData = {
      ...storedUser,
      portName: storedUser?.portName, // or update if different
    };

    //  Update the cookie after fetching user permissions
    CookieStore.setCookieClient("authData", UserData);

    // console.log("storedUser", storedUser);
    if (storedUser) {
      const body = {
        token: storedUser.token,
        userId: storedUser.userId,
      };
      setUser(storedUser);

      if (!pathName.includes("login")) {
        getOwnProfileMutation.mutate(body);
      } else {
        setLoading(false); // TODO
      }
    } else {
      setLoading(false); //TODO
    }
  }, []);

  const login = async (
    userData: AuthResponse,
    redirectPath?: string
    // anotherCategory?: string,
  ) => {
    setLoading(true);
    CookieStore.clearAuthCookieClient();

    const portalName = redirectPath?.split("/")[1];
    const UserData = {
      ...userData,
      portName: portalName,
    };
    // console.log("UserData ---", UserData);
    CookieStore.setCookieClient("authData", UserData);
    setUser(UserData);

    await getOwnProfileMutation.mutate(UserData);

    // getOwnProfileMutation.mutate(UserData);
    router.replace(redirectPath || "/");
  };

  const logout = async (redirectPath?: string) => {
    setLoading(true);
    setUser(null);
    setPortalList([]);
    setPermission([]);
    CookieStore.clearAuthCookieClient();
    if (redirectPath) {
      router.push(redirectPath);
    }
    setLoading(false);
  };

  //Edit Access Module Permission
  const pathSegments = pathName?.split("/").filter(Boolean);

  const matchedModule = accessData?.find((mod: ModulePermission) =>
    pathSegments?.includes(mod.moduleName)
  );
  const permissions = matchedModule ? matchedModule.modulePermission : [];
  const editAccess = getUserAccess(permissions) === "full-access";

  const contextValue: AuthContextType = {
    user,
    permission,
    portalList,
    editAccess: !!editAccess,
    loading: loading || getOwnProfileMutation?.isPending,
    login,
    logout,
    setUser,
  };

  if (loading || getOwnProfileMutation?.isPending) {
    return (
      <div>
        <GlobalLoader />
      </div>
    );
  }

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
};

// Second Version

// userContext.ts - Updated version
// "use client";
// import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
// import { CookieStore } from "@/lib/CookieStore";
// import { AuthResponse, PortalList } from "@/type/IAuth";
// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
// } from "react";
// import toast from "react-hot-toast";
//
// const findPortalObject = (portalName: string, data: any[]) => {
//   return data.find((portal: any) => portal.portalName === portalName) || null;
// };
//
// interface AuthContextType {
//   user: AuthResponse | null;
//   permission: any;
//   portalList: PortalList[];
//   login: (
//     userData: AuthResponse,
//     redirectPath?: string,
//     portalName?: string,
//     anotherCategory?: string,
//   ) => void;
//   logout: (redirectPath?: string) => void;
//   setUser: (user: AuthResponse | null) => void;
//   isInitialized: boolean;
// }
//
// const UserAuthContext = createContext<AuthContextType | null>(null);
//
// export const useAuths = () => useContext(UserAuthContext);
//
// export const UserAuthProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [user, setUser] = useState<AuthResponse | null>(null);
//   const [permission, setPermission] = useState<any[]>([]);
//   const [portalList, setPortalList] = useState<PortalList[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const router = useRouter();
//
//   const getOwnProfileMutation = useMutation({
//     mutationFn: (data: any) => {
//       return axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/user-permission/modulelist/${data.userId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${data.token}`,
//           },
//         },
//       );
//     },
//     onSuccess: (data) => {
//       const storedUser: AuthResponse | null =
//         CookieStore.getCookieClient("authData");
//       if (storedUser && storedUser?.portName) {
//         if (data.status === 200) {
//           const allPermissionData = data?.data?.data;
//           if (allPermissionData.length == 0) {
//             return router.push(`/${storedUser.portName}`);
//           }
//
//           const portalList = allPermissionData.map((portal: PortalList) => ({
//             roleId: portal.roleId,
//             roleName: portal.roleName,
//             portalName: portal.portalName,
//             portalCategoryId: portal.portalCategoryId,
//           }));
//
//           setPortalList(portalList);
//           const role = findPortalObject(
//             storedUser?.portName,
//             portalList,
//           ).roleName;
//           const {
//             firstName,
//             lastName,
//             email,
//             address,
//             mobile,
//             userStatus,
//             activityStatus,
//             applicationCreateStatus,
//           } = data.data.user;
//
//           setUser((prevState) => {
//             if (!prevState) return null;
//             return {
//               ...prevState,
//               roleName: role,
//               firstName,
//               lastName,
//               email,
//               address,
//               mobile,
//               userStatus,
//               activityStatus,
//               applicationCreateStatus,
//             };
//           });
//
//           const NewPermission = findPortalObject(
//             storedUser?.portName,
//             allPermissionData,
//           );
//           if (NewPermission) {
//             if (NewPermission.length == 0) {
//               return router.push(`/${storedUser.portName}`);
//             }
//             setPermission(NewPermission);
//           } else {
//             console.log("log out------");
//             router.push(`/${storedUser.portName}/login`);
//           }
//         } else {
//           toast.error("Failed to login");
//         }
//       }
//     },
//     onError: (error: any) => {
//       console.log("error", error);
//       if (error?.response) {
//         toast.error(error.response?.data?.message);
//       }
//     },
//   });
//
//   // Initialize and sync across tabs
//   const initializeAuth = useCallback(() => {
//     const storedUser: AuthResponse | null =
//       CookieStore.getCookieClient("authData");
//
//     if (storedUser) {
//       const body = {
//         token: storedUser.token,
//         userId: storedUser.userId,
//       };
//       setUser(storedUser);
//       getOwnProfileMutation.mutate(body);
//     } else {
//       setUser(null);
//       setPermission([]);
//       setPortalList([]);
//     }
//
//     setIsInitialized(true);
//     setLoading(false);
//   }, []);
//
//   useEffect(() => {
//     setLoading(true);
//     initializeAuth();
//   }, [initializeAuth]);
//
//   // Cross-tab synchronization
//   useEffect(() => {
//     // Listen for cookie changes from other tabs
//     const handleCookieChange = (event: CustomEvent) => {
//       const { name, value } = event.detail;
//       if (name === "authData") {
//         if (value) {
//           // Token updated in another tab
//           if (!user || user.token !== value.token) {
//             initializeAuth();
//           }
//         } else {
//           // Token cleared in another tab
//           setUser(null);
//           setPermission([]);
//           setPortalList([]);
//         }
//       }
//     };
//
//     // Listen for focus events (when user switches back to tab)
//     const handleFocus = () => {
//       const storedUser: AuthResponse | null =
//         CookieStore.getCookieClient("authData");
//
//       // Check if token changed while tab was not focused
//       if (storedUser?.token !== user?.token) {
//         initializeAuth();
//       }
//     };
//
//     // Listen for storage events (fallback for cross-tab communication)
//     const handleStorage = (event: StorageEvent) => {
//       if (event.key === "auth-sync") {
//         initializeAuth();
//       }
//     };
//
//     window.addEventListener(
//       "cookieChange",
//       handleCookieChange as EventListener,
//     );
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("storage", handleStorage);
//
//     // Periodic token check (fallback)
//     const interval = setInterval(() => {
//       const storedUser: AuthResponse | null =
//         CookieStore.getCookieClient("authData");
//       if (storedUser?.token !== user?.token) {
//         initializeAuth();
//       }
//     }, 2000);
//
//     return () => {
//       window.removeEventListener(
//         "cookieChange",
//         handleCookieChange as EventListener,
//       );
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("storage", handleStorage);
//       clearInterval(interval);
//     };
//   }, [user?.token, initializeAuth]);
//
//   const login = async (
//     userData: AuthResponse,
//     redirectPath?: string,
//     anotherCategory?: string,
//   ) => {
//     setLoading(true);
//     CookieStore.clearAuthCookieClient();
//
//     const portalName = redirectPath?.split("/")[1];
//     const UserData = {
//       ...userData,
//       portName: portalName,
//     };
//
//     CookieStore.setCookieClient("authData", UserData);
//
//     // Trigger storage event for cross-tab sync
//     localStorage.setItem("auth-sync", Date.now().toString());
//
//     setUser(UserData);
//     getOwnProfileMutation.mutate(UserData);
//
//     if (anotherCategory) {
//       // Handle another category logic
//     } else {
//       router.push(redirectPath || "/");
//     }
//
//     setLoading(false);
//   };
//
//   const logout = async (redirectPath?: string) => {
//     setLoading(true);
//     setUser(null);
//     setPortalList([]);
//     setPermission([]);
//     CookieStore.clearAuthCookieClient();
//
//     // Trigger storage event for cross-tab sync
//     localStorage.setItem("auth-sync", Date.now().toString());
//
//     if (redirectPath) {
//       router.push(redirectPath);
//     }
//     setLoading(false);
//   };
//
//   if (loading || getOwnProfileMutation?.isPending || !isInitialized) {
//     return (
//       <div>
//         <GlobalLoader />
//       </div>
//     );
//   }
//
//   return (
//     <UserAuthContext.Provider
//       value={{
//         user,
//         permission,
//         login,
//         logout,
//         setUser,
//         portalList,
//         isInitialized,
//       }}
//     >
//       {children}
//     </UserAuthContext.Provider>
//   );
// };
