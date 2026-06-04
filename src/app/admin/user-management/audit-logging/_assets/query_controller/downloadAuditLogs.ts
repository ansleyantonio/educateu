/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const downloadAuditLogs = async ({
    filter,
    startDate,
    endDate,
    token,
  }: {
    filter: string;
    startDate?: string;
    endDate?: string;
    token: string;
  }) => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("API URL is not defined");
    }
  
    let url = `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/auditlogs?filter=${filter}`;
    
    if (filter === "dateRange") {
      if (!startDate || !endDate) {
        throw new Error("Start and end dates are required for dateRange");
      }
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
  
    // console.log("Downloading from URL:", url); 
  
    const response = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
  
    if (!response.data) throw new Error("No data received");
  
    const contentType = response.headers["content-type"];
    const disposition = response.headers["content-disposition"];
    const filename = disposition
      ? disposition.split("filename=")[1]?.replace(/["']/g, "") || "audit-logs.csv"
      : "audit-logs.csv";
  
    const blob = new Blob([response.data], { type: contentType });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
};