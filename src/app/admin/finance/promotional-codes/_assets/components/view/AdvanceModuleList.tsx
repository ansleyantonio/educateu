/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ActionButton from "@/components/common/button/actionButton";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import dateFormat from "@/utils/DateFormatter";
import { StatusWithIcon } from "@/utils/status_point";
import { ViewAModal } from "../modal/viewAdvanceModal";
import { ViewCourseList } from "../modal/viewCoureList";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";

interface PromotionalCodeListProps {
  currentPage: number;
  PromotionalCodeData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}
const PromotionalCodeList = ({
  currentPage,
  setCurrentPage,
  PromotionalCodeData,
  isLoading,
}: PromotionalCodeListProps) => {
  return (
    <>
      <DynamicTableWithPagination
        isCheckBox={false}
        data={PromotionalCodeData?.data?.promotionalCodes || []}
        isLoading={isLoading}
        pagination={PromotionalCodeData?.data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "codeName",
              header: "Promo Code Name",
              render: (code: any) => (
                <span className="text-blue-500 capitalize">
                  {code.codeName}
                </span>
              ),
            },
            {
              key: "discountValue",
              header: "Discount Value",
            },
            {
              key: "validDate",
              header: "Valid Date",
              render: (code: any) => (
                <>
                  {dateFormat.customFormatDate(code.startDate, "DD-MM-YYYY")} /{" "}
                  {dateFormat.customFormatDate(code.endDate, "DD-MM-YYYY")}
                </>
              ),
            },
            {
              key: "createdUser",
              header: "Created User",
            },
            {
              key: "status",
              header: "Status",
              render: (code: any) => <StatusWithIcon status={code.status} />,
            },
            {
              key: "updatedAt",
              header: "Last Update Date",
              render: (code: any) => dateFormat.fullDateTime(code.updatedAt),
            },
            {
              key: "actions",
              header: "Action",
              render: (code: any) => (
                <div className="flex gap-2 justify-start">
                  {/* View & Update */}
                  <ViewCourseList data={code?.courseList} />
                  {/* Download Module */}
                  <ActionButton
                    imageSrc={fileDownload}
                    tooltipContent="Download Module"
                    variant="icon"
                  />
                  <ViewAModal data={code} />
                </div>
              ),
            },
          ],
        }}
      />
    </>
  );
};

export default PromotionalCodeList;
