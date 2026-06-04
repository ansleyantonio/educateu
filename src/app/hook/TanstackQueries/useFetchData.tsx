/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "./controller.tsx/fetchGetData";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";

interface Props {
  token?: string;
  filterData?: Record<string, any>; // Better typing
  path: string;
  queryKey: string | any[];
  method?: "GET" | "POST";
  enabled?: boolean;
}

const useFetchData = ({
  filterData = {},
  queryKey,
  method = "GET",
  path,
  token,
  enabled = true,
}: Props) => {
  const user = useAuths();
  const portalName: string = user?.user?.portName ?? "/admin";
  if (token == "" || token == undefined || token == null) {
    token = user?.user?.token;
  }

  // all query data return from here like data, isLoading
  return useQuery({
    queryKey: [
      queryKey,
      {
        path,
        portalName,
        Method: method,
        token,
        queryParams: RemoveEmptyFields(filterData),
      },
    ],
    queryFn: fetchData,
    enabled: !!token && !!filterData && enabled,
  });
};

export default useFetchData;
