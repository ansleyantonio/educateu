"use client";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import CommonSearch from "@/components/common/search/commonSearch";
import formatCurrency from "@/utils/formateCurrency";
import { StatusWithIcon } from "@/utils/status_point";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import CheckStatusModal from "./StatusUpdate/statusUpdateModal";
import { CustomField } from "@/components/common/fields/cusInputField";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import ShareLinkModal from "./shareLink/shareLinkModal";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";

/* eslint-disable @typescript-eslint/no-explicit-any */
const AgentCommissionTable = ({
  isLoading,
  data,
  year,
  searchTerm,
  setSearchTerm,
  sessionId,
  setSessionId,
}: {
  isLoading: boolean;
  data: any;
  year: number;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  sessionId?: string;
  setSessionId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  // State
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const form = useForm({
    defaultValues: {
      sessionId: "",
    },
  });

  const selectedSession = form.watch("sessionId");

  useEffect(() => {
    setSessionId(selectedSession || "");
    setCurrentPage(1);
  }, [selectedSession]);

  // Format currency
  // const formatCurrency = (value: number) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(value);
  // };

  // console.log("applicatin---", data);

  const { options: AcademicSession, isLoading: AcademicSessionLoading } =
    DataFetcher.fetchAcademicSessions();

  // console.log("ACADEMIC SESSIONS", AcademicSession);

  return (
    <>
      {/* Table Header */}
      <div className="flex flex-col gap-4 justify-between items-start p-4 mb-4 bg-gradient-to-r rounded-lg border md:flex-row md:items-center from-slate-50 to-slate-100 border-slate-200">
        <div className="flex flex-col gap-3 items-start md:flex-row md:items-center">
          <div>
            <h1 className="text-lg font-bold leading-6 md:text-xl text-slate-900">
              Agent Payment List
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Year {year || 1} - Commission Details
            </p>
          </div>
          <span className="py-1 px-3 text-xs font-semibold text-blue-800 whitespace-nowrap bg-blue-100 rounded-full">
            {data?.pagination?.total < 2
              ? `${data?.pagination?.total} Agent`
              : `${data?.pagination?.total} Agents`}
          </span>
        </div>

        <div className="flex w-full md:w-auto gap-2 justify-between items-center">
          <CustomField.CommonSearch
            searchText={searchTerm}
            setSearchText={setSearchTerm}
          />
          <Form {...form}>
            <div className="h-full">
              <CustomField.SelectField
                form={form}
                name="sessionId"
                placeholder="Select Session"
                isLoading={AcademicSessionLoading}
                options={AcademicSession}
              />
            </div>
          </Form>
          {/* <div className="w-[60%]">
            
          </div> */}
        </div>
      </div>

      {/* Table Body */}
      <DynamicTableWithPagination
        isCheckBox={false}
        data={data?.data?.agents || []}
        isLoading={isLoading}
        pagination={{
          ...data?.pagination,
          total: data?.pagination?.total || 0,
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "agentName",
              header: "Agent Name",
              render: (item: any) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {item.agentName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.firstName}
                  </span>
                </div>
              ),
            },
            {
              key: "commissionTier",
              header: "Tier",
              render: (item: any) => (
                <StatusWithIcon
                  status={item.commissionTier}
                  showIcon={false}
                  showBg={true}
                />
              ),
            },
            {
              key: "totalStudent",
              header: "Total Students",
              render: (item: any) => (
                <div className=" text-slate-900">{item.totalStudent}</div>
              ),
            },
            {
              key: "potentialCommission",
              header: "Potential Commission",
              render: (item: any) => (
                <div className="text">
                  <span className=" text-slate-900">
                    {formatCurrency(item.potentialCommission || 0)}
                  </span>
                </div>
              ),
            },
            // {
            //   key: "eligibleCommission",
            //   header: "Eligible Commission",
            //   render: (item: any) => (
            //     <div className="text-right">
            //       <span className="font-semibold text-slate-900">
            //         {formatCurrency(item.eligibleCommission)}
            //       </span>
            //     </div>
            //   ),
            // },
            // {
            //   key: "paidCommission",
            //   header: "Paid Commission",
            //   render: (item: any) => (
            //     <div className="text">
            //       <span className="font-semibold text-green-600">
            //         {formatCurrency(item.paidCommission)}
            //       </span>
            //     </div>
            //   ),
            // },
            {
              key: "totalApprovedInvoices",
              header: "Paid Commission",
            },
            // {
            //   key: "status",
            //   header: "Status",
            //   render: (item: any) => (
            //     <span
            //       className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
            //         item.status
            //       )}`}
            //     >
            //       {item.status}
            //     </span>
            //   ),
            // },
            {
              key: "actions",
              header: "Actions",
              render: (item: any) => (
                <ResponsiveButtonGroup>
                  <CheckStatusModal data={item} />
                  <ShareLinkModal data={item} />
                  {/* <CourseFeeHistoryModal data={item} /> */}
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
      />
    </>
  );
};

export default AgentCommissionTable;
