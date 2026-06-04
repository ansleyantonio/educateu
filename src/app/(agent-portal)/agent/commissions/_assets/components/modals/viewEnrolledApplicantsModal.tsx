/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import PdfManagerWrapper from "@/utils/formatter/PdfManager";
import ApplicantPdf from "./applicantPdf";

export default function ViewEnrolledApplicantsModal({ id }: { id: string }) {
  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `commissions/${id}`,
    queryKey: "fetch-applicant-data",
    enabled: id ? true : false,
  });

  return (
    <PdfManagerWrapper
      data={data?.data?.paymentRecord}
      isLoading={isLoading}
      pdfComponent={
        <ApplicantPdf data={data?.data?.paymentRecord} isLoading={isLoading} />
      }
    />
  );
}
