/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ActionButton from "@/components/common/button/actionButton";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import DynamicTableWithPagination, {
  TableConfig,
} from "@/components/common/DynamicTable/DynamicTable";
import CommonSearch from "@/components/common/search/commonSearch";
import { Card } from "@/components/ui/card";
import dateFormat from "@/utils/DateFormatter";
import { StatusWithIcon } from "@/utils/status_point";
import { Eye, FileText } from "lucide-react";
import { useState } from "react";

const SubmittedInvoicesTable = () => {
  const [searchText, setSearchText] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const date = new Date();

  // Checkbox states
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // const [selectedObjects, setSelectedObjects] = useState<any[]>([]);

  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `commissions/invoices/get`,
    queryKey: "fetch-commission-data",
    filterData: { searchText: searchText, page: currentPage },
  });

  console.log("fetch all data ----atiqur", data);

  // Table column configuration
  const tableConfig: TableConfig = {
    columns: [
      { key: "invoiceNumber", header: "Invoice Number" },
      // { key: "applicantId", header: "Applicant ID" },
      {
        key: "studentName",
        header: "Name",
      },
      {
        key: "invoiceStatus",
        header: "Invoice Status",
        render: (data) => <StatusWithIcon status={data?.invoiceStatus} />,
      },
      // { key: "enrollmentStatus", header: "Enrollment Status" },
      //      { key: "firstPaymentStatus", header: "First Payment Status" },
      { key: "session", header: "Academic Session" },
      { key: "potentialPayout", header: "Potential Payout" },
      {
        key: "updatedAt",
        header: "Date",

        render(data) {
          return (
            <div>
              {/* {new Date(data?.createdAt)} */}
              <p> {dateFormat.localDateTime(data?.createdAt)} </p>
            </div>
          );
        },
      },

      {
        key: "action",
        header: "Action",
        render: () => (
          <ResponsiveButtonGroup>
            <ActionButton
              variant="icon"
              icon={<Eye size={28} color="#555F6D" />}
            />
            <ActionButton variant="icon" icon={<FileText />} />
          </ResponsiveButtonGroup>
        ),
      },
    ],
  };

  return (
    <div>
      <Card>
        <div className="flex flex-col gap-x-2 justify-between mx-auto w-full xl:flex">
          <div className="flex flex-col gap-4 justify-start items-center p-4 w-full bg-white border-b lg:flex-row lg:justify-between">
            {/* Title */}
            <div className="flex gap-2 items-center">
              <h1 className="text-lg font-semibold text-[#192128]">
                Submitted Invoices
              </h1>
              <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full">
                {data?.pagination?.total} Agents
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              {/* <ActionButton */}
              {/*   variant="outline" */}
              {/*   icon={<HiOutlineFilter size={20} color="#555F6D" />} */}
              {/*   buttonContent="Filter" */}
              {/* /> */}
            </div>
          </div>

          <div className="w-full">
            <DynamicTableWithPagination
              data={data?.data}
              pagination={data?.pagination}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              config={tableConfig}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubmittedInvoicesTable;
