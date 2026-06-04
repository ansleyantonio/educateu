import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrollment Management",
  description: "Course Management",
};

export default function EnrollmentLayout({
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
