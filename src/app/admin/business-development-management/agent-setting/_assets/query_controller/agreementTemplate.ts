import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

interface TemplateParams {
  token: string;
  templateType: "INTERNAL" | "EXTERNAL";
  commissionGroupId: string,
  awardingBodyId: string,
  name: string
}

interface SubmitTemplateParams extends TemplateParams {
  html: string;
}

// const submitAgreementTemplate = async ({ token, html, templateType }: SubmitTemplateParams) => {
//   const response = await axios.post(
//     `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/agreement`,
//     { agreement: html },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       params: { templateType },
//     }
//   );
//   return response.data;
// };
const submitAgreementTemplate = async ({
  token,
  html,
  templateType,
  commissionGroupId,
  name,
  awardingBodyId,
}: SubmitTemplateParams) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/agreement`,
    { agreement: html, templateType, commissionGroupId, awardingBodyId, name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

const getAgreementTemplate = async (
  token?: string,
  templateType?: "INTERNAL" | "EXTERNAL",
) => {
  if (!token || !templateType) throw new Error("Authentication required");

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/agreement`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { templateType },
    }
  );
  return response.data;
};

export const useSubmitAgreementTemplate = () => {
  return useMutation({
    mutationFn: (
      params: Omit<SubmitTemplateParams, "token"> & { token?: string }
    ) => {
      if (!params.token) throw new Error("Authentication required");
      return submitAgreementTemplate(params as SubmitTemplateParams);
    },
  });
};

// export const useGetAgreementTemplates = (
//   token?: string,
//   templateType?: "INTERNAL" | "EXTERNAL"
// ) => {
//   return useQuery({
//     queryKey: ["agreementTemplates", templateType],
//     queryFn: () => getAgreementTemplate(token, templateType),
//     enabled: !!token && !!templateType,
//   });
// };

export const useGetAgreementTemplates = (
  token?: string,
  templateType?: "INTERNAL" | "EXTERNAL"
) => {
  return useQuery({
    queryKey: ["agreementTemplates", templateType],
    queryFn: () => getAgreementTemplate(token, templateType),
    enabled: !!token && !!templateType, // Makes sure the query only runs when token and templateType are available
  });
};
