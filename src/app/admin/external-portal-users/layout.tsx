import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "External Portal Users",
  description: "Course Management",
};

export default function ExternalPortalLayout({
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
