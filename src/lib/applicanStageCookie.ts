export const setApplicantStatusCookie = (status: boolean) => {
  if (typeof window !== "undefined") {
    const isHTTPS = window.location.protocol === "https:";

    document.cookie = `applicantStatus=${encodeURIComponent(JSON.stringify(status))}; path=/; ${
      isHTTPS ? "Secure; SameSite=Strict" : "SameSite=Lax"
    }`;
  }
};

export const getApplicantStatusCookie = (): boolean => {
  if (typeof window !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("applicantStatus="));

    if (cookie) {
      try {
        const cookieValue = cookie.split("=")[1];
        const decodedValue = decodeURIComponent(cookieValue);
        return JSON.parse(decodedValue);
      } catch (error) {
        console.error("Error parsing authData cookie:", error);
        return false;
      }
    }
  }
  return false;
};
