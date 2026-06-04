/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { CustomField } from "@/components/common/fields/cusInputField";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { StatusWithIcon } from "@/utils/status_point";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MarkAsPaidModal } from "./_assets/components/modals/MarkAsPaidModal";
import { ViewReceiptModal } from "./_assets/components/modals/ViewReceiptModal";

const PaymentHistoryPage = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  // const [filterData, setFilterData] = useState<IFilterAdvanceModuleForm>({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading, refetch } = useFetchData({
    method: "GET",
    path: "commission-payments/all-payments/history",
    filterData: {
      // ...filterData,
      page: currentPage,
      pageSize: limit,
      searchTerm: searchText,
    },
    queryKey: "fetch-commission-payments-list",
  });

  console.log("paymment history", data);
  return (
    <PageWithBreadcrumb
      items={[
        // { title: "Home", href: "/" },
        { title: "Finance" },
        {
          title: "Payment History",
        },
      ]}
    >
      <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
        <div className="flex justify-between items-center p-6 -pl-4">
          <SectionHeader
            title="Payment History"
            total={data?.pagination?.total || 0}
            label="History"
            labels="Histories"
          />
          <div className="gap-2 space-y-2 lg:flex lg:space-y-0">
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField
              totalItems={data?.pagination?.total}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
        <DynamicTableWithPagination
          isLoading={isLoading}
          data={data?.data || []}
          pagination={{
            page: currentPage,
            total: data?.pagination?.total,
            totalPages: data?.pagination?.totalPages,
          }}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          config={{
            columns: [
              {
                key: "applicantId",
                header: "Applicant ID",
              },
              {
                key: "fullName",
                header: "Student Name",
              },
              {
                key: "courseName",
                header: "Course Name",
              },
              {
                key: "awardingBody",
                header: "Awarding Body",
              },
              {
                key: "totalFee",
                header: "Fee",
              },
              {
                key: "academicSession",
                header: "Session",
              },
              {
                key: "paidAmount",
                header: "Paid Amount",
              },
              {
                key: "paymentStatus",
                header: "Payment Status",
                render: (item) => (
                  <StatusWithIcon status={item.paymentStatus} />
                ),
              },
              {
                key: "enrollmentStatus",
                header: "Enrollment Status",
              },
              {
                key: "paymentStatus",
                header: "Action",
                render: (item) => (
                  <ResponsiveButtonGroup>
                    {item.paymentStatus !== "PAID" && (
                      <MarkAsPaidModal data={item} refetch={refetch} />
                    )}
                    <ViewReceiptModal data={item} />
                    {/* <DownloadReceiptModal data={item} /> */}
                  </ResponsiveButtonGroup>
                ),
              },
            ],
          }}
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default PaymentHistoryPage;
