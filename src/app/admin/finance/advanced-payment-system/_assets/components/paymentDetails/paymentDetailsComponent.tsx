import ActionButton from "@/components/common/button/actionButton";
import dateFormat from "@/utils/DateFormatter";
import {
  default as formatCurrency,
  default as formateCurrency,
} from "@/utils/formateCurrency";
import { ChevronRight, CircleCheck,MessagesSquare } from "lucide-react";
import invitations from "/public/assets/icons/shear.svg";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import publish from "/public/assets/icons/publish.svg";
import { SenderReminderModal } from "../modals/senderReminderModal";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PaymentDetailsComponent = ({ item }: any) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-3">
      <div className="col-span-3 p-3 rounded-md border border-gray-300">
        <h3 className="text-lg font-semibold">Payment Details</h3>

        <div className="grid grid-cols-2 space-y-2">
          {/* Total Fee */}
          <div>
            <p>Total Fee</p>
            <p className="font-semibold">{formateCurrency(item.totalFee)}</p>
          </div>

          {/* Payment Plan */}
          <div>
            <p>Payment Plan</p>

            <p className="font-semibold">Installments (6 months)</p>
          </div>

          {/* Paid Amount */}
          <div>
            <p>Paid Amount</p>
            <div className="flex gap-2 font-semibold">
              <p className="font-semibold">
                {formateCurrency(item.paidAmount)}
              </p>
              <p className="text-blue-500">({item?.installmentsPaid}/6 installments)</p>
            </div>
          </div>

          {/* Next Payment */}
          <div>
            <p>Next Payment</p>
            <p className="font-semibold">
              {formateCurrency(item?.nextPayment?.amount)} ( Due Date:{" "}
              {dateFormat.fullDateTime(new Date(item?.nextPayment?.date), {
                showTime: false,
              })}
              ){" "}
            </p>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="my-3 text-lg font-semibold">Payment History</h3>
          {item?.paymentHistory?.map((history: any, i: number) => (
            <div
              key={history.date}
              className={`grid py-2 gap-2 items-center mb-1 
    grid-cols-1 sm:grid-cols-2 md:grid-cols-4 
    ${i === item?.paymentHistory?.length - 1 ? "border-b-0" : "border-b-2"}`}
            >
              {/* Date & Status Icon */}
              <div className="flex gap-2 items-center">
                <CircleCheck
                  size={22}
                  strokeWidth={2}
                  className="text-white bg-green-500 rounded-full"
                />
                <p className="text-sm font-semibold">
                  {dateFormat.fullDateTime(new Date(history.date), {
                    showTime: false,
                  })}
                </p>
              </div>

              {/* Amount */}
              <p className="text-sm font-semibold">
                {formatCurrency(history.amount)}
              </p>

              {/* Method */}
              <p className="text-sm font-semibold">{history.method}</p>

              {/* Status / Actions */}
              <div className="flex flex-col gap-2 justify-end w-full sm:flex-row">
                {history.status === "Paid" ? (
                  <p className="px-3 text-sm font-semibold text-green-600 bg-green-100 rounded-md border border-green-600 w-fit">
                    {history.status}
                  </p>
                ) : (
                  <>
                    <ActionButton
                      buttonContent="View Slip"
                      variant="outline"
                      btnSize="sm"
                    />
                    <ActionButton
                      buttonContent="Mark as Paid"
                      btnSize="sm"
                      variant="outline"
                      icon={<CircleCheck />}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1 p-3 space-y-2 rounded-md border border-gray-300">
        {/* <DialogWrapper */}

        {/* <ActionButton
          buttonContent="Sender Reminder"
          variant="outline"
          imageSrc={invitations}
          btnStyle="font-semibold text-gray-600 w-full"
          lastIcon={<ChevronRight className="ml-auto" />}
        /> */}
        <SenderReminderModal />
        <ActionButton
          // handleOpen={() => {
          //   setStatus("APPROVED");
          //   form.handleSubmit(onSubmit);
          // }}
          buttonContent="View Documents"
          variant="outline"
          imageSrc={fileView}
          btnStyle="font-semibold text-gray-600 w-full"
          lastIcon={<ChevronRight className="ml-auto" />}
        />
        <ActionButton
          // handleOpen={() => {
          //   setStatus("APPROVED");
          //   form.handleSubmit(onSubmit);
          // }}
          buttonContent="Record Instalment"
          variant="outline"
          imageSrc={publish}
          btnStyle="font-semibold text-gray-600 w-full"
          lastIcon={<ChevronRight className="ml-auto" />}
        />
        <ActionButton
          // handleOpen={() => {
          //   setStatus("APPROVED");
          //   form.handleSubmit(onSubmit);
          // }}
          buttonContent="Contact Applicant"
          variant="outline"
          icon={<MessagesSquare size={24} strokeWidth={2} />}
          btnStyle="font-semibold text-gray-600 w-full"
          lastIcon={<ChevronRight className="ml-auto" />}
        />
      </div>
    </div>
  );
};

export default PaymentDetailsComponent;
