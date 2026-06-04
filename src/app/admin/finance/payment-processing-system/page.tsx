import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";

const PaymentProcessingSystemPage = () => {
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Course Management" },
        {
          title: "Certificate Course Fee List",
        },
      ]}
    >
      <h1>PaymentProcessingSystem</h1>
    </PageWithBreadcrumb>
  );
};

export default PaymentProcessingSystemPage;
