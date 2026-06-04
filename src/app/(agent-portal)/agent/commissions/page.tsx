/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import EnrolledApplicantsTable from "./_assets/components/enrolledApplicantsTable";
import StatCard from "./_assets/components/statCard";
import SubmittedInvoicesTable from "./_assets/components/submittedInvoicesTable";

const commissionInfo = [
  {
    id: 1,
    tag: "Connected Awarding Body",
    amount: "2",
    color: "#1D7C4D",
  },
  {
    id: 2,
    tag: "Application Count",
    amount: "85",
    color: "#F59638",
  },
  {
    id: 3,
    tag: "Estimated Commission",
    amount: "2500",
    color: "#2563EB",
  },
  {
    id: 4,
    tag: `Estimated Clawback`,
    amount: "3500",
    color: "#C53434",
  },
];

const studentInfo = [
  {
    id: 1,
    tag: "Total Students",
    amount: "124",
    progress: "7.3%",
    color: "#1D7C4D",
  },
  {
    id: 2,
    tag: "Enrolled (Active)",
    amount: "30",
    progress: "7.3%",
    color: "#1D7C4D",
  },
  {
    id: 3,
    tag: "Enrolled (First Payment)",
    amount: "2500",
    progress: "7.3%",
    color: "#F59638",
  },

  {
    id: 4,
    tag: `Withdrawn`,
    amount: "20",
    progress: "7.3%",
    color: "#C53434",
  },
];

const Commission = () => {
  return (
    <PageWithBreadcrumb
      items={[{ title: "Home", href: "/agent" }, { title: "Commission" }]}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4 space-6">
        {commissionInfo.map((item) => (
          <StatCard key={item.id} data={item} />
        ))}
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4 space-6">
        {studentInfo.map((item) => (
          <StatCard key={item.id} data={item} />
        ))}
      </div>

      <div className="space-y-6">
        <EnrolledApplicantsTable />

        <SubmittedInvoicesTable />
      </div>
    </PageWithBreadcrumb>
  );
};

export default Commission;
