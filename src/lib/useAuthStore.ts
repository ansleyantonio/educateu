/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// store/authStore.ts
import { create } from "zustand";
import { createJSONStorage, devtools } from "zustand/middleware";
import { AuthResponse, PortalList } from "@/type/IAuth";

interface AuthState {
  user: AuthResponse | null;
  portalList: PortalList[];
  permission: any[];
  loading: boolean;

  setUser: (user: AuthResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setPermission: (perm: any[]) => void;
  setPortalList: (list: PortalList[]) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      portalList: [],
      permission: [],
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setPermission: (perm) => set({ permission: perm }),
      setPortalList: (list) => set({ portalList: list }),
      resetAuth: () =>
        set({
          user: null,
          portalList: [],
          permission: [],
          loading: false,
        }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
