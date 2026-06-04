/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { TableCell } from "@/components/ui/custom_ui/table";
import formateCurrency from "@/utils/formateCurrency";
import { StatusWithIcon } from "@/utils/status_point";
import { Award, CheckSquare, FileText, Users } from "lucide-react";
import { useState } from "react";
import InvoiceAction from "./invoiceAction";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import InvoicePaidModal from "./invoicePaidModal";

interface InvoiceDetailsComponentProps {
  agent: any;
  expandedRows: string;
}

const InvoiceDetailsComponent = ({
  agent,
  expandedRows,
}: InvoiceDetailsComponentProps) => {
  const isExpanded = expandedRows == agent?.agentId;
  const form = useForm({
    defaultValues: { sessionId: "" },
  });

  const selectedSession = form.watch("sessionId");

  const { options: AcademicSession } = DataFetcher.fetchAcademicSessions({
    filter: { pageSize: 100 },
  });

  const { data, isLoading } = useFetchData({
    queryKey: ["invoiced-applicants", agent?.agentId, selectedSession],
    path: `commission-payments/user/${agent?.agentId}${
      selectedSession ? `?sessionId=${selectedSession}` : ""
    }`,
    enabled: !!isExpanded,
  });

  // Extract the data array from the API response
  const studentData = data?.data || [];

  // Calculate totals from the student data
  const totalAmount =
    studentData?.reduce(
      (sum: number, item: any) => sum + (item?.totalFee || 0),
      0
    ) || 0;

  const totalStudents = studentData?.length || 0;

  const [selectInvoiceNumber, setSelectInvoiceNumber] = useState<string[]>([]);

  const invoiceIds = studentData
    ?.map((item: any) => item?.invoiceId)
    .filter((id: string) => id && id !== "N/A");

  // Check if all selected
  const isAllSelected =
    invoiceIds?.length > 0 &&
    invoiceIds.every((id: string) => selectInvoiceNumber.includes(id));

  // Toggle all
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectInvoiceNumber([]);
    } else {
      setSelectInvoiceNumber(invoiceIds);
    }
  };

  // Toggle single
  const toggleRow = (invoiceNumber: string) => {
    setSelectInvoiceNumber((prev) =>
      prev.includes(invoiceNumber)
        ? prev.filter((item) => item !== invoiceNumber)
        : [...prev, invoiceNumber]
    );
  };

  // console.log("selectInvoiceNumber----", studentData);

  return (
    <>
      {!isExpanded ? (
        <TableCell colSpan={9} className="p-0 h-0 bg-[#FAFBFF]">
          <div className="overflow-hidden max-h-0 transition-all duration-300"></div>
        </TableCell>
      ) : (
        <TableCell colSpan={9} className="p-0 bg-[#FAFBFF]">
          <div className="overflow-hidden py-2 transition-all duration-300 h-fit lg:max-h-[600px]">
            <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-4">
              {/* Main Content Area */}
              <div className="col-span-3 space-y-4">
                {/*  Invoice Header */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-6 items-center">
                      <div className="flex gap-2 items-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          {/* <h2 className="font-bold text-gray-800"> */}
                          {/*   INV-{agent?.agentId?.slice(-8) || "001"} */}
                          {/* </h2> */}
                          <p className="font-bold text-gray-800 capitalize">
                            {agent?.agentName || "Agent"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center text-sm">
                        <div className="flex gap-1 items-center">
                          <CheckSquare className="w-4 h-4" />
                          <span>{selectInvoiceNumber.length} selected</span>
                        </div>

                        <div className="flex gap-1 items-center">
                          <Users className="w-4 h-4" />
                          <span>{totalStudents} Students</span>
                        </div>

                        <div className="flex gap-1 items-center">
                          <Award className="w-4 h-4" />
                          <span>{agent?.commissionTier || "No Tier"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div>Total:</div>
                      <div className="mr-6 text-lg font-bold text-blue-700">
                        {formateCurrency(totalAmount)}
                      </div>
                      <div>
                        <Form {...form}>
                          <CustomField.SelectField
                            form={form}
                            name="sessionId"
                            placeholder="Select Session"
                            options={AcademicSession}
                          />
                        </Form>
                      </div>
                      <InvoicePaidModal
                        invoiceIds={selectInvoiceNumber}
                        data={data?.data}
                        value="Multiple"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Applications Data */}
                <div className="overflow-x-auto w-full rounded-lg">
                  {/* Table wrapper */}
                  <div className="min-w-[900px]">
                    {/* Header */}
                    <div className="grid grid-cols-8 p-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-t-lg">
                      <div className="flex gap-4 items-center">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                        />
                        <p>Invoice ID</p>
                      </div>
                      <div>Student</div>
                      <div>Received Payment</div>
                      <div>Commission</div>
                      <div>Potential Payout</div>
                      <div>Request Payout</div>
                      <div>Status</div>
                      <div>Action</div>
                    </div>

                    {/* Scrollable Rows */}
                    <ScrollArea className="overflow-y-auto rounded-b-lg max-h-[220px]">
                      {isLoading ? (
                        <div className="p-5 text-center text-gray-500 bg-white min-h-[160px]">
                          <DataLoader />
                        </div>
                      ) : studentData?.length > 0 ? (
                        studentData.map((student: any, index: number) => (
                          <div
                            key={index}
                            className="grid grid-cols-8 text-sm bg-white border-b border-gray-100 hover:bg-blue-50"
                          >
                            <div className="flex gap-4 items-center p-3">
                              <Checkbox
                                checked={selectInvoiceNumber.includes(
                                  student?.invoiceId
                                )}
                                onCheckedChange={() =>
                                  toggleRow(student?.invoiceId)
                                }
                              />
                              {student?.invoiceNumber || "N/A"}
                            </div>

                            <div className="p-3">
                              <div>
                                <p className="text-xs">
                                  {student?.applicantId}
                                </p>

                                <p className="text-xs">{student?.fullName}</p>
                              </div>
                            </div>

                            <div className="p-3 font-semibold text-gray-700">
                              {formateCurrency(student?.paidAmount || 0)}
                            </div>
                            <div className="p-3 font-semibold text-gray-700">
                              {formateCurrency(student?.commissionRate || 0)}
                            </div>

                            <div className="p-3">
                              {formateCurrency(student?.invoiceAmount || 0)}
                            </div>

                            <div className="p-3 text-gray-700">
                              {formateCurrency(student?.potentialPayout || 0)}
                            </div>

                            <div className="p-3">
                              <StatusWithIcon
                                status={student?.invoiceStatus}
                                showBg={true}
                              />
                            </div>

                            <div className="p-3">
                              <InvoicePaidModal
                                status={
                                  selectInvoiceNumber.length > 1 ||
                                  student?.invoiceStatus !== "APPROVED"
                                }
                                invoiceIds={[student?.invoiceId]}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 bg-white">
                          No student data available
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>

              {/* Invoice Actions Sidebar */}
              <div className="col-span-1">
                <InvoiceAction invoiceIds={selectInvoiceNumber} />
              </div>
            </div>
          </div>
        </TableCell>
      )}
    </>
  );
};

export default InvoiceDetailsComponent;
