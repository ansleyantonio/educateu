import axios from "axios";

export const ImageORFileGetViewPath = async (
  path: string,
  token?: string,
  type?: string
) => {
  let url; // Declare the url variable here
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: type === "pdf" ? "arraybuffer" : "blob",
    }
  );

  if (type === "pdf") {
    const blob = new Blob([response.data], { type: "application/pdf" });
    url = window.URL.createObjectURL(blob);
  } else {
    const blob = new Blob([response.data]);
    url = window.URL.createObjectURL(blob);
  }
  return url;
};
