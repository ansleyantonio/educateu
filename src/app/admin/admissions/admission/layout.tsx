import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications",
  description: "Finance Management",
};

export default function AdminApplications({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      <div>{children}</div>
    </section>
  );
}
