/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types for the API responses
type GlobalSettingResponse = {
  name: string;
  value: string;
};

type GlobalSettingPayload = {
  name: string;
  value: string;
};

// Fetch enrollment setting
export const fetchEnrollmentSetting = async ({ queryKey }: any) => {
  const [, { token }] = queryKey;

  try {
    const { data } = await axios.get<GlobalSettingResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/global/setting`,
      {
        params: {
          name: "enrollment",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching enrollment setting:", error);
    throw error;
  }
};

// Fetch new application setting
export const fetchNewApplicationSetting = async ({ queryKey }: any) => {
  const [, { token }] = queryKey;

  try {
    const { data } = await axios.get<GlobalSettingResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/global/setting`,
      {
        params: {
          name: "newapplication",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching new application setting:", error);
    throw error;
  }
};

// Update global setting
export const updateGlobalSetting = async ({
  token,
  payload,
}: {
  token: string;
  payload: GlobalSettingPayload;
}) => {
  try {
    const { data } = await axios.post<GlobalSettingResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/global/setting`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating global setting:", error);
    throw error;
  }
};

// React Query hooks
export const useEnrollmentSetting = (token: string) => {
  return useQuery({
    queryKey: ["enrollmentSetting", { token }],
    queryFn: fetchEnrollmentSetting,
    enabled: !!token,
  });
};

export const useNewApplicationSetting = (token: string) => {
  return useQuery({
    queryKey: ["newApplicationSetting", { token }],
    queryFn: fetchNewApplicationSetting,
    enabled: !!token,
  });
};

export const useUpdateGlobalSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGlobalSetting,
    onSuccess: (data, variables) => {
      // Invalidate queries based on which setting was updated
      if (variables.payload.name === "enrollment") {
        queryClient.invalidateQueries({ queryKey: ["enrollmentSetting"] });
      } else if (variables.payload.name === "newapplication") {
        queryClient.invalidateQueries({ queryKey: ["newApplicationSetting"] });
      }
    },
  });
};
