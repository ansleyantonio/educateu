/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import ActionButton from "@/components/common/button/actionButton";
import { StatusWithIcon } from "@/utils/status_point";
import CheckStatusModal from "./StatusUpdate/statusUpdateModal";
import CourseFeeHistoryModal from "./courseFeeHistory/courseFeeHistoryModal";
import PaymentDetailsComponent from "./paymentDetails/paymentDetailsComponent";
import ShareLinkModal from "./shareLink/shareLinkModal";

interface ApplicantPaymentTableProps {
  data: any;
  isLoading: boolean;
  setCurrentPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
  onSelectionChange?: (
    selectedCount: number,
    selectedApplicants: any[]
  ) => void;
}

const ApplicantPaymentTable = ({
  data,
  isLoading,
  setCurrentPage,
  currentPage,
  totalPages,
  onSelectionChange,
}: ApplicantPaymentTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]); 
  const [selectedApplicants, setSelectedApplicants] = useState<any[]>([]); 
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds.length, selectedApplicants);
    }
  }, [selectedIds, selectedApplicants, onSelectionChange]);

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <>
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
        data={data?.data?.data}
        isLoading={isLoading}
        pagination={data?.data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            { key: "applicantId", header: "Applicant ID" },
            { key: "firstName", header: "Full Name" },
            { key: "course", header: "Course" },
            { key: "paymentPlan", header: "Payment Plan" },
            {
              key: "paymentStatus",
              header: "Payment Status",
              render: (item: any) => (
                <StatusWithIcon status={item?.paymentStatus} />
              ),
            },
            { key: "dueDate", header: "Due Date" },
            { key: "lastReminder", header: "Last Reminder" },
            {
              key: "actions",
              header: "Action",
              render: (item: any) => (
                <ResponsiveButtonGroup>
                  <CheckStatusModal data={item} />
                  <ShareLinkModal data={item} />
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
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
        isCheckBox 
        selectedIds={selectedIds} 
        setSelectedIds={setSelectedIds}
        setSelectObject={setSelectedApplicants}
        renderExpandedRow={(item) =>
          expandedRows.has(item.id) ? (
            <div className="p-4 bg-[#FAFBFF] rounded-md transition-all duration-300">
              <PaymentDetailsComponent item={item} />
            </div>
          ) : null
        }
      />
    </>
  );
};

export default ApplicantPaymentTable;