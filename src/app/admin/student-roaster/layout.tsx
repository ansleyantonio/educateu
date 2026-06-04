import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Roaster",
  description: "Course Management",
};

export default function StudentRoaster({
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
