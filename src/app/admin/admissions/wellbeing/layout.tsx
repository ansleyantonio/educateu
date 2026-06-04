import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wellbeing Officer",
  description: "Course Management",
};

export default function WellbeingOfficer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      {/* Page Content */}
      <div className="pr-2 w-full">{children}</div>
    </section>
  );
}
