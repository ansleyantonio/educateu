/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import * as XLSX from "xlsx";

import CSV from "/public/assets/logo/admin/csv-02.svg";
interface ExportCSVProps {
  data: Record<string, any>[];
  fileName?: string;
  buttonName?: string;
  logoShow?: boolean;
}

const DownloadCSV = ({
  data,
  buttonName = "Export",
  fileName = "export",
  logoShow = true,
}: ExportCSVProps) => {
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className="bg-white border border-1 text-black px-2 py-2 rounded capitalize flex items-center gap-2"
    >
      {logoShow && <Image src={CSV} width={20} height={20} alt="Download" />}
      Download CSV
    </button>
  );
};

export default DownloadCSV;
