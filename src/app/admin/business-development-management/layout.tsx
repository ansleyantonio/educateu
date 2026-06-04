// export default function DevelopmentLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <section className="mr-6">{children}</section>;
// }

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Development Management",
  description: "Business Development Management",
};

export default function DevelopmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      {/* Page Content */}
      <div className=" w-full">{children}</div>
    </section>
  );
}
