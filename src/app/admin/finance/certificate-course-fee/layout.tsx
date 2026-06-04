import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EducateU | Finance",
  description: "Finance Management",
};

export default function AdminFinance({
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
