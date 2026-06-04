import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Settings",
  description: "Setting up system configurations",
};

export default function SystemLayout({
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
