"use client";

import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import FinanceSettingsForm from "./_assets/FinanceSettingsForm";

const FinanceList = () => {
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance Settings", href: "/admin/finance/finance-settings" },
        {
          title: "Create Discount Fee",
        },
      ]}
    >
      <div className="relative my-5">
        <section className="px-4">
          <div className="">
            <FinanceSettingsForm />
          </div>
        </section>
      </div>
    </PageWithBreadcrumb>
  );
};

export default FinanceList;
