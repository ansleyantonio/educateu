/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import CommonSearch from "@/components/common/search/commonSearch";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CertificateCourseFeeList from "./create/_assets/components/CertificateCourseFeeList";

const CertificateCPDCourseFee = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");

  const { data, isLoading: isLoadingCourseFee } = useFetchData({
    filterData: { page: currentPage, courseType: "CPD_COURSE", search: searchText, limit , PromoCodeStatus: "active"},
    queryKey: "fetch-certificate-course-fee-data",
    method: "GET",
    path: "certificate-course-fee/course-fees",
  });

  // Filter dummy data based on search text
  const filteredData = {
    ...data,
    data: {
      ...data?.data,
      courses: data?.data?.courseList?.filter(
        (course: any) =>
          course?.courseName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          course?.courseType
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          course?.tieredPricing
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      ),
    },
  };
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Certificate Course Fee",
        },
        {
          title: "CPD Course Fee",
        },
      ]}
    >
      <div>
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex justify-between items-center p-6">
            <h1 className="text-lg leading-6 text-[#000000]">CPD Course Fee</h1>
            <div className="flex gap-2 space-y-2 md:space-y-0">
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={filteredData?.data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />

              <Link href="/admin/finance/certificate-course-fee/cpd/create">
                <ActionButton
                  buttonContent="Create CPD Course Fee"
                  variant="primary"
                  icon={<PlusIcon className="w-5 h-5" color="#fff" />}
                />
              </Link>
            </div>
          </div>
          <CertificateCourseFeeList
            data={filteredData}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            isLoading={isLoadingCourseFee}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default CertificateCPDCourseFee;
