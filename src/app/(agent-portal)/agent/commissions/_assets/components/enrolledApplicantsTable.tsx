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
import { StatusWithIcon } from "@/utils/status_point";
import { useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import InvoiceGenerateModal from "./invoiceGenerate/invoiceGenerateModal";
import { DownloadApplicantModal } from "./modals/downloadApplicantModal";
import ViewEnrolledApplicantsModal from "./modals/viewEnrolledApplicantsModal";

const EnrolledApplicantsTable = () => {
  const [searchText, setSearchText] = useState("");
  // Pagination state
  // const searchParams = useSearchParams();
  // const activePage = Number(searchParams.get("page")) || 1;
  // const [currentPage, setCurrentPage] = useState(activePage);
  const [currentPage, setCurrentPage] = useState(1);

  // Checkbox states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);

  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `commissions`,
    queryKey: "fetch-commission-data",
    filterData: { searchText: searchText, page: currentPage },
  });

  // console.log("fetch all data ----atiqur", data);

  // Table column configuration
  const tableConfig: TableConfig = {
    columns: [
      { key: "applicantId", header: "Applicant ID" },
      {
        key: "fullName",
        header: "Full Name",
      },
      {
        key: "enrollmentStatus",
        header: "Enrollment Status",
        render: (item) => <StatusWithIcon status={item.enrollmentStatus} />,
      },
      {
        key: "firstPaymentStatus",
        header: "First Payment Status",
        render: (item) => <StatusWithIcon status={item.firstPaymentStatus} />,
      },
      { key: "academicSession", header: "Academic Session" },
      {
        key: "commissionRate",
        header: "Commission Rate",
        render: (item) => item.commissionRate + "%",
      },
      {
        key: "potentialPayout",
        header: "Potential Payout",
      },
      {
        key: "action",
        header: "Action",
        render: (data) => (
          <ResponsiveButtonGroup>
            <ViewEnrolledApplicantsModal id={data?.id} />
            <DownloadApplicantModal id={data?.id} />
          </ResponsiveButtonGroup>
        ),
      },
    ],
  };

  return (
    <div>
      <Card>
        <div className="flex flex-col gap-x-2 justify-between mx-auto w-full xl:flex">
          <div className="flex flex-col gap-4 justify-start p-4 w-full bg-white border-b lg:flex-row lg:justify-between">
            {/* Title */}
            <div className="flex gap-2 items-center">
              <h1 className="text-lg font-semibold text-[#192128]">
                Enrolled Applicants
              </h1>
              <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full">
                100 Agents
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <ActionButton
                variant="outline"
                icon={<HiOutlineFilter size={20} color="#555F6D" />}
                buttonContent="Filter"
              />

              <InvoiceGenerateModal
                // data={data?.data}
                selectedIds={selectedIds}
                selectObject={selectedObjects}
              />
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
              isCheckBox={true}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              setSelectObject={setSelectedObjects}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnrolledApplicantsTable;
