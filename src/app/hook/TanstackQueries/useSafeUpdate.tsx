/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useState } from "react";
import { useApiMutation } from "./useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import useFetchData from "./useFetchData";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

interface SafeUpdateProps {
  fieldName: string; // which key in API response has the entity
  fetchPath: string;
  fetchFilter?: any;
  fetchMethod?: "GET" | "POST";
  updatePath: string;
  queryKey: string;
  timeLimitMinutes?: number; // default = 15
  onSuccess?: () => void; // external success handler
}

export function useSafeUpdate({
  fieldName,
  fetchMethod = "GET",
  fetchFilter,
  fetchPath,
  updatePath,
  queryKey,
  timeLimitMinutes = 15,
  onSuccess,
}: SafeUpdateProps) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<any | null>(null);
  const [needsOverride, setNeedsOverride] = useState(false);

  // Update mutation
  const mutation = useApiMutation({
    method: "PATCH",
    path: updatePath,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setPending(null);
      setNeedsOverride(false);
      onSuccess?.();
      showToast("success", data);
    },
    onError: (error) => {
      console.error("SafeUpdate error", error);
      showToast("error", error);
    },
  });

  // Lazy fetch
  const { data, refetch, isFetching } = useFetchData({
    method: fetchMethod,
    path: fetchPath,
    filterData: fetchFilter,
    queryKey: fetchPath,
    enabled: false,
  });

  const safeUpdate = async (payload: any) => {
    try {
      // 🔹 trigger fetch manually
      const result = await refetch();
      const latest = result?.data?.data?.[fieldName];

      const updatedAt = latest?.updatedAt;

      if (!updatedAt) {
        await mutation.mutateAsync(payload);
        return { immediate: true, latest };
      }

      const lastUpdated = new Date(updatedAt).getTime();
      const diffMinutes = (Date.now() - lastUpdated) / 1000 / 60;

      if (diffMinutes >= timeLimitMinutes) {
        await mutation.mutateAsync(payload);
        return { immediate: true, latest };
      } else {
        setPending(payload);
        setNeedsOverride(true);
        return { immediate: false, latest };
      }
    } catch (err) {
      console.error("SafeUpdate check failed", err);
      await mutation.mutateAsync(payload);
      return { immediate: true, latest: null };
    }
  };

  const confirmOverride = async () => {
    if (pending) {
      await mutation.mutateAsync(pending);
    }
  };

  return {
    safeUpdate,
    confirmOverride,
    needsOverride,
    setNeedsOverride,
    isUpdating: mutation.isPending,
    updateData: data?.data?.[fieldName],
    isLoading: isFetching,
  };
}

/*
USE useSafeUpdate HOOK:

1. Initialize:
   const { safeUpdate, confirmOverride, needsOverride, isUpdating } = useSafeUpdate({
       fieldName: 'course',
       fetchPath: '/courses/1',
       updatePath: '/courses/1',
       queryKey: 'courses',
       onSuccess: () => console.log('Updated!')
   });

2. Update safely:
   const result = await safeUpdate({ title: 'New Title' });
   if (!result.immediate) showOverrideModal();

3. If user confirms override:
   confirmOverride();

4. Track states:
   - needsOverride → show modal
   - isUpdating → PATCH in progress
*/
