/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/useAuths.ts
"use client";

import { CookieStore } from "@/lib/CookieStore";
import { AuthResponse, PortalList } from "@/type/IAuth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const findPortalObject = (portalName: string, data: any[]) =>
  data.find((portal: any) => portal.portalName === portalName) || null;

export const useAuths = () => {
  const router = useRouter();
  const {
    user,
    setUser,
    resetAuth,
    setLoading,
    permission,
    portalList,
    setPortalList,
    setPermission,
    loading,
  } = useAuthStore();

  const getOwnProfileMutation = useMutation({
    mutationFn: async (data: any) => {
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

      if (!storedUser?.portName) return;

      const allPermissionData = data?.data?.data || [];

      if (allPermissionData.length === 0) {
        return router.push(`/${storedUser.portName}`);
      }

      const portalList = allPermissionData.map((portal: PortalList) => ({
        roleId: portal.roleId,
        roleName: portal.roleName,
        portalName: portal.portalName,
        portalCategoryId: portal.portalCategoryId,
      }));
      setPortalList(portalList);

      const role = findPortalObject(storedUser.portName, portalList)?.roleName;

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

      setUser({
        ...storedUser,
        roleName: role,
        firstName,
        lastName,
        email,
        address,
        mobile,
        userStatus,
        activityStatus,
        applicationCreateStatus,
      });

      const NewPermission = findPortalObject(
        storedUser.portName,
        allPermissionData
      );

      if (!NewPermission || NewPermission.length === 0) {
        return router.push(`/${storedUser.portName}`);
      }

      setPermission(NewPermission);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Login failed");
    },
  });

  useEffect(() => {
    const storedUser: AuthResponse | null =
      CookieStore.getCookieClient("authData");

    if (storedUser) {
      setUser(storedUser);
      getOwnProfileMutation.mutate({
        token: storedUser.token,
        userId: storedUser.userId,
      });
      setLoading(false);
    } else {
      setLoading(false);
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

    getOwnProfileMutation.mutate(UserData);

    // getOwnProfileMutation.mutate(UserData);
    router.push(redirectPath || "/");
    setLoading(false);
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

  return {
    user,
    setUser,
    setLoading,
    permission,
    portalList,
    login,
    logout,
    resetAuth,
    loading,
    getOwnProfileMutation,
  };
};
