import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Management",
  description: "Course Management",
};

export default function AdminCourseManagement({
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
