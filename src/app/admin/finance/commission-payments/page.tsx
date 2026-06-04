"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { useState } from "react";
import ProgressInfoCard from "../_assets/components/progressInfoCard";
import {
  TabButton,
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/primary_tabs";
import InvoiceVerificationTable from "./_assets/components/InvoiceVerification/invoiceVerificationTable";
import PaymentHistoryTable from "./_assets/components/PaymentHistory/paymentHistoryTable";

const CommissionPaymentPage = () => {
  const [isValue, setIsValue] = useState("invoiceVerification");

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Commission Payments",
        },
      ]}
    >
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4">
        {demoData.map((item) => (
          <ProgressInfoCard key={item.id} data={item} />
        ))}
      </div>

      <div className="rounded-md border shadow-md border-1 border-[#EAEAEA]">
        <Tabs defaultValue={isValue}>
          <TabsList>
            <TabButton
              value="invoiceVerification"
              label="Invoice Verification"
              onClick={setIsValue}
            />
            <TabButton
              value="paymentHistory"
              label="Payment History"
              onClick={setIsValue}
            />
            {/* <TabButton */}
            {/*   value="ClawbackMonitoring" */}
            {/*   label="Clawback Monitoring" */}
            {/*   onClick={setIsValue} */}
            {/* /> */}
          </TabsList>

          <hr />
          {/* content */}
          <TabsContent value="invoiceVerification">
            <InvoiceVerificationTable />
          </TabsContent>
          <TabsContent value="paymentHistory">
            <PaymentHistoryTable />
          </TabsContent>
          {/* <TabsContent value="ClawbackMonitoring"> */}
          {/*   <CommissionPaymentTable data={data} /> */}
          {/* </TabsContent> */}
        </Tabs>
      </div>
    </PageWithBreadcrumb>
  );
};

export default CommissionPaymentPage;

const demoData = [
  {
    id: 1,
    tag: "Total Agent",
    amount: "436789021345",
    progress: "84%",
  },
  {
    id: 2,
    tag: "Pending Invoice",
    amount: "25044",
    progress: "84%",
  },
  {
    id: 3,
    tag: "Approved Payments",
    amount: "250",
    progress: "84%",
  },

  {
    id: 4,
    tag: `Potential Clawbacks`,
    amount: "250",
    progress: "84%",
  },
];
