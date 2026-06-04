"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useState } from "react";

const PaymentHistoryTable = () => {
  const [searchTerm, setSearchText] = useState("");
  const [limit, setLimit] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useFetchData({
    queryKey: "commission-payments",
    path: "commission-payments/invoices/agents",
    filterData: { limit: limit, page: currentPage, searchTerm },
  });

  return (
    <div>
      {/* Table Header */}
      <div className="flex justify-between items-center p-3">
        <div className="flex gap-2 items-center">
          <h1 className="text-lg font-bold leading-6 text-[#000000] p">
            Applicant Payment List
          </h1>
          <p className="py-1 px-3 text-xs bg-blue-100 rounded-full">
            {data?.pagination?.total} Applicants
          </p>
        </div>

        <div className="flex gap-2 space-y-2 md:space-y-0">
          <CustomField.LimitField
            totalItems={data?.pagination?.total}
            setLimit={setLimit}
            setCurrentPage={setCurrentPage}
          />

          <CustomField.CommonSearch
            searchText={searchTerm}
            setSearchText={setSearchText}
          />
        </div>
      </div>

      {/* Table Body */}
      <DynamicTableWithPagination
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            { key: "agentName", header: "Agent Name" },
            // { key: "invoiceNo", header: "Invoice No" },
            { key: "potentialCommission", header: "Potential Commission" },
            //            { key: "PaidCommission", header: "Paid Commission" },
            { key: "commissionTier", header: "Commission Tier" },
            { key: "totalStudent", header: "Total Students" },
            // { key: "remainingBalance", header: "Remaining Balance" },
            { key: "academicSession", header: "Academic Session" },
            // { key: "paymentDate", header: "Payment Date" },
            // {
            //   key: "",
            //   header: "Action",
            //   render: (info) => (
            //     <ResponsiveButtonGroup>
            //       <p>View</p>
            //     </ResponsiveButtonGroup>
            //   ),
            // },
          ],
        }}
      />
    </div>
  );
};

export default PaymentHistoryTable;
