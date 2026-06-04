import axios from "axios";

interface DownloadUserCSV {
  token: string;
}

export const DownloadUserCSV = async ({ token }: DownloadUserCSV) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/bulk/download/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `user-bulk-upload.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  return true;
};
