import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import PaymentForm from "./_assets/formField/payment_form";

const PaymentHistoryPage = () => {
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Payments",
        },
      ]}
    >
      <h1>Payments</h1>
      <PaymentForm/>
    </PageWithBreadcrumb>
  );
};

export default PaymentHistoryPage;
