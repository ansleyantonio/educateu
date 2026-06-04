// query_controller/commissionTemplate.ts
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface CommissionTemplateParams {
  token: string;
  type: 'INTERNAL' | 'EXTERNAL';
}

interface CommissionGroup {
  id: string;
  name: string;
}

const getCommissionGroups = async ({ token, type }: CommissionTemplateParams) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/groups`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { type },
    }
  );
  return response.data;
};

export const useGetCommissionGroups = (token: string, agentType: string) => {
  const type = agentType === 'internal' ? 'INTERNAL' : 'EXTERNAL';
  
  return useQuery<CommissionGroup[]>({
    queryKey: ['commissionGroups', type],
    queryFn: () => getCommissionGroups({ token, type }),
    enabled: !!token && !!agentType,
  });
};