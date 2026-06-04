// Add these new interfaces and functions to your existing file

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ExpiryReminderParams {
  token: string;
  daysBefore: number;
}

interface ExpiryReminderResponse {
  currentSetting: number;
}

// Submit expiry reminder setting
const submitExpiryReminder = async ({
  token,
  daysBefore,
}: ExpiryReminderParams) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/expiry-reminder`,
    { daysBefore },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Get current expiry reminder setting
const getExpiryReminder = async (token?: string) => {
  if (!token) throw new Error("Authentication required");

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/expiry-reminder`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Add these hooks to your exports
export const useSubmitExpiryReminder = () => {
  return useMutation({
    mutationFn: (
      params: Omit<ExpiryReminderParams, "token"> & { token?: string }
    ) => {
      if (!params.token) throw new Error("Authentication required");
      return submitExpiryReminder(params as ExpiryReminderParams);
    },
  });
};

export const useGetExpiryReminder = (token?: string) => {
  return useQuery({
    queryKey: ["expiryReminder"],
    queryFn: () => getExpiryReminder(token),
    enabled: !!token,
  });
};
