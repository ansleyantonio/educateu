import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import ActionButton from "@/components/common/button/actionButton";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import { CustomField } from "@/components/common/fields/cusInputField";
import CusPagination from "@/components/common/pagination/paginations";
import CommonSearch from "@/components/common/search/commonSearch";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/table";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import CourseFeeHistoryModal from "../courseFeeHistory/courseFeeHistoryModal";
import ShearLinkModal from "../shareLink/shareLinkModal";
import InvoiceDetailsComponent from "./invoiceDetails";

/* eslint-disable @typescript-eslint/no-explicit-any */
const InvoiceVerificationTable = () => {
  // State
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  //  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  // const [selectApplicant, setSelectApplicant] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<string>("");
  const [searchTerm, setSearchText] = useState("");
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    queryKey: "commission-payments",
    path: "commission-payments/invoices/agents",
    filterData: { limit: limit, page: currentPage, searchTerm },
  });

  // Toggle Expand
  const toggleExpand = (id: string) => {
    if (expandedRows === id) {
      setExpandedRows("");
    } else {
      setExpandedRows(id);
    }
  };

  console.log("data----", data?.data);
  return (
    <>
      {/* Table Header */}
      <div className="flex justify-between items-center p-3">
        <div className="flex gap-2 items-center">
          <h1 className="text-lg font-bold leading-6 text-[#000000] p">
            Agent Commission Payment List
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

          <CommonSearch searchText={searchTerm} setSearchText={setSearchText} />
        </div>
      </div>

      {/* <AnimatePresence> */}
      {/*   {selectedRows.size > 0 && ( */}
      {/*     <motion.p */}
      {/*       initial={{ opacity: 0, y: -5 }} */}
      {/*       animate={{ opacity: 1, y: 0 }} */}
      {/*       exit={{ opacity: 0, y: -5 }} */}
      {/*       transition={{ duration: 0.2 }} */}
      {/*       className="pl-4 mb-4 text-sm text-gray-500" */}
      {/*     > */}
      {/*       Selected Applicants: {selectedRows.size} */}
      {/*     </motion.p> */}
      {/*   )} */}
      {/* </AnimatePresence> */}

      {/* Table Body */}
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead className="pl-3 w-[30px]"> */}
            {/*   <Checkbox */}
            {/*     checked={isAllSelected} */}
            {/*     onCheckedChange={toggleSelectAll} */}
            {/*   /> */}
            {/* </TableHead> */}
            <TableHead>Agent Name</TableHead>
            {/* <TableHead>Commission Tier</TableHead> */}
            <TableHead>Total Student </TableHead>
            {/* <TableHead>Academic Session</TableHead> */}
            <TableHead>Potential Payout</TableHead>
            <TableHead>Requested Payout</TableHead>
            <TableHead>Clawback</TableHead>
            {/* <TableHead>Status</TableHead> */}
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/*Loading*/}
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <div className="min-h-[250px]">
                  <DataLoader />
                </div>
              </TableCell>
            </TableRow>
          ) : data?.pagination?.total === 0 ? (
            // No Data
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <div className="min-h-[250px]">
                  <NoDataComponent />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data?.data?.map((item: any) => (
              // Main Row
              <React.Fragment key={item?.id}>
                {/* Main row */}
                <TableRow>
                  {/* <TableCell className="py-5 pl-3 w-[30px]"> */}
                  {/*   <Checkbox */}
                  {/*     checked={selectedRows.has(item.id)} */}
                  {/*     onCheckedChange={(checked) => toggleRow(!!checked, item)} */}
                  {/*   /> */}
                  {/* </TableCell> */}
                  <TableCell>{item?.agentName}</TableCell>
                  {/* <TableCell>{item?.commissionTier}</TableCell> */}
                  <TableCell className="max-w-[80px] truncate">
                    {item?.totalStudent}
                  </TableCell>
                  {/* <TableCell>{item?.academicSession}</TableCell> */}
                  <TableCell>{item?.potentialCommission}</TableCell>
                  <TableCell>{item?.potentialCommission}</TableCell>

                  <TableCell>{item?.clawback}</TableCell>
                  {/* <TableCell>
                    <StatusWithIcon status={item?.status} />
                  </TableCell> */}
                  <TableCell>
                    <ResponsiveButtonGroup>
                      {/* <CheckStatusModal data={item} /> */}
                      <ShearLinkModal data={item} />
                      <CourseFeeHistoryModal data={item} />
                      <ActionButton
                        tooltipContent="View Payment Details"
                        variant="icon"
                        icon={
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${
                              expandedRows == item?.agentId ? "rotate-180" : ""
                            }`}
                            strokeWidth={3}
                          />
                        }
                        handleOpen={() => toggleExpand(item?.agentId)}
                      />{" "}
                    </ResponsiveButtonGroup>
                  </TableCell>
                </TableRow>

                {/* Collapsed row */}
                <TableRow>
                  <InvoiceDetailsComponent
                    agent={item}
                    expandedRows={expandedRows}
                  />
                </TableRow>
              </React.Fragment>
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

export default InvoiceVerificationTable;
