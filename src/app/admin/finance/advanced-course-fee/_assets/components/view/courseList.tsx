/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import ActionButton from "@/components/common/button/actionButton";
import dateFormat from "@/utils/DateFormatter";
import { StatusWithIcon } from "@/utils/status_point";
import { CourseFeeHistoryModal } from "../modal/CourseHistoryModal";
import { ViewCourseFinanceModal } from "../modal/ViewCourseFinanceModal";
import { EditCourseFinanceModal } from "../modal/EditCourseFinanceModal";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";

interface CourseFinanceResponse {
  id: string;
  courseName: string;
  overallCourseFee: number;
  courseFeeLogHistory: any[];
  tieredPricing: any[];
  startDate: string;
  endDate: string;
  currencyType: string;
  promoCodeStatus: "active" | "inactive" | string;
  createdAt: string;
  updatedAt: string;
}

interface CourseListProps {
  currentPage: number;
  courseDataFinance: CourseFinanceResponse[];
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
  totalPages: number;
  moduleType?: string;
}
const CourseFeeList = ({
  currentPage,
  setCurrentPage,
  courseDataFinance,
  isLoading,
  totalPages,
  moduleType
}: CourseListProps) => {
  return (
    <>
      <DynamicTableWithPagination
        data={courseDataFinance}
        isLoading={isLoading}
        pagination={{
          page: currentPage,
          total: courseDataFinance?.length || 0,
          totalPages,
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "courseName",
              header: "Course Name",
            },
            {
              key: "overallCourseFee",
              header: "Overall Course Fee",
              render: (item) => `$ ${item.overallCourseFee}`,
            },
            // {
            //   key: "overallCourseFee",
            //   header: "Tiered Pricing",
            //   render: (item) => `$ ${item.overallCourseFee}`,
            // },
            {
              key: "validDate",
              header: "Valid Date",
              render: (item) => (
                <>
                  {dateFormat.customFormatDate(item.startDate, "DD-MM-YYYY")} -{" "}
                  {dateFormat.customFormatDate(item.endDate, "DD-MM-YYYY")}
                </>
              ),
            },
            {
              key: "currencyType",
              header: "Currency",
            },
            {
              key: "promoCodeStatus",
              header: "Promo Code Status",
              render: (item) => (
                <StatusWithIcon status={item.promoCodeStatus} />
              ),
            },
            {
              key: "updatedAt",
              header: "Last Update Date",
              render: (item) => dateFormat.localDateTime(item.updatedAt),
            },
            {
              key: "actions",
              header: "Action",
              // className: "pr-4 min-w-[130px] text-right",
              render: (item) => (
                <ResponsiveButtonGroup>
                  <ViewCourseFinanceModal data={item} />
                  <CourseFeeHistoryModal mode={moduleType as string} id={item?.id} />
                  {/* <ActionButton
                      imageSrc={fileDownload}
                      variant="icon"
                      tooltipContent="Download Report"
                  /> */}
                  <EditCourseFinanceModal data={item} moduleType={moduleType}/>
                  {/* View & Update */}
                  {/* <ViewAModal data={code} /> */}
                  {/* <ViewCourseList data={code?.courseList} /> */}

                  {/* Duplicate Module */}

                  {/* Download Module */}
                  {/* <ActionButton
                      imageSrc={fileDownload}
                      tooltipContent="Download Module"
                      variant="icon"
                    /> */}
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
      />
    </>
  );
};

export default CourseFeeList;
