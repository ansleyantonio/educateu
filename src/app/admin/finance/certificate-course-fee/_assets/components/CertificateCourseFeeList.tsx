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
      <Table>
        <TableHeader>
          <TableRow className="border-t bg-[#F5F7F9] border-[#EAEDF0]">
            <TableHead className="pl-4">Course Type</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Base Fee (Default)</TableHead>
            <TableHead>Valid Date</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Promo Code Status</TableHead>
            <TableHead>Last Updated Date</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="min-h-[250px]">
                <DataLoader />
              </TableCell>
            </TableRow>
          ) : data?.data?.courses?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="min-h-[250px] py-40">
                <NoDataComponent />
              </TableCell>
            </TableRow>
          ) : (
            data?.data?.courses?.map((item: any) => (
              <TableRow className="" key={item?.id}>
                <TableCell className="pl-4">{item?.courseType}</TableCell>
                <TableCell>{item?.courseName}</TableCell>
                <TableCell>{item?.baseFee}</TableCell>
                <TableCell>{item?.validDate}</TableCell>
                <TableCell>{item?.currency}</TableCell>
                <TableCell>
                  <StatusWithIcon status={item?.promoCodeStatus} />
                </TableCell>
                <TableCell>{item?.lastUpdatedDate}</TableCell>
                <TableCell className="pr-4 min-w-[130px]">
                  <ResponsiveButtonGroup>
                    <ViewCourseFeeModal courseFee={item} />

                    <CourseFeeHistoryModal/>
                    <PromoCodeModal/>

                    <ActionButton
                      imageSrc={fileDownload}
                      variant="icon"
                      tooltipContent="Download Report"
                    />
                  </ResponsiveButtonGroup>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {data?.pagination?.totalPages > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                <CusPagination
                  totalPages={data?.pagination?.totalPages || 1}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </>
  );
};

export default CertificateCourseFeeList;
