/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionButton from "@/components/common/button/actionButton";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusWithIcon } from "@/utils/status_point";
import { PromoCodeModal } from "./modal/DiscountFeeModal";
import { CourseFeeHistoryModal } from "./modal/OrderHistoryModal";
import ViewCourseFeeModal from "./view/ViewCertificateCourseFee";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import dateFormat from "@/utils/DateFormatter";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";


interface ModuleProps {
  currentPage: number;
  data: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}

const CertificateCourseFeeList = ({
  data,
  isLoading,
  setCurrentPage,
  currentPage,
}: ModuleProps) => {
  return (
    <>
      <DynamicTableWithPagination
  data={data?.data?.courseList}
  isLoading={isLoading}
  pagination={data?.data?.pagination}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  config={{
    columns: [
      { 
        key: "courseType", 
        header: "Course Type",
        render: () => "PROFESSIONAL"
      },
      { 
        key: "courseName", 
        header: "Course Name" 
      },
      { 
        key: "overallCourseFee", 
        header: "Base Fee (Default)",
        render: (item: any) => `${item?.overallCourseFee} ${item?.currencyType}`
      },
      { 
        key: "startDate", 
        header: "Valid Date" 
      },
      { 
        key: "currencyType", 
        header: "Currency" 
      },
      { 
        key: "promoCodeStatus", 
        header: "Promo Code Status",
        render: (item: any) => <StatusWithIcon status={item?.promoCodeStatus} />
      },
      { 
        key: "updatedAt", 
        header: "Last Updated",
        render: (item: any) => dateFormat.customFormatDate(item?.updatedAt, "YYYY-MM-DD")
      },
      {
        key: "actions",
        header: "Action",
        render: (item: any) => (
          <ResponsiveButtonGroup>
            <ViewCourseFeeModal courseFee={item} />
            <CourseFeeHistoryModal id={item?.id}/>
            <PromoCodeModal data={item} />
            {/* <ActionButton
              imageSrc={fileDownload}
              variant="icon"
              tooltipContent="Download Report"
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

export default CertificateCourseFeeList;
