/* eslint-disable @typescript-eslint/no-explicit-any */
// store/AuthProvider.tsx
"use client";

import GlobalLoader from "@/components/common/GlobalLoader/globalLoader";
import { useAuths } from "./useAuths";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {loading, getOwnProfileMutation} = useAuths();

  if (loading || getOwnProfileMutation.isPending) {
    return <GlobalLoader />;
  }

  return <>{children}</>;
};
