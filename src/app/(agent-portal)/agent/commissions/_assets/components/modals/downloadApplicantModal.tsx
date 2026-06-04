/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
//import PdfManagerWrapper from "./PdfManager";
import ApplicantPdf from "./applicantPdf";
import PdfManagerWrapper from "@/utils/formatter/PdfManager";

export function DownloadApplicantModal({ id }: { id: string }) {
  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `commissions/${id}`,
    queryKey: "fetch-applicant-data",
    enabled: id ? true : false,
  });

  return (
    <PdfManagerWrapper
      data={data}
      isLoading={isLoading}
      behavior="download"
      pdfComponent={<ApplicantPdf data={data} isLoading={isLoading} />}
    />
  );
}
