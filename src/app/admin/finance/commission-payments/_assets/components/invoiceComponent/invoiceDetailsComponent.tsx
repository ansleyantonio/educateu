import dateFormat from "@/utils/DateFormatter";
import formateCurrency from "@/utils/formateCurrency";
import InvoiceAction from "./invoiceAction";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";

/* eslint-disable @typescript-eslint/no-explicit-any */
const InvoiceDetailsComponent = ({ item }: any) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-3 lg:grid-cols-4">
      <div className="col-span-3 p-3 rounded-md border border-gray-300">
        {/* Invoice Details */}
        <div className="flex justify-between py-3 mb-3 border-b border-gray-300">
          <div>
            <h3 className="text-lg font-semibold">Invoice {item.invoiceId}</h3>
            <p className="text-gray-500">{item.firstName}</p>
          </div>
          <div className="flex gap-5">
            <div>
              <h3 className="text-gray-500">Submission Date</h3>
              <h3 className="font-semibold">
                {" "}
                {dateFormat.fullDateTime(new Date(2023, 5, 30), {
                  showTime: false,
                })}
              </h3>
            </div>

            <div>
              <h3 className="text-gray-500">Total Amount</h3>
              <h4 className="font-semibold">
                {formateCurrency(item.totalFee)}
              </h4>
            </div>

            <div>
              <h3 className="text-gray-500">Academic Session</h3>
              <h4 className="font-semibold">Full 2023</h4>
            </div>

            <div>
              <h3 className="text-gray-500">Student Claimed</h3>
              <h4 className="font-semibold">98</h4>
            </div>
          </div>
        </div>

        {/* Payment History Data */}
        <div className="mt-6">
          <div className="overflow-x-auto rounded-sm">
            {/* Header */}
            <div className="grid grid-cols-5 p-3 text-sm font-medium text-gray-700 bg-gray-100 md:text-base">
              <div>Student ID</div>
              <div>Requested Payout</div>
              <div>Status</div>
              <div>Commission</div>
              <div>Flags</div>
            </div>

            {/* Payment History */}
            <ScrollArea className="overflow-y-auto max-h-[200px]">
              {item?.paymentHistory?.map((history: any, i: number) => (
                <div
                  key={i}
                  className={`grid grid-cols-5 border-b border-dashed text-sm bg-white md:text-base transition`}
                >
                  <div className="p-3 font-medium text-gray-800">
                    {history.applicantId} ID-3456
                  </div>
                  <div className="p-3 text-gray-600">
                    {formateCurrency(history.amount)}
                  </div>
                  <div
                    className={`p-3  font-semibold ${
                      history.status.toLowerCase() === "paid"
                        ? "text-green-600"
                        : history.status === "Pending" ||
                            history.status === "withdrawn"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {history.status}
                  </div>
                  <div className="p-3 text-gray-600">
                    {formateCurrency(history.commission)}
                  </div>
                  <div className="p-3 text-gray-500">
                    {history.flags ?? "--"}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Invoice Actions */}
      <div className="col-span-1 p-3 rounded-md border border-gray-300">
        <InvoiceAction />
      </div>
    </div>
  );
};

export default InvoiceDetailsComponent;
