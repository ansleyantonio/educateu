import axios from "axios";

// export const useDownloadCommissionTemplate = () => {
//   return useMutation({
//     mutationFn: downloadCommissionTemplate,
//   });
// };

interface DownloadTemplateParams {
  token: string;
  templateType: "INTERNAL" | "EXTERNAL";
}

export const downloadCommissionTemplate = async ({
  token,
  templateType,
}: DownloadTemplateParams) => {
  //   const response = await axios.post(
  //     `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/download`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       params: { templateType },
  //       responseType: "blob", // crucial to handle file downloads
  //     }
  //   );
  console.log("Templayte Type", templateType);
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/commission/download`,
    {},
    { 
      params: {
        templateType: templateType
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }, // request body
    // {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    //   responseType: "blob",
    // }
  );

  // Trigger file download
  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${templateType.toLowerCase()}-commission-template.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  return true;
};
