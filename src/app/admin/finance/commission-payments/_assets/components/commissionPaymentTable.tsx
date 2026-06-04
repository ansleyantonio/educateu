"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import CommonSearch from "@/components/common/search/commonSearch";
import { StatusWithIcon } from "@/utils/status_point";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CheckStatusModal from "./StatusUpdate/statusUpdateModal";
import CourseFeeHistoryModal from "./courseFeeHistory/courseFeeHistoryModal";
import InvoiceDetailsComponent from "./invoiceComponent/invoiceDetailsComponent";
import ShearLinkModal from "./shareLink/shareLinkModal";
import { TableCell, TableRow } from "@/components/ui/custom_ui/table";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CommissionPaymentTable = ({ data }: { data: any }) => {
  // State
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectApplicant, setSelectApplicant] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchText] = useState("");
  const [limit, setLimit] = useState("10");

  const { data: no, isLoading } = useFetchData({
    queryKey: "commission-payments",
    path: "commission-payments",
    filterData: { limit: limit, page: currentPage, searchTerm },
  });

  // Toggle Expand
  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Handle select object update
  const handleSetSelectObject = (applicants: any[]) => {
    setSelectApplicant(applicants);
  };

  // Prepare pagination data
  const paginationData = {
    page: currentPage,
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 1,
  };

  return (
    <>
      <div className="flex justify-between items-center p-3">
        <div className="flex gap-2 items-center">
          <h1 className="text-lg font-bold leading-6 text-[#000000] p">
            Applicant Payment List
          </h1>
          <p className="py-1 px-3 text-xs bg-blue-100 rounded-full">
            {data?.pagination?.totalItems} Applicants
          </p>
        </div>

        <div className="flex gap-2 space-y-2 md:space-y-0">
          <CustomField.LimitField
            setLimit={setLimit}
            setCurrentPage={setCurrentPage}
          />

          <CommonSearch searchText={searchTerm} setSearchText={setSearchText} />
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="pl-4 mb-4 text-sm text-gray-500"
          >
            Selected Applicants: {selectedIds.length}
          </motion.p>
        )}
      </AnimatePresence>

      <DynamicTableWithPagination
        data={data?.data || []}
        isLoading={isLoading}
        pagination={paginationData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        setSelectObject={handleSetSelectObject}
        isCheckBox
        config={{
          columns: [
            {
              key: "applicantId",
              header: "Applicant ID",
              className: "pl-3",
            },
            {
              key: "firstName",
              header: "First Name",
            },
            {
              key: "course",
              header: "Course",
              className: "max-w-[80px] truncate",
              render: (item: any) => (
                <span title={item?.course}>{item?.course}</span>
              ),
            },
            {
              key: "paymentPlan",
              header: "Payment Plan",
            },
            {
              key: "paymentStatus",
              header: "Payment Status",
              render: (item: any) => (
                <StatusWithIcon status={item?.paymentStatus} />
              ),
            },
            {
              key: "dueDate",
              header: "Due Date",
            },
            {
              key: "lastReminder",
              header: "Last Reminder",
            },
            {
              key: "actions",
              header: "Action",
              className: "pr-4 text-right",
              render: (item: any) => (
                <div className="flex flex-wrap gap-2 justify-end">
                  <CheckStatusModal data={item} />
                  <ShearLinkModal data={item} />
                  <CourseFeeHistoryModal data={item} />
                  <ActionButton
                    tooltipContent="View Payment Details"
                    variant="icon"
                    icon={
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-300 ${
                          expandedRows.has(item.id) ? "rotate-180" : ""
                        }`}
                        strokeWidth={3}
                      />
                    }
                    handleOpen={() => toggleExpand(item.id)}
                  />
                </div>
              ),
            },
          ],
          // Custom row rendering to include expandable content
          renderExpandableRow: (item: any) => (
            <>
              {/* Collapsed row */}
              <TableRow>
                <TableCell colSpan={9} className="p-0 h-0 bg-[#FAFBFF]">
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      expandedRows.has(item.id)
                        ? "h-fit lg:max-h-[500px] py-4"
                        : "max-h-0"
                    }`}
                  >
                    <InvoiceDetailsComponent item={item} />
                  </div>
                </TableCell>
              </TableRow>
            </>
          ),
        }}
      />
    </>
  );
};

export default CommissionPaymentTable;